import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function EmailVerificationModal({ email, isOpen, onVerified }) {
  const [step, setStep] = useState('verify'); // 'verify' or 'confirm'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSendVerification = async () => {
    setLoading(true);
    setError('');
    try {
      await base44.functions.invoke('verifyEmail', {});
      setStep('confirm');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (code.length !== 6) {
      setError('Code must be 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('confirmEmailVerification', { token: code });
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
    setResendLoading(true);
    try {
      await base44.functions.invoke('verifyEmail', {});
      setCode('');
      setError('');
    } catch (err) {
      setError('Failed to resend code');
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
          {step === 'verify' ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Verify Your Email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We'll send a verification code to <span className="font-semibold">{email}</span>
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

              <Button
                onClick={handleSendVerification}
                disabled={loading}
                className="w-full rounded-xl py-3 font-semibold gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                You can skip this and verify later in your profile settings
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
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
                Check your email for a 6-character code
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
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().slice(0, 6));
                  setError('');
                }}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-center text-lg font-mono tracking-widest mb-4"
                autoFocus
              />

              <Button
                onClick={handleConfirmCode}
                disabled={loading || code.length !== 6}
                className="w-full rounded-xl py-3 font-semibold gap-2 mb-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
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