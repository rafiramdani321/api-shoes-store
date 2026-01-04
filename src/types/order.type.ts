export interface CreateOrderItem {
  product_id: string;
  product_size_id: string;
  quantity: number;
}

export interface CreateOrder {
  user_address_id: string;
  orderItems: CreateOrderItem[];
}
