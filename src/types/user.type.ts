export interface GetUserQueryBase {
  page?: string;
  limit?: string;
  searchBy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type UserAllowedSearchBy = "username" | "fullname" | "email";

export type UserAllowedSortBy =
  | "username"
  | "fullname"
  | "email"
  | "created_at"
  | "updated_at";

export type UserSortOrder = "asc" | "desc";

export interface UserBase {
  username: string;
  fullname?: string;
  gender?: "MALE" | "FEMALE";
  phone_number: string;
  date_of_birth?: Date;
}

export interface UserUpdate extends UserBase {
  id: string;
  updated_by: string;
}
