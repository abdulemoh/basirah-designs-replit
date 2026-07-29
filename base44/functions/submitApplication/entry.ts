import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, website, message } = await req.json();

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required.' }, { status: 400 });
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