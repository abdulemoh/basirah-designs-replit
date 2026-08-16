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

      // Send client receipt via Gmail, with an exact Bcc copy to the admin
      // (the admin copy is the chargeback-evidence receipt you can screenshot).
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
            await sendGmailHtml(base44, clientEmail, subject, brandedShell("Your Build Fee Receipt", inner), ["basirahdesigns@gmail.com"]);
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
            await sendGmailHtml(base44, clientEmail, subject, brandedShell("Your Subscription Receipt", inner), ["basirahdesigns@gmail.com"]);
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
            await sendGmailHtml(base44, clientEmail, subject, brandedShell("Your Monthly Receipt", inner), ["basirahdesigns@gmail.com"]);
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