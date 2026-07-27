import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@18.2.0';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Find the Stripe customer by the user's email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return Response.json({ error: 'No subscription found for this account.' }, { status: 404 });
    }
    const customerId = customers.data[0].id;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe customer portal error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}