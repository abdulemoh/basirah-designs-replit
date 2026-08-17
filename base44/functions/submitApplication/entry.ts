import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendGmailHtml } from '../../shared/gmail.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { application_id, ...fields } = body || {};

    if (!application_id) {
      return Response.json({ error: 'Missing application id.' }, { status: 400 });
    }

    // Cooldown: prevent rapid re-submission that would spam the admin email.
    const COOLDOWN_MS = 5 * 60 * 1000;
    const recent = await base44.asServiceRole.entities.Application.filter(
      { created_by_id: user.id, status: "new" },
      '-created_date',
      1
    );
    if (recent.length > 0) {
      const last = new Date(recent[0].updated_date || recent[0].created_date).getTime();
      if (Date.now() - last < COOLDOWN_MS) {
        return Response.json({ error: 'You already submitted recently. Please wait a few minutes before submitting again.' }, { status: 429 });
      }
    }

    // Verify the applicant owns the draft they are submitting.
    const existing = await base44.asServiceRole.entities.Application.get(application_id).catch(() => null);
    if (!existing || existing.created_by_id !== user.id) {
      return Response.json({ error: 'Application not found.' }, { status: 404 });
    }

    const str = (v: unknown) => (v == null ? "" : String(v));
    const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);

    const payload = {
      name: str(user.full_name || fields.name),
      email: str(user.email || fields.email),
      status: "new",
      business_name: str(fields.business_name),
      business_email: str(fields.business_email),
      business_description: str(fields.business_description),
      three_things: str(fields.three_things),
      on_google_maps: !!fields.on_google_maps,
      google_maps_link: str(fields.google_maps_link),
      inspiration_websites: str(fields.inspiration_websites),
      color_preferences: str(fields.color_preferences),
      overall_feeling: str(fields.overall_feeling),
      font_preferences: str(fields.font_preferences),
      page_count: str(fields.page_count),
      special_functionality: str(fields.special_functionality),
      logo_url: str(fields.logo_url),
      photo_urls: arr(fields.photo_urls),
      has_website: !!fields.has_website,
      current_website_link: str(fields.current_website_link),
      current_website_likes_dislikes: str(fields.current_website_likes_dislikes),
      website_type: str(fields.website_type),
      main_goal: str(fields.main_goal),
      other_goal: str(fields.other_goal),
      social_links: str(fields.social_links),
      testimonials: str(fields.testimonials),
      contact_methods: arr(fields.contact_methods),
      contact_phone: str(fields.contact_phone),
      contact_email: str(fields.contact_email),
      contact_address: str(fields.contact_address),
      contact_hours: str(fields.contact_hours),
    };

    const record = await base44.asServiceRole.entities.Application.update(application_id, payload);

    // Build the admin alert email.
    const escapeHtml = (s: string): string =>
      String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const safe = (v: unknown) => escapeHtml(str(v)) || "—";
    const link = (url: string, label?: string) => {
      const u = str(url).trim();
      if (!u) return "—";
      const href = u.startsWith("http") ? u : `https://${u}`;
      return `<a href="${escapeHtml(href)}" style="color:#B8973A;text-decoration:none;">${escapeHtml(label || u)}</a>`;
    };
    const photos = arr(fields.photo_urls).map((u) => link(u, "View photo")).join("<br>") || "—";
    const contactMethods = arr(fields.contact_methods).join(", ") || "—";

    const row = (label: string, valueHtml: string) => `
      <tr>
        <td style="color:#7A6E62;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:6px 0;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="color:#1C1810;font-size:14px;line-height:1.55;padding:6px 0;">${valueHtml}</td>
      </tr>`;
    const section = (title: string, rowsHtml: string) => `
      <p style="color:#B8973A;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 10px 0;">${escapeHtml(title)}</p>
      <div style="background-color:#FAF7F2;border:1px solid #DDD4C0;border-radius:8px;padding:18px 22px;">
        <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
      </div>`;

    const cleanName = str(user.full_name || fields.name).replace(/[\r\n\t<>]/g, " ").trim() || "—";
    const subject = `New Project Application from ${cleanName}`;

    const htmlBody = `
    <div style="background-color:#FAF7F2;padding:36px 16px;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#F5F0E8;border:1px solid #E5DDD0;border-radius:12px;overflow:hidden;">
        <div style="background-color:#1C1810;padding:28px 36px;">
          <p style="color:#B8973A;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px 0;">Basirah Designs</p>
          <h1 style="color:#FAF7F2;font-size:22px;font-weight:300;margin:0;">New Project Application</h1>
        </div>
        <div style="padding:32px 36px;">
          <p style="color:#7A6E62;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px 0;">Applicant</p>
          <div style="background-color:#FAF7F2;border:1px solid #DDD4C0;border-radius:8px;padding:18px 22px;margin-bottom:6px;">
            <table style="width:100%;border-collapse:collapse;">
              ${row("Name", safe(user.full_name || fields.name))}
              ${row("Email", `<a href="mailto:${safe(user.email)}" style="color:#B8973A;text-decoration:none;">${safe(user.email)}</a>`)}
            </table>
          </div>
          ${section("Section 1 — Business Info",
            row("Business Name", safe(fields.business_name))
            + row("Business Email", `<a href="mailto:${safe(fields.business_email)}" style="color:#B8973A;text-decoration:none;">${safe(fields.business_email)}</a>`)
            + row("What They Do", safe(fields.business_description).replace(/\n/g, "<br>"))
            + row("Three Things", safe(fields.three_things).replace(/\n/g, "<br>"))
            + row("On Google Maps", fields.on_google_maps ? "Yes" : (fields.on_google_maps == null ? "—" : "No"))
            + (fields.on_google_maps ? row("Maps Link", link(fields.google_maps_link)) : "")
          )}
          ${section("Section 2 — Design Preferences",
            row("Inspiration Sites", safe(fields.inspiration_websites).replace(/\n/g, "<br>"))
            + row("Colors", safe(fields.color_preferences).replace(/\n/g, "<br>"))
            + row("Overall Feeling", safe(fields.overall_feeling))
            + row("Fonts", safe(fields.font_preferences) || "We'll choose")
          )}
          ${section("Section 3 — Scope & Logistics",
            row("Pages", safe(fields.page_count))
            + row("Special Features", safe(fields.special_functionality).replace(/\n/g, "<br>"))
            + row("Logo", fields.logo_url ? link(fields.logo_url, "View logo") : "—")
            + row("Photos", photos)
          )}
          ${section("Section 4 — Current State",
            row("Has Website", fields.has_website ? "Yes" : (fields.has_website == null ? "—" : "No"))
            + (fields.has_website ? row("Current Site", link(fields.current_website_link)) : "")
            + (fields.has_website ? row("Likes / Dislikes", safe(fields.current_website_likes_dislikes).replace(/\n/g, "<br>")) : "")
          )}
          ${section("Section 5 — Business Goals",
            row("Website Type", safe(fields.website_type))
            + row("Main Goal", safe(fields.main_goal) === "Other" ? `Other — ${safe(fields.other_goal)}` : safe(fields.main_goal))
          )}
          ${section("Section 6 — Contact Info",
            row("Contact Methods", escapeHtml(contactMethods))
            + (arr(fields.contact_methods).includes("Business phone") ? row("Phone", safe(fields.contact_phone)) : "")
            + (arr(fields.contact_methods).includes("Business email") ? row("Email", safe(fields.contact_email)) : "")
            + (arr(fields.contact_methods).includes("Address") ? row("Address", safe(fields.contact_address).replace(/\n/g, "<br>")) : "")
            + (arr(fields.contact_methods).includes("Business hours") ? row("Hours", safe(fields.contact_hours)) : "")
            + row("Social Links", safe(fields.social_links).replace(/\n/g, "<br>"))
            + row("Testimonials", safe(fields.testimonials).replace(/\n/g, "<br>"))
          )}
        </div>
        <div style="border-top:1px solid #E5DDD0;padding:20px 36px;text-align:center;">
          <p style="color:#7A6E62;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Basirah Designs</p>
        </div>
      </div>
    </div>`;

    const toEmail = "basirahdesigns@gmail.com";
    await sendGmailHtml(base44, toEmail, subject, htmlBody);

    return Response.json({ success: true, id: record.id });
  } catch (error) {
    console.error("Submit application error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});