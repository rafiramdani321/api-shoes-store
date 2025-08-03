import { transporter } from "../libs/nodemailer";
import { generateVerificationEmail } from "../templates/email-verification-accout";

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
) {
  const url = `${process.env.FRONTEND_PUBLIC_BASE_URL}/auth/verify-account/${token}`;
  const { html, text } = generateVerificationEmail(username, url);

  await transporter.sendMail({
    from: `"Shoes Store" <${process.env.USER_EMAIL}>`,
    to: email,
    subject: "Verify your Shoes Store account",
    html,
    text,
  });
}
