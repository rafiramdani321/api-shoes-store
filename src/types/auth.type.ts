export type CreateUserInput = {
  email: string;
  username: string;
  password?: string | null;
  confirmPassword?: string;
  image_url?: string;
  is_verified?: boolean;
  role_id: string;
  auth_provider?: "local" | "google";
  google_id?: string;
};

export type RegisterInput = Omit<
  CreateUserInput,
  "google_id" | "auth_provider" | "is_verified"
> & {
  password: string;
  confirmPassword: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type DeviceInfo = {
  ip: string;
  userAgent: string;
};

export type RequireAuth = {
  user_id: string;
  email: string;
  username: string;
  role: string | any;
  token_version: number;
  session_id: string;
  device_hash: string;
};
