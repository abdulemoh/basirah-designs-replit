// Shared Gmail + branded email helpers for client-facing Basirah Designs emails.
// Used by the Stripe webhook (receipts) and the scheduled renewal-reminder function.

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function brandedShell(heading: string, inner: string): string {
  return `
  <div style="background-color: #FAF7F2; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #F5F0E8; border: 1px solid #E5DDD0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #1C1810; padding: 32px 40px;">
        <p style="color: #B8973A; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 8px 0;">Basirah Designs</p>
        <h1 style="color: #FAF7F2; font-size: 22px; font-weight: 300; margin: 0;">${escapeHtml(heading)}</h1>
      </div>
      <div style="padding: 40px;">
        ${inner}
      </div>
      <div style="border-top: 1px solid #E5DDD0; padding: 24px 40px; text-align: center;">
        <p style="color: #7A6E62; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Basirah Designs &mdash; High-quality web design for the uncompromising few.</p>
      </div>
    </div>
  </div>`;
}

export function detailsTable(rows: [string, string][]): string {
  return `<div style="background-color: #FAF7F2; border: 1px solid #DDD4C0; border-radius: 8px; padding: 24px;">
    <table style="width: 100%; border-collapse: collapse;">
      ${rows.map(([k, v]) => `<tr>
        <td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0; width: 150px; vertical-align: top;">${escapeHtml(k)}</td>
        <td style="color: #1C1810; font-size: 15px; padding: 8px 0;">${v}</td>
      </tr>`).join("")}
    </table>
  </div>`;
}

// Sends an HTML email from the connected Gmail account to any address.
export async function sendGmailHtml(base44: any, to: string, subject: string, htmlBody: string): Promise<void> {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
  const from = "Basirah Designs <abdullah.mohiuddin90@gmail.com>";
  const rfc2822 = `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${htmlBody}`;
  const bytes = new TextEncoder().encode(rfc2822);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const raw = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail send failed (${res.status}): ${text}`);
  }
}