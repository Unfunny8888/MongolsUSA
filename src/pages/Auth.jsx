import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Apple, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const variants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Auth() {
  const [step, setStep] = useState("method"); // method, email, verify
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // Social auth handlers
  const handleGoogleAuth = () => {
    setLoading(true);
    setError("");
    // Google OAuth redirect would happen here via base44
    try {
      base44.auth.redirectToLogin();
    } catch (err) {
      setError("Google sign-in failed. Try email instead.");
      setLoading(false);
    }
  };

  const handleAppleAuth = () => {
    setLoading(true);
    setError("");
    try {
      base44.auth.redirectToLogin();
    } catch (err) {
      setError("Apple sign-in failed. Try email instead.");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    // Email signup/login would be handled by base44
    try {
      await base44.auth.redirectToLogin();
    } catch (err) {
      setError("Error with email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex flex-col items-center justify-center px-4 py-6 overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10 dark:bg-primary/5" />
      <div className="fixed bottom-20 left-5 w-60 h-60 bg-emerald-400/5 rounded-full blur-3xl -z-10" />

      <AnimatePresence mode="wait">
        {step === "method" && (
          <motion.div
            key="method"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            {/* Logo / Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <span className="text-3xl">🐎</span>
              </motion.div>
              <h1 className="text-3xl font-extrabold text-foreground mb-1">
                NomadLink
              </h1>
              <p className="text-sm text-muted-foreground">
                Join the Mongolian community
              </p>
            </div>

            {/* Auth Methods */}
            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-smooth active:scale-95 disabled:opacity-50"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-semibold">Continue with Google</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleAppleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 transition-smooth active:scale-95 disabled:opacity-50"
              >
                <Apple className="w-5 h-5" />
                <span className="text-sm font-semibold">Continue with Apple</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => setStep("email")}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-600/10 dark:from-primary/5 dark:to-emerald-600/5 border border-primary/20 dark:border-primary/10 hover:from-primary/15 hover:to-emerald-600/15 transition-smooth active:scale-95"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Continue with Email
                </span>
              </motion.button>
            </div>

            {/* Login toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center text-sm text-muted-foreground"
            >
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-8 flex items-center justify-center gap-4 text-[11px] text-muted-foreground"
            >
              <span>✓ Secure</span>
              <span>•</span>
              <span>✓ Verified</span>
              <span>•</span>
              <span>✓ Private</span>
            </motion.div>
          </motion.div>
        )}

        {step === "email" && (
          <motion.div
            key="email"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <button
              onClick={() => setStep("method")}
              className="mb-6 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-foreground mb-2">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Welcome back to NomadLink"
                  : "Join thousands of nomads"}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-sm"
                  disabled={loading}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-xl py-3 font-semibold gap-2"
              >
                {loading ? "Continuing..." : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="mt-4 text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms and Privacy Policy
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}