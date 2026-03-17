import { EOrderStatus } from "./enum";
import { componentMappedMenu } from "./menuType";

interface IOrderItem {
  quantity: number;
  note: string | null;
}

export interface OrderItem extends IOrderItem {
  id: number;
  menu_id: number;
  price_snapshot: number;
}

export interface OrderMenuItem {
  id: number;
  menu_id: number;
  image_url: string | null;
  name: string;
  note: string | null;
  quantity: number;
  price: number;
  description: string;
  components: componentMappedMenu[];
}

interface IOrderGroup {
  id: number;
  create_time: string;
  update_time: string | null;
  status: EOrderStatus;
}

export interface OrderGroupRequest {
  items: OrderItem[];
}

export interface OrderGroupResponse extends IOrderGroup {
  items: OrderItem[];
}

export interface OrderGroupWithMenuMapping extends IOrderGroup {
  items: OrderMenuItem[];
}

export interface OrderItemPutRequest extends IOrderItem {}

export interface OrderItemPatch extends IOrderItem {
  menu_id: number;
}

export interface OrderPatchRequest {
  path: string;
  op: string;
  value: {
    items: OrderItemPatch[];
  };
}

interface IOrderItemFromSignalR {
  id: number;
  create_time: string;
  update_time: string | null;
  bill_id: string;
  order_id: number;
  restaurant_id: string;
  menu_id: number;
  price_snapshot: number;
  quantity: number;
  note: string;
}

export interface OrderCreatedFromSignalR {
  id: number;
  create_time: string;
  update_time: string | null;
  delete_time: string | null;
  bill_id: string;
  items: IOrderItemFromSignalR[];
  status: EOrderStatus;
}

export interface OrderUpdateFromSignalR {
  resource: {
    billId: string;
    id: number;
  };
  status: EOrderStatus;
}
