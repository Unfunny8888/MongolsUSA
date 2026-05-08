import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PhoneVerificationModal({ isOpen, onVerified }) {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await base44.functions.invoke('verifyPhone', { phone: digits });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOTP = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('confirmPhoneVerification', { otp });
      if (res.data?.success) {
        onVerified?.(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const digits = phone.replace(/\D/g, '');
    setResendLoading(true);
    try {
      await base44.functions.invoke('verifyPhone', { phone: digits });
      setOtp('');
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card rounded-3xl border border-border/50 max-w-sm w-full p-6 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Add Phone Number</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Optional: Verify your phone to boost trust and unlock features
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 mb-4"
                >
                  {error}
                </motion.div>
              )}

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  setError('');
                }}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-center mb-4"
                autoFocus
              />

              <Button
                onClick={handleSendOTP}
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="w-full rounded-xl py-3 font-semibold gap-2 mb-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                You can skip this and add phone later
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Enter Verification Code</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a 6-digit code to {formatPhone(phone)}
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 mb-4 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-center text-lg font-mono tracking-widest mb-4"
                autoFocus
              />

              <Button
                onClick={handleConfirmOTP}
                disabled={loading || otp.length !== 6}
                className="w-full rounded-xl py-3 font-semibold gap-2 mb-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Phone
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>

              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-xs text-primary hover:underline transition-colors"
              >
                {resendLoading ? 'Resending...' : 'Resend code'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}