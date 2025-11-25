import nodemailer from "nodemailer";
import { env } from "../constants/env";

export const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  // service: env.EMAIL_SERVICE,
  port: Number(env.EMAIL_PORT),
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});
