export interface CategoryBase {
  name: string;
  slug: string;
}

export interface CategoryCreate extends CategoryBase {
  created_by: string;
}

export interface CategoryUpdate extends CategoryBase {
  id: string;
  updated_by: string;
}
