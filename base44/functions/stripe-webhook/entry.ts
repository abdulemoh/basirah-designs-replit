import Stripe from 'npm:stripe@18.2.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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
        const updateData = { membership_status: "active" };
        if (type === "build") {
          updateData.build_fee_paid = true;
        }
        await base44.asServiceRole.entities.User.update(userId, updateData);
        console.log("Membership status set to active for user:", userId, "type:", type);
      }

      // Send admin email alert about the purchase
      try {
        const type = session.metadata?.type || "subscription";
        const websiteName = session.metadata?.website_name || "Not provided";
        const email = session.customer_email || "Unknown";
        const purchaseLabel = type === "build"
          ? "One-Time Build Fee ($1,000)"
          : "Monthly Managed Service ($79/mo)";

        const escapeHtml = (str: string): string =>
          String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const safeEmail = escapeHtml(email);
        const safeWebsite = escapeHtml(websiteName);
        const safePurchase = escapeHtml(purchaseLabel);
        const cleanWebsite = String(websiteName).replace(/[\r\n\t<>]/g, " ").trim() || "Not provided";

        const subject = `New Payment — ${type === "build" ? "Build Fee" : "Subscription"} from ${cleanWebsite}`;

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
                </table>
              </div>
            </div>
            <div style="border-top: 1px solid #E5DDD0; padding: 24px 40px; text-align: center;">
              <p style="color: #7A6E62; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Basirah Designs</p>
            </div>
          </div>
        </div>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: "abdullah.mohiuddin90@gmail.com",
          subject,
          body: htmlBody,
          from_name: "Basirah Designs"
        });
        console.log("Purchase alert email sent for:", email, type);
      } catch (emailError) {
        console.error("Failed to send purchase alert email:", emailError);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const users = await base44.asServiceRole.entities.User.filter({ email: customer.email });
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