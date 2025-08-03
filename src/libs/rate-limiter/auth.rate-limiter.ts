import { createRateLimiter } from "../rate-limiter.config";

export default class AuthRateLimiter {
  static registerLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 15,
    message: "Too many registrations from this IP. Try again in an hour.",
  });

  static loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attemps. Please try again in 15 minutes.",
  });

  static resendEmailVerification = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 15,
    message: "Too many resend email from this IP. Try again in an hour.",
  });
}
