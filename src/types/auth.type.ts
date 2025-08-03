export type LoginProps = {
  email: string;
  password: string;
};

export type DeviceInfoProps = {
  ip: string;
  userAgent: string;
  deviceHash: string;
};

export type VerifyAccessTokenProps = {
  id: string;
  email: string;
  username: string;
  role: string | any;
  tokenVersion: number;
  sessionId: string;
  deviceHash: string;
};

export type UserRefreshTokenProps = {
  id: string;
  email: string;
  username: string;
  role: string | any;
  tokenVersion: number;
  sessionId: string;
  deviceHash: string;
};
