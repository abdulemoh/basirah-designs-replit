import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@18.2.0';

const BUILD_PRICE_ID = "price_1TwB9IIOtUfemVMQCrUVEuTd"; // $1,000 one-time
const SUBSCRIPTION_PRICE_ID = "price_1Txa59IOtUfemVMQVvbz1EZi"; // $79/month

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, website_name, origin: clientOrigin } = await req.json();
    if (!type || !["build", "subscription"].includes(type)) {
      return Response.json({ error: 'Invalid purchase type' }, { status: 400 });
    }
    if (!website_name || !website_name.trim()) {
      return Response.json({ error: 'Website name is required' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    // Prevent duplicate subscriptions — one active subscription per Google account
    if (type === "subscription") {
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
    }

    const allowedOrigins = [
      "https://basirahdesigns.com",
      Deno.env.get("BASE44_APP_URL"),
      "http://localhost:3000",
      "http://localhost:5173"
    ].filter(Boolean) as string[];

    const requestOrigin = req.headers.get("origin");
    const origin = (clientOrigin && allowedOrigins.includes(clientOrigin))
      ? clientOrigin
      : (requestOrigin && allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : (Deno.env.get("BASE44_APP_URL") || "http://localhost:3000"));

    const isBuild = type === "build";
    const session = await stripe.checkout.sessions.create({
      mode: isBuild ? "payment" : "subscription",
      line_items: [
        { price: isBuild ? BUILD_PRICE_ID : SUBSCRIPTION_PRICE_ID, quantity: 1 }
      ],
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        plan: "standard",
        type,
        website_name: website_name.trim()
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});