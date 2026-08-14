import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Only allow authenticated platform calls (e.g. the workflow trigger).
    // Anonymous external HTTP requests are rejected.
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, website, message, photo_urls } = await req.json();
    const photos = Array.isArray(photo_urls) ? photo_urls.map(String) : [];

    const escapeHtml = (str: string): string =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const safeName = escapeHtml(name || "—");
    const safeEmail = escapeHtml(email || "—");
    const safeWebsite = escapeHtml(website || "None provided");
    const safeMessage = escapeHtml(message || "No additional details provided.");

    const adminEmail = "abdullah.mohiuddin90@gmail.com";
    // Strip control characters (CRLF/newlines/tabs) to prevent header injection
    const cleanName = String(name || "—").replace(/[\r\n\t<>]/g, " ").trim() || "—";
    const subject = `New Project Application from ${cleanName}`;

    const htmlBody = `
    <div style="background-color: #FAF7F2; padding: 40px 20px; font-family: Arial, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #F5F0E8; border: 1px solid #E5DDD0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1C1810; padding: 32px 40px;">
          <p style="color: #B8973A; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 8px 0;">Basirah Designs</p>
          <h1 style="color: #FAF7F2; font-size: 24px; font-weight: 300; margin: 0;">New Project Application</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #7A6E62; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px 0;">Applicant Details</p>
          <div style="background-color: #FAF7F2; border: 1px solid #DDD4C0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0; width: 100px;">Name</td>
                <td style="color: #1C1810; font-size: 16px; font-weight: 600; padding: 8px 0;">${safeName}</td>
              </tr>
              <tr>
                <td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0;">Email</td>
                <td style="color: #1C1810; font-size: 16px; padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #B8973A; text-decoration: none;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="color: #7A6E62; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 0;">Website</td>
                <td style="color: #1C1810; font-size: 16px; padding: 8px 0;">${safeWebsite}</td>
              </tr>
            </table>
          </div>
          <p style="color: #7A6E62; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">Project Details</p>
          <div style="background-color: #FAF7F2; border: 1px solid #DDD4C0; border-radius: 8px; padding: 24px;">
            <p style="color: #1C1810; font-size: 15px; line-height: 1.7; margin: 0;">${safeMessage}</p>
          </div>
          ${photos.length ? `
          <p style="color: #7A6E62; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 24px 0 16px 0;">Attached Images</p>
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            ${photos.map((u: string) => `<a href="${escapeHtml(u)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(u)}" alt="attachment" style="width: 120px; height: 120px; object-fit: cover; border: 1px solid #DDD4C0; border-radius: 8px;" /></a>`).join("")}
          </div>` : ""}
        </div>
        <div style="border-top: 1px solid #E5DDD0; padding: 24px 40px; text-align: center;">
          <p style="color: #7A6E62; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Basirah Designs &mdash; High-quality web design for the uncompromising few.</p>
        </div>
      </div>
    </div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminEmail,
      subject: subject,
      body: htmlBody,
      from_name: "Basirah Designs"
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Application alert email error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}