export type createUserProps = {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role_id: string;
  image_url?: string;
  is_verified?: boolean;
  google_id?: string;
  auth_provider?: "local" | "google";
};
