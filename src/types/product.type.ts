export interface ProductBaseType {
  title: string;
  slug: string;
  description: string;
  price: number;
  is_active: boolean;
  category_id: string;
  subcategory_id?: string;
  images: {
    url: string;
    fileId: string;
  }[];
  files: any;
  sizes: {
    size_id: string;
    stock: number;
  }[];
}

export interface CreateProductType extends ProductBaseType {
  created_by: string;
}

export interface UpdateProductType extends ProductBaseType {
  id: string;
  updated_by: string;
}
