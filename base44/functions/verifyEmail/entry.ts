import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.email_verified) {
      return Response.json({
        success: true,
        message: 'Email already verified',
        verification_token: null,
      });
    }

    // Generate verification token (6-char alphanumeric)
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Send verification email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'NomadLink',
      subject: 'Verify your NomadLink email',
      body: `Hi ${user.full_name},

Welcome to NomadLink! Please verify your email address to unlock all features.

Your verification code: ${token}

Or visit this link to verify:
${Deno.env.get('APP_URL')}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}

This code expires in 24 hours.

Thanks,
NomadLink Team`,
    });

    // Store verification token in user metadata (expires in 24h)
    await base44.auth.updateMe({
      email_verification_token: token,
      email_verification_sent_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Verification email sent',
      verification_token: null, // Don't expose token in response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});