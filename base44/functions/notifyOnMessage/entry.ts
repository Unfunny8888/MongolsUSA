import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Triggered by entity automation on Message create
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const msg = body.data || {};
    const { to_user, from_name, content, listing_title, conversation_id } = msg;

    if (!to_user || !from_name) {
      return Response.json({ skipped: true, reason: 'Missing recipient or sender' });
    }

    // Don't notify if it's a system/image-only message
    const preview = content?.trim() ? (content.length > 60 ? content.slice(0, 60) + "…" : content) : "📷 Sent an image";

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: to_user,
      type: "message",
      title: `New message from ${from_name}`,
      body: listing_title ? `Re: ${listing_title} — "${preview}"` : `"${preview}"`,
      link: `/conversation/${conversation_id}?other=${encodeURIComponent(from_name)}`,
      priority: "high",
    });

    // Send email to recipient
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: to_user,
      subject: `💬 New message from ${from_name} on NomadLink`,
      body: `Hi,\n\nYou have a new message from ${from_name}${listing_title ? ` about "${listing_title}"` : ""}:\n\n"${preview}"\n\nOpen NomadLink to reply.\n\n— NomadLink Team`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});