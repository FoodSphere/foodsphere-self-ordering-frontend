"use client";

import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import {
  OrderGroupResponse,
  OrderGroupWithMenuMapping,
  OrderItem,
  OrderMenuItem,
} from "@/types/orderType";
import { apiGet } from "@/services/common";
import { EOrderStatus, EOrderStatusString } from "@/types/enum";
import { formatDistanceToNow, parseISO } from "date-fns";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderHistoryModal = ({ isOpen, onClose }: OrderHistoryModalProps) => {
  const [myOrders, setMyOrders] = useState<OrderGroupWithMenuMapping[]>([]);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="bg-white md:bg-black/50 min-h-screen w-full flex items-center justify-center fixed inset-0 z-999 md:backdrop-blur-sm md:p-4 animate-in fade-in duration-200">
      {/* Card Container - Full screen on mobile, Card on Desktop */}
      <div className="w-full h-full md:h-auto md:max-h-[75vh] md:max-w-2xl bg-white md:rounded-xl shadow-none md:shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl md:text-lg font-bold text-gray-800">
            Order History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-grow md:max-h-100 overflow-y-auto flex-1 p-0 bg-white">
          {myOrders.map((order: OrderGroupWithMenuMapping) => (
            <div
              key={order.id}
              className="p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-1 gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-xl md:text-lg leading-tight mb-2">
                      Order ID: {order.id}
                    </h3>
                    {order.items.length > 0 && (
                      <div className="flex flex-col text-gray-600 text-base md:text-sm space-y-1">
                        {order.items.map((item: any, idx: number) => {
                          const getStatusBadge = (status: EOrderStatus) => {
                            switch (status) {
                              case EOrderStatus.COOKING:
                                return (
                                  <span className="font-semibold text-blue-500">
                                    ({EOrderStatusString.COOKING})
                                  </span>
                                );
                              case EOrderStatus.COMPLETED:
                                return (
                                  <span className="font-semibold text-green-500">
                                    ({EOrderStatusString.COMPLETED})
                                  </span>
                                );
                              case EOrderStatus.CANCELLED:
                                return (
                                  <span className="font-semibold text-red-500">
                                    ({EOrderStatusString.CANCELLED})
                                  </span>
                                );
                              default:
                                return (
                                  <span className="font-semibold text-yellow-500">
                                    ({EOrderStatusString.PENDING})
                                  </span>
                                );
                            }
                          };

                          return (
                            <div key={idx}>
                              <p key={idx}>
                                - x{item.quantity} {item.name}{" "}
                                {getStatusBadge(order.status)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[var(--primary-orange-main)] font-bold text-xl md:text-lg">
                    ฿{" "}
                    {order.items
                      .reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 md:text-[var(--primary-orange-main)] text-sm font-medium mt-1">
                    <Clock size={16} />
                    <span>
                      {formatDistanceToNow(parseISO(order.create_time), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end bg-white sticky bottom-0 z-10">
          <button
            className="w-full md:w-auto bg-[#dc2626] text-white px-8 py-3 md:py-2 rounded-xl md:rounded-lg font-bold md:font-medium text-lg md:text-base hover:bg-red-700 transition-colors active:scale-95 shadow-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryModal;
