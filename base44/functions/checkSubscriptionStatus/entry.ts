import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@18.2.0';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ hasSubscriptions: false, count: 0 });

    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return Response.json({ hasSubscriptions: false, count: 0 });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
    });

    return Response.json({
      hasSubscriptions: subscriptions.data.length > 0,
      count: subscriptions.data.length,
      buildFeePaid: !!user.build_fee_paid
    });
  } catch (error) {
    console.error("Check subscription status error:", error);
    return Response.json({ hasSubscriptions: false, count: 0 });
  }
}