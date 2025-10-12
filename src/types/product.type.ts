export interface ProductBaseType {
  title: string;
  slug: string;
  description: string;
  price: number;
  is_active: boolean;
  category_id: string;
  subcategory_id?: string | null;
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

export interface CreateProductImageType {
  product_id: string;
  images: {
    url: string;
    fileId: string;
  }[];
}

export interface UpdateProductType {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  subcategory_id: string;
  is_active: boolean;
  updated_by: string;
}

export interface GetProductQueryBase {
  page?: string;
  limit?: string;
  searchBy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type ProductsAllowedSearchBy =
  | "title"
  | "slug"
  | "category"
  | "sub_category";
export type ProductsAllowedSortBy =
  | "title"
  | "slug"
  | "price"
  | "category"
  | "sub_category"
  | "created_at"
  | "updated_at";
export type ProductsSortOrder = "asc" | "desc";

export interface createSizeProductType {
  product_id: string;
  sizes: {
    size_id: string;
    stock: number;
  }[];
}

export interface updateSizeProductType {
  id: string;
  size_id: string;
  stock: number;
}

export type ProductsAllowedSortByProductBySlug = "created_at" | "price";
export interface GetProductsByCategorySlugQUery {
  category_slug: string;
  page: string;
  limit: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: string;
  maxPrice?: string;
  sizes?: string[];
}
