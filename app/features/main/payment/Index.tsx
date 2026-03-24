"use client";

import { useEffect, useMemo, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Banknote, ChevronLeft, ChevronRight, QrCode } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "@/app/components/ui/toast/use-toast";

import { useMenu } from "@/app/context/MenuContext";
import { getCookie } from "@/libs/cookie";
import { apiDelete, apiGet, apiPost } from "@/services/common";
import { checkout } from "@/services/stripe";
import { Bill, BillUpdateFromSignalR } from "@/types/billType";
import {
  EBillStatus,
  EHttpStatusCode,
  EOrderStatus,
  EPaymentMethod,
  EServiceRequestStatus,
  EServiceRequestType,
} from "@/types/enum";
import {
  OrderGroupResponse,
  OrderGroupWithMenuMapping,
  OrderUpdateFromSignalR,
} from "@/types/orderType";
import {
  ServiceRequestFromSignalR,
  ServiceRequestResponse,
} from "@/types/serviceRequestType";

import WaitingModal from "./components/WaitingModal";

const PaymentRender = () => {
  const { mapOrderItemsToOrderMenuItems } = useMenu();

  const [paymentMethod, setPaymentMethod] = useState<EPaymentMethod>(
    EPaymentMethod.PROMPTPAY
  );
  const [rawOrders, setRawOrders] = useState<OrderGroupResponse[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);

  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [showWaitingModal, setShowWaitingModal] = useState<boolean>(false);
  const [requestService, setRequestService] =
    useState<ServiceRequestResponse | null>(null);

  const fetchOrders = async () => {
    const response = await apiGet(
      `/orders?status=${EOrderStatus.COMPLETED}&status=${EOrderStatus.COOKING}`
    );
    setRawOrders(response?.data ?? []);
  };

  const fetchBill = async () => {
    const response = await apiGet(`/bill`);
    const billData = response?.data ?? null;
    setBill(billData);

    if (billData?.status === EBillStatus.PAID) {
      return redirect(`/payment/success?bill_id=${billData.id}`);
    } else if (billData?.status === EBillStatus.COMPLETED) {
      return redirect(`/thank-you`);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBill();

    const accessToken = getCookie("accessToken");

    const connect = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_BASE_API_URL}/hubs/ordering`, {
        accessTokenFactory: () => `${accessToken}`,
      })
      .withAutomaticReconnect()
      .build();
    connect
      .start()
      .catch((err) =>
        console.error("Error while connecting to SignalR Hub:", err)
      );

    connect.on("bill_status_updated", (updatedBill: BillUpdateFromSignalR) => {
      if (bill && updatedBill.resource.id === bill.id) {
        if (updatedBill.status === EBillStatus.PAID) {
          return redirect(`/payment/success?bill_id=${bill.id}`);
        } else if (updatedBill.status === EBillStatus.COMPLETED) {
          return redirect("/thank-you");
        }
      }
    });

    connect.on(
      "order_status_updated",
      async (updatedOrder: OrderUpdateFromSignalR) => {
        if (
          completedOrders.find((order) => order.id === updatedOrder.resource.id)
        )
          return;

        const res = await apiGet(`/orders/${updatedOrder.resource.id}`);
        const order = res?.data ?? null;

        if (!order) return;

        const newCompletedOrder: OrderGroupResponse = {
          id: order.id,
          create_time: order.create_time,
          update_time: order.update_time,
          items: order.items,
          status: order.status,
        };
        setRawOrders((prevOrders) => [...prevOrders, newCompletedOrder]);
      }
    );

    return () => {
      connect.stop();
    };
  }, []);

  const completedOrders: OrderGroupWithMenuMapping[] = useMemo(() => {
    return rawOrders.map((order: OrderGroupResponse) => ({
      id: order.id,
      items: mapOrderItemsToOrderMenuItems(order.items),
      status: order.status,
      create_time: order.create_time,
      update_time: order.update_time,
    }));
  }, [rawOrders, mapOrderItemsToOrderMenuItems]);

  // Calculate totals for food (only completed and cooking items)
  const foodTotalItems = rawOrders.reduce(
    (acc, order) => acc + (order.items[0]?.quantity ?? 0),
    0
  );
  const foodTotalPrice = rawOrders.reduce(
    (acc, order) =>
      acc +
      (order.items[0]?.price_snapshot ?? 0) * (order.items[0]?.quantity ?? 0),
    0
  );

  const handlePay = () => {
    if (completedOrders.length === 0) return;
    if (!bill) return;

    if (paymentMethod === EPaymentMethod.CASH) {
      createServiceRequest(EServiceRequestType.CASH_PAYMENT);
      return;
    } else if (paymentMethod === EPaymentMethod.PROMPTPAY) {
      checkout(foodTotalPrice, bill);
    } else {
    }
  };

  const handleCallWaiter = async () => {
    createServiceRequest(EServiceRequestType.CALL_WAITER);
  };

  const createServiceRequest = async (reason: EServiceRequestType) => {
    try {
      const res = await apiPost(`/requests`, {
        reason,
      });

      if (res && res.statusCode === EHttpStatusCode.CREATED) {
        const accessToken = getCookie("accessToken");

        const connect = new signalR.HubConnectionBuilder()
          .withUrl(`${process.env.NEXT_PUBLIC_BASE_API_URL}/hubs/ordering`, {
            accessTokenFactory: () => `${accessToken}`,
          })
          .withAutomaticReconnect()
          .build();
        connect
          .start()
          .catch((err) =>
            console.error("Error while connecting to SignalR Hub:", err)
          );
        setConnection(connect);
        connect.on(
          "service_request_status_updated",
          (updatedRequest: ServiceRequestFromSignalR) => {
            if (updatedRequest.id === requestService?.id) {
              if (updatedRequest.status === EServiceRequestStatus.CANCELLED) {
                setShowWaitingModal(false);
                connection?.stop();
                setConnection(null);
                setRequestService(null);
                return;
              }
              setRequestService(updatedRequest);
            }
          }
        );

        setRequestService(res.data);
        setShowWaitingModal(true);
      }
    } catch (error) {
      console.error("Error while creating service request:", error);
      toast({
        icon: "ToastError",
        variant: "error",
        description: "Failed to create service request.",
      });
    }
  };

  const handleWaitingModalCancel = () => {
    if (requestService) {
      apiDelete(`/requests/${requestService.id}`);
    }

    handleWaitingModalClose();
  };

  const handleWaitingModalClose = () => {
    setShowWaitingModal(false);
    connection?.stop();
    setConnection(null);
    setRequestService(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col pb-[80px] overflow-y-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Payment</h1>
        </div>
        {bill?.table.name && (
          <div className="bg-[var(--primary-orange-main)] px-4 py-2 rounded-lg">
            <p className="text-sm font-bold text-white">
              Table {bill.table.name}
            </p>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-hidden flex flex-col px-4 pt-4">
        {completedOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
            <p className="text-lg font-medium">No completed orders.</p>
            <Link
              href="/menu"
              className="text-[var(--primary-orange-main)] font-semibold hover:underline"
            >
              Go to Menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-4">
            {/* My Order Section */}
            <section className="bg-white mt-2 px-4 py-4">
              <h2 className="text-lg font-bold mb-4 text-black">My Order</h2>

              <div className="space-y-6">
                {completedOrders.map((order) => {
                  const item = order.items?.[0];
                  if (!item) return null;

                  return (
                    // Using nested index/id for key since multiple orders might have same order IDs if we reused logic
                    <div
                      key={`${order.id}`}
                      className="flex justify-between items-start border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex gap-3">
                        {/* Quantity Badge */}
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full border border-[var(--primary-orange-main)] text-[var(--primary-orange-main)] flex items-center justify-center text-xs font-semibold">
                            {item.quantity}
                          </div>
                        </div>

                        {/* order Details */}
                        <div className="flex flex-col">
                          <span className="text-base text-black font-medium leading-tight">
                            {item.name}
                          </span>
                          {/* Notes */}
                          <span className="text-xs text-gray-400 mt-1">
                            {item.note}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="font-medium text-black">
                        ฿{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-2 bg-white px-4 py-4">
              <div className="flex justify-between items-center text-lg font-medium text-[var(--primary-orange-main)]">
                <div className="flex items-center gap-2">
                  <Banknote size={20} />
                  <span>Total</span>
                </div>
                <span>฿{foodTotalPrice.toFixed(2)}</span>
              </div>
            </section>

            {/* Separator */}
            <div className="h-2 bg-gray-100"></div>

            {/* Payment Method Section */}
            <section className="bg-white px-4 py-4">
              <h2 className="text-lg font-bold mb-4 text-black">
                Payment Method
              </h2>

              {/* Payment Method Selector */}
              <div className="divide-y divide-gray-100">
                {/* PromptPay Option */}
                <div
                  onClick={() => setPaymentMethod(EPaymentMethod.PROMPTPAY)}
                  className={`flex items-center justify-between py-3 cursor-pointer ${
                    paymentMethod !== EPaymentMethod.PROMPTPAY
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {/* Using QrCode icon as generic placeholder for PromptPay logo */}
                      <QrCode className="text-blue-600" size={24} />
                    </div>
                    <span className="text-base font-medium text-gray-700">
                      PromptPay
                    </span>
                  </div>
                  <div className="flex items-center">
                    {paymentMethod === EPaymentMethod.PROMPTPAY && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    )}
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>

                {/* Cash Option */}
                <div
                  onClick={() => setPaymentMethod(EPaymentMethod.CASH)}
                  className={`flex items-center justify-between py-3 cursor-pointer border-t border-gray-100 ${
                    paymentMethod !== EPaymentMethod.CASH ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Banknote className="text-green-600" size={24} />
                    </div>
                    <span className="text-base font-medium text-gray-700">
                      Cash
                    </span>
                  </div>
                  <div className="flex items-center">
                    {paymentMethod === EPaymentMethod.CASH && (
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    )}
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer Actions - Only show if there are items */}
      {completedOrders.length > 0 && (
        <div className="px-4 pb-4 bg-gray-50">
          <div className="bg-white p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">
                Total {foodTotalItems} items
              </span>
              <span className="text-2xl font-bold text-[var(--primary-orange-main)]">
                ฿{foodTotalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Pay Button */}
              <button
                onClick={handlePay}
                className="w-full bg-[var(--primary-orange-main)] text-white py-3 rounded-lg font-bold flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all"
              >
                Pay Now
              </button>

              {/* Call Waiter - Secondary Action */}
              <button
                onClick={handleCallWaiter}
                className="w-full text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Call Waiter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Waiter - Secondary Action */}
      {completedOrders.length === 0 && (
        <div className="px-4 pb-4 bg-gray-50 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCallWaiter}
                className="w-full text-white text-sm font-medium py-2 rounded-lg bg-[var(--primary-orange-main)] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Call Waiter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Modal */}
      {requestService && (
        <WaitingModal
          isOpen={showWaitingModal}
          onCancel={handleWaitingModalCancel}
          onClose={handleWaitingModalClose}
          requestStatus={requestService.status}
        />
      )}
    </div>
  );
};

export default PaymentRender;
