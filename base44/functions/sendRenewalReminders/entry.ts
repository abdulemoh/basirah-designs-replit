import Stripe from 'npm:stripe@18.2.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendGmailHtml, brandedShell, detailsTable, escapeHtml } from '../../shared/gmail.ts';

// Invoked daily by the "Renewal Reminder" scheduled workflow.
// Emails each client a pre-charge reminder ~3 days before their monthly
// subscription renews. Tracks sent state in subscription.metadata.bd_reminder_sent_period
// so a reminder is sent at most once per billing period.
export default async function(req: Request): Promise<Response> {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);

    const now = Math.floor(Date.now() / 1000);
    const windowSeconds = 3 * 24 * 60 * 60; // 3 days
    const appUrl = Deno.env.get("BASE44_APP_URL") || "https://basirah-designs.base44.app";

    let sent = 0;
    let skipped = 0;
    let lastId: string | undefined = undefined;

    while (true) {
      const params: any = { status: "active", limit: 100 };
      if (lastId) params.starting_after = lastId;
      const subs = await stripe.subscriptions.list(params);

      for (const sub of subs.data) {
        const periodEnd = sub.current_period_end; // unix seconds
        const until = periodEnd - now;
        // Renewing within the 3-day window (and not already past).
        if (until > 0 && until <= windowSeconds) {
          const periodKey = String(periodEnd);
          if (sub.metadata?.bd_reminder_sent_period === periodKey) {
            skipped++;
          } else {
            try {
              const customer = await stripe.customers.retrieve(sub.customer);
              const email = (customer as any)?.email;
              if (email) {
                const renewDate = new Date(periodEnd * 1000)
                  .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                const subject = "Your Basirah Designs subscription renews soon";
                const inner = `
                  <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">Hi there,</p>
                  <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">This is a friendly reminder that your Basirah Designs Monthly Managed Service will renew on <strong>${escapeHtml(renewDate)}</strong>.</p>
                  ${detailsTable([
                    ["Plan", "Monthly Managed Service"],
                    ["Amount", "$79.00 USD / month"],
                    ["Renews on", escapeHtml(renewDate)],
                  ])}
                  <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 24px 0 12px;">No action is needed if you&rsquo;d like to continue &mdash; your subscription renews automatically.</p>
                  <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0 0 12px;"><strong>Need to change or cancel?</strong> Sign in at <a href="${escapeHtml(appUrl)}" style="color: #B8973A;">${escapeHtml(appUrl)}</a> and use the &ldquo;Manage Subscription&rdquo; button in the pricing section.</p>
                  <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0;">Questions? Just reply to this email or call 859-447-5611.</p>`;
                await sendGmailHtml(base44, email, subject, brandedShell("Subscription Renewing Soon", inner));

                // Mark this period as notified so we don't re-send tomorrow.
                await stripe.subscriptions.update(sub.id, {
                  metadata: { ...sub.metadata, bd_reminder_sent_period: periodKey },
                });
                sent++;
              }
            } catch (e) {
              console.error("Reminder failed for subscription", sub.id, e);
            }
          }
        }
        lastId = sub.id;
      }

      if (!subs.has_more) break;
    }

    console.log(`Renewal reminders complete: sent=${sent}, skipped(alreadySent)=${skipped}`);
    return Response.json({ sent, skipped });
  } catch (error) {
    console.error("Renewal reminder error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}