export interface MenuItemResponse {
  id: number;
  name: string;
  price: number;
  display_name: string;
  description: string;
  image_url: string;
  status: number;
  tags: tag[];
  components: component[];
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  display_name: string;
  description: string;
  image_url: string;
  tags: tag[];
  components: componentMappedMenu[];
}

export interface tag {
  id: number;
  name: string;
}

export interface component {
  menu_id: number;
  quantity: number;
}

export interface componentMappedMenu {
  menu_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  description: string;
}
