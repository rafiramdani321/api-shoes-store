export type CreateShippingAddress = {
  user_id: string;
  recipent_name: string;
  label_address: string;
  phone_number_recipent: string;
  address: string;
  province_id?: string;
  province_name: string;
  city_id?: string;
  city_name: string;
  postal_code: string;
  is_primary: boolean;
};

export interface UpdateShippingAddress extends CreateShippingAddress {
  id: string;
}
