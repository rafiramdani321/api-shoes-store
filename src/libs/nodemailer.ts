import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  service: process.env.SERVICE,
  port: 587,
  secure: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS,
  },
});
