export type CreateToken = {
  token: string;
  user_id: string;
  status: "EXPIRED" | "ACTIVE" | "USED";
  type: "EMAIL_ACTIVATION" | "PASSWORD_RESET";
  expired_at: Date;
};
