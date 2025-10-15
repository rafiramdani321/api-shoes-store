import { AppError } from "./errors";

export const verifyGoogleAccessToken = async (accessToken: string) => {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new AppError("Failed to verify Google access token", 401);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new AppError("Invalid Google access token", 401);
  }
};
