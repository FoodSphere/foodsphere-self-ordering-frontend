import { componentMappedMenu } from "./menuType";

export interface CartItem {
  id: number;
  menu_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  quantity: number;
  note: string | null;
  components: componentMappedMenu[];
}