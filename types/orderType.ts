import { EOrderStatus } from "./enum";

export interface OrderItem {
  menu_id: number;
  quantity: number;
  note: string | null;
}

export interface OrderMenuItem {
  menu_id: number;
  image_url: string | null;
  name: string;
  note: string | null;
  quantity: number;
  price_per_item: number;
}

interface OrderGroup {
  id: number;
  create_time: string;
  update_time: string;
  status: EOrderStatus;
}

export interface OrderGroupRequest {
  items: OrderItem[];
}

export interface OrderGroupResponse extends OrderGroup {
  items: OrderItem[];
}

export interface OrderGroupWithMenuMapping extends OrderGroup {
  items: OrderMenuItem[];
}
