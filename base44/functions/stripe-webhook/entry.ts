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
      if (userId) {
        await base44.asServiceRole.entities.User.update(userId, { membership_status: "active" });
        console.log("Membership status set to active for user:", userId);
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