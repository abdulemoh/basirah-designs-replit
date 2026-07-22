import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, website, message } = await req.json();

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const accessKey = Deno.env.get("WEB3FORMS_ACCESS_KEY");

    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New Project Application from ${name}`,
        from_name: "Basirah Designs",
        name,
        email,
        website: website || "N/A",
        message: message || "No message provided.",
      }),
    });

    const web3Data = await web3Response.json();

    if (!web3Data.success) {
      return Response.json({ error: "Web3Forms submission failed.", details: web3Data }, { status: 500 });
    }

    // Also save to database
    await base44.asServiceRole.entities.Application.create({
      name,
      email,
      website,
      message,
      status: "new",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});