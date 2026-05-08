import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return Response.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, integrate with SMS service (Twilio, etc)
    // For now, store OTP and return a test endpoint
    await base44.auth.updateMe({
      phone_verification_otp: otp,
      phone_verification_sent_at: new Date().toISOString(),
      phone_pending: phone,
    });

    // Mock SMS — in production, use Twilio or similar
    console.log(`[SMS] OTP for ${phone}: ${otp}`);

    return Response.json({
      success: true,
      message: 'Verification code sent to phone',
      // Don't expose OTP in response in production
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});