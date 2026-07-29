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

    // Find or create a portal configuration with subscription cancellation enabled
    let configId;
    const configs = await stripe.billingPortal.configurations.list({ active: true, limit: 10 });
    const withCancel = configs.data.find(c => c.features?.subscription_cancel?.enabled);
    if (withCancel) {
      configId = withCancel.id;
    } else {
      const config = await stripe.billingPortal.configurations.create({
        features: {
          subscription_cancel: { enabled: true, mode: 'at_period_end' },
          payment_method_update: { enabled: true },
          invoice_history: { enabled: true },
        },
      });
      configId = config.id;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
      configuration: configId,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe customer portal error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}