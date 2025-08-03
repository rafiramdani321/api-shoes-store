export function generateVerificationEmail(
  username: string,
  url: string
): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333;">Welcome to Shoes Store, ${username}!</h2>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <p style="text-align: center;">
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: white; border-radius: 5px; text-decoration: none;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><a href="${url}">${url}</a></p>
      <hr />
      <p style="font-size: 12px; color: #666;">If you did not register, you can safely ignore this email.</p>
    </div>
  `;

  const text = `
Welcome to Shoes Store, ${username}!

Please verify your email address by clicking the link below:
${url}

If the link doesn't work, copy and paste it into your browser.

If you did not register, you can safely ignore this email.
  `;

  return { html, text };
}
