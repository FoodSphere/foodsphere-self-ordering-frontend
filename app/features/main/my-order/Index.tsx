"use client";

import { useEffect, useMemo, useState } from "react";
import * as signalR from "@microsoft/signalr";
import Link from "next/link";

import ConfirmationModal from "@/app/components/ConfirmationModal";
import OrderCustomizationModal from "@/app/components/OrderCustomizationModal";
import { getCookie } from "@/libs/cookie";
import { apiGet, apiPut } from "@/services/common";
import { CartItem } from "@/types/cartType";
import { EBillStatus, EOrderStatus, EOrderStatusString, OrderStatus } from "@/types/enum";
import {
  OrderCreatedFromSignalR,
  OrderGroupResponse,
  OrderGroupWithMenuMapping,
  OrderItem,
  OrderItemPutRequest,
  OrderMenuItem,
  OrderUpdateFromSignalR,
} from "@/types/orderType";

import MyOrderGroupCard from "../../../components/MyOrderGroupCard";
import OrderStatusTabs from "../../../components/OrderStatusTabs";
import { Bill } from "@/types/billType";
import { redirect } from "next/navigation";

const orderStatusMap: OrderStatus = {
  [EOrderStatusString.ALL]: EOrderStatus.ALL,
  [EOrderStatusString.PENDING]: EOrderStatus.PENDING,
  [EOrderStatusString.COOKING]: EOrderStatus.COOKING,
  [EOrderStatusString.COMPLETED]: EOrderStatus.COMPLETED,
  [EOrderStatusString.CANCELLED]: EOrderStatus.CANCELLED,
};

const MyOrderRender = () => {
  const [myOrders, setMyOrders] = useState<OrderGroupWithMenuMapping[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);

  const [selectedOrderGroupId, setSelectedOrderGroupId] = useState<
    number | null
  >(null);
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<OrderMenuItem | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<EOrderStatusString>(
    EOrderStatusString.ALL
  );

  const filteredOrders = useMemo(() => {
    if (activeTab === EOrderStatusString.ALL) {
      return myOrders;
    }
    const targetStatus = orderStatusMap[activeTab];
    return myOrders.filter((item) => item.status === targetStatus);
  }, [myOrders, activeTab]);

  const mapOrderItemsToOrderMenuItems = async (
    orderItems: OrderItem[]
  ): Promise<OrderMenuItem[]> => {
    const promises = orderItems.map(async (orderItem) => {
      const response = await apiGet(`/menus/${orderItem.menu_id}`);
      const menu = response?.data ?? null;
      if (menu) {
        return {
          id: orderItem.id,
          menu_id: orderItem.menu_id,
          name: menu.name,
          image_url: menu.image_url,
          note: orderItem.note ?? null,
          quantity: orderItem.quantity,
          price: menu.price,
          description: menu.description,
          components: menu.components,
        } as OrderMenuItem;
      }
      return null;
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is OrderMenuItem => item !== null);
  };

  const fetchOrders = async () => {
    const response = await apiGet("/orders");
    const orders = response?.data ?? [];

    const mappedOrders = await Promise.all(
      orders.map(async (order: OrderGroupResponse) => ({
        id: order.id,
        items: await mapOrderItemsToOrderMenuItems(order.items),
        status:
          order.status === EOrderStatus.DRAFT
            ? EOrderStatus.PENDING
            : order.status,
        create_time: order.create_time,
        update_time: order.update_time,
      }))
    );

    setMyOrders(mappedOrders);
  };

  const fetchBill = async () => {
    const response = await apiGet("/bill");
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

    connect.on("order_created", async (createdOrder: OrderCreatedFromSignalR) => {
      const newOrder: OrderGroupWithMenuMapping = {
        id: createdOrder.id,
        create_time: createdOrder.create_time,
        update_time: createdOrder.update_time,
        items: await mapOrderItemsToOrderMenuItems(createdOrder.items),
        status: createdOrder.status,
      };
      setMyOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    connect.on("order_status_updated", async (updatedOrder: OrderUpdateFromSignalR) => {
      setMyOrders((prevOrders) => [
        ...prevOrders.map((order) => {
          if (order.id === updatedOrder.resource.id) {
            return {
              ...order,
              status: updatedOrder.status,
            };
          }
          return order;
        })
      ]);
    });

    return () => {
      connect.stop();
    };
  }, []);

  const onClickEditOrderItem = (orderGroupId: number, item: OrderMenuItem) => {
    if (orderGroupId && item) {
      setSelectedOrderGroupId(orderGroupId);
      setSelectedMenuItem(item);
      setIsEditModalOpen(true);
    }
  };

  const onClickCancelOrderItem = async (orderGroupId: number) => {
    if (orderGroupId) {
      setSelectedOrderGroupId(orderGroupId);
      setIsCancelModalOpen(true);
    }
  };

  const handleUpdateItem = async (
    item: OrderMenuItem | CartItem,
    quantity: number,
    note: string | null = null,
    orderGroupId: number
  ) => {
    // Update the item in the order API
    await apiPut(`/orders/${orderGroupId}/items/${item.id}`, {
      quantity: quantity,
      note: note,
    } as OrderItemPutRequest);
    setIsEditModalOpen(false);
    fetchOrders();
  };

  const handleCancelOrderItem = async (orderGroupId: number) => {
    await apiPut(`/orders/${orderGroupId}/cancel`);
    setIsCancelModalOpen(false);
    fetchOrders();
  };

  const handleSelectOrderStatus = (orderStatus: EOrderStatusString) => {
    setActiveTab(orderStatus);
  };

  return (
    <div>
      <div className="flex flex-col h-[100dvh] bg-gray-50 pb-[80px] overflow-hidden">
        <OrderStatusTabs
          orderStatus={Object.keys(orderStatusMap) as EOrderStatusString[]}
          activeOrderStatus={activeTab}
          tableName={bill?.table.name ?? ""}
          onSelectOrderStatus={handleSelectOrderStatus}
        />
        <main className="flex-1 px-4 pt-4 overflow-y-auto min-h-0 custom-scrollbar">
          {filteredOrders && filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              {activeTab === EOrderStatusString.ALL ? (
                <p className="text-lg font-medium">No order found</p>
              ) : (
                <p className="text-lg font-medium">
                  No {activeTab} order found
                </p>
              )}
              <Link
                href="/menu"
                className="text-[var(--primary-orange-main)] font-semibold hover:underline"
              >
                Go to Menu
              </Link>
            </div>
          ) : (
            filteredOrders.map(
              (orderGroupWithMenuMapping: OrderGroupWithMenuMapping) => (
                <MyOrderGroupCard
                  key={orderGroupWithMenuMapping.id}
                  orderGroup={orderGroupWithMenuMapping}
                  handleEditOrderItem={onClickEditOrderItem}
                  handleCancelOrderItem={onClickCancelOrderItem}
                />
              )
            )
          )}
        </main>
      </div>
      <OrderCustomizationModal
        orderGroupId={selectedOrderGroupId}
        item={selectedMenuItem}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleUpdateItem}
        mode="edit"
      />
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => handleCancelOrderItem(selectedOrderGroupId!)}
        title="Cancel Order"
        message={`Are you sure you want to cancel this order ${selectedOrderGroupId}?`}
      />
    </div>
  );
};

export default MyOrderRender;
