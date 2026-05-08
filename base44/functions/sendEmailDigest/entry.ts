import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled daily — sends email digest of unread notifications
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all unread notifications from last 24h
    const allNotifs = await base44.asServiceRole.entities.Notification.filter({ is_read: false }, "-created_date", 200);
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const recent = allNotifs.filter(n => n.created_date && new Date(n.created_date).getTime() > yesterday);

    // Group by user
    const byUser = {};
    for (const n of recent) {
      if (!byUser[n.user_email]) byUser[n.user_email] = [];
      byUser[n.user_email].push(n);
    }

    let sent = 0;
    for (const [email, notifs] of Object.entries(byUser)) {
      // Only send if 2+ unread notifications
      if (notifs.length < 2) continue;

      // Get AI-generated summary
      const summary = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write a short, friendly 2-sentence email digest summary for a NomadLink user who has ${notifs.length} unread notifications. Types: ${notifs.map(n => n.type).join(", ")}. Titles: ${notifs.map(n => n.title).slice(0, 5).join("; ")}. Be warm and concise.`,
      });

      const lines = notifs.slice(0, 8).map(n => `• ${n.title}${n.body ? `: ${n.body.slice(0, 80)}` : ""}`).join("\n");

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `🔔 You have ${notifs.length} updates on NomadLink`,
        body: `${summary}\n\nYour recent activity:\n${lines}\n\nOpen NomadLink to view all notifications.\n\n— NomadLink Team\n\nTo unsubscribe from email digests, update your notification settings in the app.`
      });
      sent++;
    }

    return Response.json({ success: true, digests_sent: sent, users_processed: Object.keys(byUser).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});