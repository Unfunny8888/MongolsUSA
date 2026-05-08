import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Apple, Globe, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const variants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Auth() {
  const [step, setStep] = useState("method");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = () => {
    setLoading(true);
    setError("");
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
    try {
      await base44.auth.redirectToLogin();
    } catch (err) {
      setError("Error with email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
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
              {/* Hero Header */}
              <div className="text-center mb-12 -mt-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-primary/40"
                >
                  <span className="text-4xl">🐎</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight"
                >
                  Connect with Mongolians everywhere
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed"
                >
                  Find jobs, housing, businesses, events, and community—all in one place
                </motion.p>

                {/* Value props */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col gap-2.5 text-sm text-slate-300 mb-4"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Join thousands of nomads</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Fast, verified, and secure</span>
                  </div>
                </motion.div>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3 mb-8">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-smooth active:scale-95 disabled:opacity-50"
                >
                  <Globe className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Continue with Google
                  </span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleAppleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-smooth active:scale-95 disabled:opacity-50"
                >
                  <Apple className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Continue with Apple
                  </span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={() => setStep("email")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 transition-smooth active:scale-95 shadow-lg shadow-primary/30"
                >
                  <Mail className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Continue with Email
                  </span>
                </motion.button>
              </div>

              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-sm text-slate-300 mb-8"
              >
                Already have an account?{" "}
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Sign in
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Secure</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fast</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Verified</span>
                  </div>
                </div>
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
                className="mb-6 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                ← Back to sign in options
              </button>

              <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">
                  Create your account
                </h1>
                <p className="text-base text-slate-300">
                  Join the Mongolian community today
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-smooth text-white placeholder:text-slate-400 text-sm"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-xs text-red-200"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-xl py-3 font-semibold gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
                >
                  {loading ? "Continuing..." : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <p className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}