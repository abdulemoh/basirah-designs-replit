import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, website, message } = await req.json();

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // 5-minute cooldown: prevent spam and integration-credit abuse.
    const COOLDOWN_MS = 5 * 60 * 1000;
    const recent = await base44.asServiceRole.entities.Application.filter(
      { email },
      '-created_date',
      1
    );
    if (recent.length > 0) {
      const last = new Date(recent[0].created_date).getTime();
      if (Date.now() - last < COOLDOWN_MS) {
        return Response.json({ error: 'Too many submissions. Please wait a few minutes before submitting again.' }, { status: 429 });
      }
    }

    await base44.asServiceRole.entities.Application.create({
      name,
      email,
      website,
      message,
      status: "new",
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Submit application error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});