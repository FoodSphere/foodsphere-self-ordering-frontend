export interface CartItem {
  menuId: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  notes: string | null;
}