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

    // The $1,000 build fee is a one-time purchase — block repeats per account/email
    if (type === "build") {
      const freshUser = await base44.asServiceRole.entities.User.get(user.id);
      if (freshUser?.build_fee_paid) {
        return Response.json({ error: 'Build fee already paid for this account.' }, { status: 409 });
      }
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        const sessions = await stripe.checkout.sessions.list({
          customer: customers.data[0].id,
          status: 'complete',
          limit: 100,
        });
        const alreadyPaidBuild = sessions.data.some(s => s.metadata?.type === "build");
        if (alreadyPaidBuild) {
          // Sync the flag in case the webhook missed it, then block
          await base44.asServiceRole.entities.User.update(user.id, { build_fee_paid: true });
          return Response.json({ error: 'Build fee already paid for this account.' }, { status: 409 });
        }
      }
    }

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

    // Validate the redirect origin against a trusted allowlist to prevent open redirects.
    // Only the request's own Origin header and the app's configured URL are trusted.
    const trusted = [req.headers.get("origin"), Deno.env.get("BASE44_APP_URL")]
      .filter((o): o is string => typeof o === "string" && /^https?:\/\//.test(o));
    const origin = trusted.includes(clientOrigin) ? clientOrigin : (trusted[0] || "http://localhost:3000");

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