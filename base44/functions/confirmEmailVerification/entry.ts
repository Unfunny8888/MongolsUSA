import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token || token.length !== 6) {
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Check token validity
    if (user.email_verification_token !== token) {
      return Response.json({ error: 'Incorrect verification code' }, { status: 400 });
    }

    // Check token expiration (24 hours)
    const sentAt = new Date(user.email_verification_sent_at);
    const now = new Date();
    const hoursDiff = (now - sentAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return Response.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Mark email as verified
    await base44.auth.updateMe({
      email_verified: true,
      email_verification_token: null,
      email_verification_sent_at: null,
    });

    // Award reputation for email verification
    try {
      await base44.functions.invoke('calculateReputation', {
        action: 'email_verified',
        email: user.email,
      });
    } catch (err) {
      console.error('Failed to update reputation:', err.message);
    }

    return Response.json({
      success: true,
      message: 'Email verified successfully',
      email_verified: true,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});