import Stripe from 'npm:stripe@18.2.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ADMIN_EMAIL = "abdullah.mohiuddin90@gmail.com";

// Builds a proper RFC 2822 MIME message and sends it through the connected
// Gmail account via the Gmail API.
async function sendGmailNotification(base44: any, subject: string, htmlBody: string, textBody: string) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
  if (!accessToken) throw new Error("Gmail access token not available");

  const utf8ToBinary = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return bin;
  };
  const b64 = (str: string): string => btoa(utf8ToBinary(str));
  const encodeHeader = (str: string): string =>
    /^[\x20-\x7E]*$/.test(str) ? str : `=?UTF-8?B?${b64(str)}?=`;

  const boundary = "basirah_" + Math.random().toString(36).slice(2);
  const mimeMessage = [
    "MIME-Version: 1.0",
    `To: ${ADMIN_EMAIL}`,
    `From: Basirah Designs <${ADMIN_EMAIL}>`,
    `Subject: ${encodeHeader(subject)}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    textBody,
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    htmlBody,
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const raw = b64(mimeMessage)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API error ${res.status}: ${errText}`);
  }
}

const escapeHtml = (str: string): string =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function buildEmailContent(email: string, websiteName: string, purchaseLabel: string, amountNote: string) {
  const safeEmail = escapeHtml(email);
  const safeWebsite = escapeHtml(websiteName);
  const safePurchase = escapeHtml(purchaseLabel);
  const cleanWebsite = String(websiteName).replace(/[\r\n\t<>]/g, " ").trim() || "Not provided";

  const textBody =
    `New Payment Received\n\n` +
    `Customer: ${email}\n` +
    `Website: ${cleanWebsite}\n` +
    `Purchase: ${purchaseLabel}\n` +
    (amountNote ? `${amountNote}\n` : "");

  const htmlBody = `
  <div style="background-color: #FAF7F2; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #F5F0E8; border: 1px solid #E5DDD0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #1C1810; padding: 32px 40px;">
        <p style="color: #B8973A; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 8px 0;">Basirah Designs</p>
        <h1 style="color: #FAF7F2; font-size: 24px; font-weight: 300; margin: 0;">New Payment Received</h1>
      </div>
      <div style="padding: 40px;">
        <p style="color: #7A6E62; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px 0;">Purchase Details</p>
        <div style="background-color: #FAF7F2; border: 1px solid #DDD4C0; border-radius: 8px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0; width: 130px;">Customer</td>
              <td style="color: #1C1810; font-size: 16px; font-weight: 600; padding: 8px 0;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0;">Website</td>
              <td style="color: #1C1810; font-size: 16px; padding: 8px 0;">${safeWebsite}</td>
            </tr>
            <tr>
              <td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0;">Purchase</td>
              <td style="color: #1C1810; font-size: 16px; padding: 8px 0;">${safePurchase}</td>
            </tr>
            ${amountNote ? `<tr><td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0;">Amount</td><td style="color: #1C1810; font-size: 16px; padding: 8px 0;">${escapeHtml(amountNote)}</td></tr>` : ""}
          </table>
        </div>
      </div>
      <div style="border-top: 1px solid #E5DDD0; padding: 24px 40px; text-align: center;">
        <p style="color: #7A6E62; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Basirah Designs</p>
      </div>
    </div>
  </div>`;

  return { textBody, htmlBody, cleanWebsite };
}

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured");
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    if (!signature) {
      console.error("Stripe webhook received without signature header");
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log("Stripe webhook received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Payment completed for:", session.customer_email, "Plan:", session.metadata?.plan);
      const userId = session.metadata?.user_id;
      const type = session.metadata?.type || "subscription";
      if (userId) {
        const updateData: any = { membership_status: "active" };
        if (type === "build") {
          updateData.build_fee_paid = true;
        }
        await base44.asServiceRole.entities.User.update(userId, updateData);
        console.log("Membership status set to active for user:", userId, "type:", type);
      }

      // Send admin Gmail alert about the purchase
      try {
        const websiteName = session.metadata?.website_name || "Not provided";
        const email = session.customer_email || "Unknown";
        const isBuild = type === "build";
        const purchaseLabel = isBuild
          ? "One-Time Build Fee ($1,000)"
          : "Monthly Managed Service ($79/mo)";
        const amountNote = isBuild ? "$1,000.00 one-time" : "$79.00 (first month)";

        const { textBody, htmlBody, cleanWebsite } = buildEmailContent(email, websiteName, purchaseLabel, amountNote);
        const subject = `New Payment — ${isBuild ? "Build Fee" : "Subscription"} from ${cleanWebsite}`;

        await sendGmailNotification(base44, subject, htmlBody, textBody);
        console.log("Purchase alert email sent via Gmail for:", email, type);
      } catch (emailError) {
        console.error("Failed to send purchase alert email:", emailError);
      }
    }

    // Recurring monthly subscription renewals — notify on each monthly payment
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      // Only renewal cycles; the first invoice is covered by checkout.session.completed
      if (invoice.billing_reason === "subscription_cycle") {
        try {
          let email = invoice.customer_email || "";
          if (!email && invoice.customer) {
            const customer = await stripe.customers.retrieve(invoice.customer);
            email = (customer as any).email || "Unknown";
          }
          const amount = invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : "79.00";
          const purchaseLabel = "Monthly Managed Service ($79/mo)";
          const amountNote = `$${amount} (recurring renewal)`;

          const { textBody, htmlBody, cleanWebsite } = buildEmailContent(
            email || "Unknown",
            "Not provided",
            purchaseLabel,
            amountNote
          );
          const subject = `Recurring Payment — Monthly Subscription renewal ($${amount})`;

          await sendGmailNotification(base44, subject, htmlBody, textBody);
          console.log("Recurring subscription alert sent via Gmail for:", email);
        } catch (emailError) {
          console.error("Failed to send recurring payment alert email:", emailError);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const users = await base44.asServiceRole.entities.User.filter({ email: (customer as any).email });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, { membership_status: "cancelled" });
        console.log("Membership status set to cancelled for user:", users[0].id);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});