import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otp } = await req.json();

    if (!otp || otp.length !== 6) {
      return Response.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Check OTP validity
    if (user.phone_verification_otp !== otp) {
      return Response.json({ error: 'Incorrect verification code' }, { status: 400 });
    }

    // Check OTP expiration (10 minutes)
    const sentAt = new Date(user.phone_verification_sent_at);
    const now = new Date();
    const minutesDiff = (now - sentAt) / (1000 * 60);

    if (minutesDiff > 10) {
      return Response.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Mark phone as verified
    await base44.auth.updateMe({
      phone: user.phone_pending,
      phone_verified: true,
      phone_verification_otp: null,
      phone_verification_sent_at: null,
      phone_pending: null,
    });

    // Award reputation for phone verification
    try {
      await base44.functions.invoke('calculateReputation', {
        action: 'phone_verified',
        email: user.email,
      });
    } catch (err) {
      console.error('Failed to update reputation:', err.message);
    }

    return Response.json({
      success: true,
      message: 'Phone verified successfully',
      phone_verified: true,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});