import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@18.2.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    // Prevent duplicate subscriptions — one active subscription per Google account
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
      });
      if (subscriptions.data.length > 0) {
        return Response.json({ error: 'You already have an active subscription. Use a different Google account to purchase another.' }, { status: 409 });
      }
    }

    const allowedOrigins = [
      "https://basirahdesigns.com",
      Deno.env.get("BASE44_APP_URL"),
      "http://localhost:3000",
      "http://localhost:5173"
    ].filter(Boolean) as string[];

    const requestOrigin = req.headers.get("origin");
    const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : (Deno.env.get("BASE44_APP_URL") || "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: "price_1TwB9IIOtUfemVMQCrUVEuTd", quantity: 1 },
        { price: "price_1Txa59IOtUfemVMQVvbz1EZi", quantity: 1 }
      ],
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        plan: "standard"
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});