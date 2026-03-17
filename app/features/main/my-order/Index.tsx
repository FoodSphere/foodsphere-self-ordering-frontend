"use client";

import { useEffect, useMemo, useState } from "react";
import * as signalR from "@microsoft/signalr";
import Link from "next/link";

import ConfirmationModal from "@/app/components/ConfirmationModal";
import OrderCustomizationModal from "@/app/components/OrderCustomizationModal";
import { useMenu } from "@/app/context/MenuContext";
import { getCookie } from "@/libs/cookie";
import { apiGet, apiPut } from "@/services/common";
import { CartItem } from "@/types/cartType";
import { EOrderStatus, EOrderStatusString, OrderStatus } from "@/types/enum";
import {
  OrderCreatedFromSignalR,
  OrderGroupResponse,
  OrderGroupWithMenuMapping,
  OrderItemPutRequest,
  OrderMenuItem,
  OrderUpdateFromSignalR,
} from "@/types/orderType";

import MyOrderGroupCard from "../../../components/MyOrderGroupCard";
import OrderStatusTabs from "../../../components/OrderStatusTabs";

const orderStatusMap: OrderStatus = {
  [EOrderStatusString.ALL]: EOrderStatus.ALL,
  [EOrderStatusString.PENDING]: EOrderStatus.PENDING,
  [EOrderStatusString.COOKING]: EOrderStatus.COOKING,
  [EOrderStatusString.COMPLETED]: EOrderStatus.COMPLETED,
  [EOrderStatusString.CANCELLED]: EOrderStatus.CANCELLED,
};

const MyOrderRender = () => {
  const { mapOrderItemsToOrderMenuItems } = useMenu();

  const [rawOrders, setRawOrders] = useState<OrderGroupResponse[]>([]);

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

  const myOrders: OrderGroupWithMenuMapping[] = useMemo(() => {
    return rawOrders.map((order: OrderGroupResponse) => ({
      id: order.id,
      items: mapOrderItemsToOrderMenuItems(order.items),
      status:
        order.status === EOrderStatus.DRAFT
          ? EOrderStatus.PENDING
          : order.status,
      create_time: order.create_time,
      update_time: order.update_time,
    }));
  }, [rawOrders, mapOrderItemsToOrderMenuItems]);

  const filteredOrders = useMemo(() => {
    if (activeTab === EOrderStatusString.ALL) {
      return myOrders;
    }
    const targetStatus = orderStatusMap[activeTab];
    return myOrders.filter((item) => item.status === targetStatus);
  }, [myOrders, activeTab]);

  const fetchOrders = async () => {
    const response = await apiGet("/orders");
    setRawOrders(response?.data ?? []);
  };

  useEffect(() => {
    fetchOrders();

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

    connect.on("order_created", (createdOrder: OrderCreatedFromSignalR) => {
      const newOrder: OrderGroupResponse = {
        id: createdOrder.id,
        create_time: createdOrder.create_time,
        update_time: createdOrder.update_time,
        items: createdOrder.items,
        status: createdOrder.status,
      };
      setRawOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    connect.on(
      "order_status_updated",
      (updatedOrder: OrderUpdateFromSignalR) => {
        setRawOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === updatedOrder.resource.id
              ? { ...order, status: updatedOrder.status }
              : order
          )
        );
      }
    );

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
      <div className="flex flex-col h-screen bg-gray-50">
        <OrderStatusTabs
          orderStatus={Object.keys(orderStatusMap) as EOrderStatusString[]}
          activeOrderStatus={activeTab}
          onSelectOrderStatus={handleSelectOrderStatus}
        />
        <main className="flex-1 px-4 pt-4 overflow-y-auto pb-20 mb-20">
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
