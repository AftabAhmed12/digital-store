// Simple, dependency-free HTML email template (inline styles -> works in all email clients)
export const orderDeliveryTemplate = ({ customerEmail, productTitle, downloadUrl, amount, originalAmount, discountAmount, couponCode, currency }) => {
  const hasDiscount = discountAmount > 0;
  const money = (cents) => `${((cents || 0) / 100).toFixed(2)} ${currency.toUpperCase()}`;
  const priceRows = hasDiscount
    ? `
      <tr>
        <td style="padding:4px 20px 0 20px;">
          <p style="margin:0;color:#7A8299;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Subtotal</p>
          <p style="margin:0;color:#E7E9EE;font-size:14px;">${money(originalAmount)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 20px 0 20px;">
          <p style="margin:0;color:#7A8299;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Discount${couponCode ? ` (${couponCode})` : ""}</p>
          <p style="margin:0;color:#38B2AC;font-size:14px;font-weight:600;">− ${money(discountAmount)}</p>
        </td>
      </tr>`
    : "";
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your order is ready</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0B0F19;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B0F19;padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#131826;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#0B0F19,#1B2436);padding:32px 32px 24px 32px;text-align:center;border-bottom:1px solid #F2B84B;">
                <p style="margin:0;color:#F2B84B;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Order Confirmed</p>
                <h1 style="margin:8px 0 0 0;color:#E7E9EE;font-size:22px;">Your download is ready</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="color:#B7BDC9;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
                  Thank you for your purchase! Your payment has been confirmed and your digital product is ready to download.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B0F19;border-radius:8px;margin:16px 0;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0 0 4px 0;color:#7A8299;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Product</p>
                      <p style="margin:0 0 12px 0;color:#E7E9EE;font-size:16px;font-weight:600;">${productTitle}</p>
                      <p style="margin:0 0 4px 0;color:#7A8299;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Amount Paid</p>
                      <p style="margin:0;color:#E7E9EE;font-size:16px;font-weight:600;">${money(amount)}</p>
                    </td>
                  </tr>
                  ${priceRows}
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:8px 0 4px 0;">
                      <a href="${downloadUrl}" style="display:inline-block;background-color:#F2B84B;color:#0B0F19;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;">Download Your Product</a>
                    </td>
                  </tr>
                </table>
                <p style="color:#7A8299;font-size:12px;line-height:1.6;margin:20px 0 0 0;text-align:center;">
                  This link was sent to ${customerEmail}. If the button doesn't work, copy this link:<br/>
                  <span style="color:#5B8DEF;word-break:break-all;">${downloadUrl}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #1E2536;text-align:center;">
                <p style="margin:0;color:#4B5266;font-size:11px;">Need help? Reply to this email or visit our Contact page.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const contactNotificationTemplate = ({ name, email, subject, message }) => {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;background:#0B0F19;padding:24px;color:#E7E9EE;">
    <h2 style="color:#F2B84B;">New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p style="background:#131826;padding:12px;border-radius:8px;">${message}</p>
  </div>
  `;
};
