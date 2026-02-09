"use client";

import { useEffect, useState } from "react";

import {
  OrderGroupResponse,
  OrderGroupWithMenuMapping,
} from "@/types/orderType";
import MyOrderGroupCard from "../../../components/MyOrderGroupCard";
import OrderStatusTabs from "../../../components/OrderStatusTabs";
import { apiGet } from "@/services/common";
import { useMenu } from "@/app/context/MenuContext";

const orderStatus = ["pending", "cooking", "completed", "canceled"];

const MyOrderRender = () => {
  const { mapOrderItemsToOrderMenuItems } = useMenu();

  const [myOrders, setMyOrders] = useState<OrderGroupWithMenuMapping[]>([]);

  const fetchOrders = async () => {
    const response = await apiGet("/orders");
    const orders: OrderGroupWithMenuMapping[] =
      response?.data.map((order: OrderGroupResponse) => {
        return {
          id: order.id,
          items: mapOrderItemsToOrderMenuItems(order.items),
          status: order.status,
          create_time: order.create_time,
          update_time: order.update_time,
        };
      }) ?? [];
    setMyOrders(orders);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <OrderStatusTabs
        orderStatus={orderStatus}
        activeOrderStatus="pending"
        onSelectOrderStatus={() => {}}
      />
      <div className="max-h-170 mb-20 overflow-y-auto">
        {myOrders.length > 0 ? (
          myOrders.map(
            (orderGroupWithMenuMapping: OrderGroupWithMenuMapping) => (
              <MyOrderGroupCard
                key={orderGroupWithMenuMapping.id}
                orderGroup={orderGroupWithMenuMapping}
              />
            )
          )
        ) : (
          <p>No orders found</p>
        )}
      </div>
    </div>
  );
};

export default MyOrderRender;
