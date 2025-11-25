import { env } from "../constants/env";
import { transporter } from "../libs/nodemailer";
import { generateVerificationEmail } from "../templates/email-verification-accout";
import { AppError } from "../utils/errors";

export async function sendVerificationEmail(
  to: string,
  token: string,
  username: string
) {
  const url = `${process.env.FRONTEND_PUBLIC_BASE_URL}/auth/verify-account/${token}`;
  const { html, text } = generateVerificationEmail(username, url);

  const mailOptions = {
    from: `"Shoes Store" <${env.EMAIL_USER}>`,
    to,
    subject: "Verify your account",
    html,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email send to:", to);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new AppError("Failed to send verification email.", 500);
  }
}
