export interface CreateCartType {
  user_id: string;
  cart_id: string;
  product_id: string;
  product_size_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
