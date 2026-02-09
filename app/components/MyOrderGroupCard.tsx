import { useState } from "react";
import { OrderGroupWithMenuMapping, OrderMenuItem } from "@/types/orderType";
import { ChevronUp } from "lucide-react";
import Image from "next/image";
import { EOrderStatus } from "@/types/enum";

interface MyOrderItemCardProps {
  myOrderItem: OrderMenuItem;
}

interface MyOrderGroupCardProps {
  orderGroup: OrderGroupWithMenuMapping;
}

const MyOrderItemCard = ({ myOrderItem }: MyOrderItemCardProps) => {
  return (
    <div
      key={`${myOrderItem.menu_id}-${myOrderItem.note}`}
      className="bg-white p-3 rounded-xl shadow-sm flex gap-3 items-center active:bg-gray-50 transition-colors cursor-pointer flex-shrink-0"
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {myOrderItem.image_url ? (
          <Image
            src={myOrderItem.image_url}
            alt={myOrderItem.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 transform scale-75">
            No Img
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between h-20 py-1">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-gray-800 line-clamp-1 text-xl">
            {myOrderItem.name}
          </p>
        </div>

        <div className="p-0 m-0">
          <span className="text-sm text-gray-500">{myOrderItem.note}</span>
        </div>

        <div className="flex justify-between items-end">
          <span className="font-bold text-[var(--primary-orange-main)]">
            ฿{(myOrderItem.price_per_item * myOrderItem.quantity).toFixed(2)}
          </span>

          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-1 border border-gray-100">
            <span className="text-lg font-semibold text-[var(--primary-orange-main)]">
              x{myOrderItem.quantity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyOrderGroupCard = ({ orderGroup }: MyOrderGroupCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusBadge = (status: EOrderStatus) => {
    switch (status) {
      case EOrderStatus.PENDING:
        return "text-yellow-500 bg-yellow-100 rounded-full px-2 py-1";
      case EOrderStatus.COMPLETED:
        return "text-green-500 bg-green-100 rounded-full px-2 py-1";
      case EOrderStatus.CANCELLED:
        return "text-red-500 bg-red-100 rounded-full px-2 py-1";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: EOrderStatus) => {
    switch (status) {
      case EOrderStatus.PENDING:
        return "Pending";
      case EOrderStatus.COOKING:
        return "Cooking";
      case EOrderStatus.COMPLETED:
        return "Completed";
      case EOrderStatus.CANCELLED:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-white m-3 p-3 rounded-xl shadow-sm">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-semibold">Order ID: {orderGroup.id}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${getStatusBadge(orderGroup.status)}`}>
            {getStatusText(orderGroup.status)}
          </span>
          <ChevronUp
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="">
          {orderGroup.items.map((order: OrderMenuItem) => (
            <MyOrderItemCard
              key={`${order.menu_id}-${order.note}`}
              myOrderItem={order}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrderGroupCard;
