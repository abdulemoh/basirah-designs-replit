import Stripe from 'npm:stripe@18.2.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendGmailHtml, brandedShell, detailsTable, escapeHtml } from '../../shared/gmail.ts';

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
        const websiteName = session.metadata?.website_name || "Not provided";
        const email = session.customer_email || "Unknown";
        const purchaseLabel = type === "build"
          ? "One-Time Build Fee ($1,000)"
          : "Monthly Managed Service ($79/mo)";

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

      // Send client receipt via Gmail (reaches any inbox, branded).
      try {
        const clientEmail = session.customer_email;
        if (clientEmail) {
          const appUrl = Deno.env.get("BASE44_APP_URL") || "https://basirah-designs.base44.app";
          const dateStr = new Date((session.created || Math.floor(Date.now() / 1000)) * 1000)
            .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          const txnId = session.id || "—";

          if (type === "build") {
            const subject = "Receipt from Basirah Designs — $1,000 Build Fee";
            const inner = `
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">Hi there,</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">Thank you for your payment. This email is your official receipt for the one-time website build fee.</p>
              ${detailsTable([
                ["Date", escapeHtml(dateStr)],
                ["Purchase", "Custom Website Design &amp; Development (5&ndash;10 pages) &mdash; Build Fee"],
                ["Amount", "$1,000.00 USD (One-Time)"],
                ["Transaction ID", escapeHtml(txnId)],
              ])}
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 24px 0 12px;">Per our agreement, the build fee covers the custom design and development of your website and is non-refundable once work has begun.</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 12px;"><strong>Next step:</strong> please complete the onboarding form so we have everything we need to begin. You can access it from your account at <a href="${escapeHtml(appUrl)}" style="color: #B8973A;">${escapeHtml(appUrl)}</a>.</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0;">If you have any questions, just reply to this email or call us at 859-447-5611.</p>`;
            await sendGmailHtml(base44, clientEmail, subject, brandedShell("Your Build Fee Receipt", inner));
          } else {
            const subject = "Receipt from Basirah Designs — $79/mo Managed Service";
            const inner = `
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">Hi there,</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">Thank you for starting your managed service plan. This email is your official receipt.</p>
              ${detailsTable([
                ["Date", escapeHtml(dateStr)],
                ["Purchase", "Monthly Managed Service &mdash; hosting, security, bug fixes &amp; updates"],
                ["Amount", "$79.00 USD / month (recurring)"],
                ["Transaction ID", escapeHtml(txnId)],
              ])}
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 24px 0 12px;">Your subscription renews automatically each month until cancelled.</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 12px;"><strong>Manage or cancel anytime:</strong> sign in at <a href="${escapeHtml(appUrl)}" style="color: #B8973A;">${escapeHtml(appUrl)}</a> and use the &ldquo;Manage Subscription&rdquo; button in the pricing section.</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0;">Questions? Just reply to this email or call 859-447-5611.</p>`;
            await sendGmailHtml(base44, clientEmail, subject, brandedShell("Your Subscription Receipt", inner));
          }
          console.log("Client receipt sent to:", clientEmail, "type:", type);
        }
      } catch (receiptError) {
        console.error("Failed to send client receipt:", receiptError);
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      // Monthly renewal receipt — only for recurring cycle invoices, not the first payment
      // (the first payment is already covered by checkout.session.completed above).
      try {
        const invoice = event.data.object;
        if (invoice.billing_reason === "subscription_cycle") {
          const customer = await stripe.customers.retrieve(invoice.customer);
          const clientEmail = (customer as any)?.email;
          if (clientEmail) {
            const appUrl = Deno.env.get("BASE44_APP_URL") || "https://basirah-designs.base44.app";
            const dateStr = new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000)
              .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
            const amount = invoice.amount_paid ? `$${(invoice.amount_paid / 100).toFixed(2)} USD` : "$79.00 USD";
            const subject = "Receipt from Basirah Designs — Monthly Service";
            const inner = `
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">Hi there,</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">Your monthly managed service has been renewed. This email is your receipt for this billing cycle.</p>
              ${detailsTable([
                ["Date", escapeHtml(dateStr)],
                ["Purchase", "Monthly Managed Service &mdash; hosting, security, bug fixes &amp; updates"],
                ["Amount", escapeHtml(amount)],
                ["Invoice ID", escapeHtml(invoice.id || "—")],
              ])}
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 24px 0 12px;">Your subscription will continue to renew automatically each month until cancelled.</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 12px;"><strong>Manage or cancel anytime:</strong> sign in at <a href="${escapeHtml(appUrl)}" style="color: #B8973A;">${escapeHtml(appUrl)}</a> and use the &ldquo;Manage Subscription&rdquo; button in the pricing section.</p>
              <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0;">Questions? Just reply to this email or call 859-447-5611.</p>`;
            await sendGmailHtml(base44, clientEmail, subject, brandedShell("Your Monthly Receipt", inner));
            console.log("Monthly renewal receipt sent to:", clientEmail);
          }
        }
      } catch (renewalError) {
        console.error("Failed to send monthly renewal receipt:", renewalError);
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