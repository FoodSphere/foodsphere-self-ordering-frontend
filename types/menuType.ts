export interface MenuItemResponse {
  id: number;
  name: string;
  price: number;
  display_name: string;
  description: string;
  image_url: string;
  status: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  display_name: string;
  description: string;
  image_url: string;
  tag: string[];
}
