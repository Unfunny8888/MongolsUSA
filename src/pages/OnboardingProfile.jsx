import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Upload, Check, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

const INTERESTS = [
  { id: "jobs",      label: "🎯 Jobs",      color: "from-emerald-500 to-teal-500" },
  { id: "housing",   label: "🏠 Housing",   color: "from-orange-500 to-red-500" },
  { id: "cars",      label: "🚗 Cars",      color: "from-blue-500 to-cyan-500" },
  { id: "community", label: "👥 Community", color: "from-purple-500 to-pink-500" },
  { id: "events",    label: "🎉 Events",    color: "from-pink-500 to-rose-500" },
  { id: "services",  label: "🛠️ Services",  color: "from-amber-500 to-orange-500" },
];

export default function OnboardingProfile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    avatar: null,
    full_name: "",
    location: "",
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prevent body scroll while onboarding is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar: file_url }));
    } catch {
      setError("Failed to upload image. Try a smaller file.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleNext = async () => {
    setError("");

    if (step === 2 && !formData.full_name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (step === 4 && formData.interests.length === 0) {
      setError("Choose at least one interest");
      return;
    }

    if (step === 5) {
      setLoading(true);
      try {
        // Save profile + mark onboarding complete in ONE call
        await base44.auth.updateMe({
          avatar: formData.avatar,
          full_name: formData.full_name,
          location: formData.location,
          interests: formData.interests,
          onboarded: true,  // ← single source of truth
        });

        // Refresh the user in AuthContext so the guard sees user.onboarded = true
        await refreshUser();

        // Now navigate — guard will no longer intercept
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setError("Failed to save profile. Please try again.");
        setLoading(false);
      }
      return;
    }

    setStep(prev => prev + 1);
  };

  return (
    <div className="min-h-dvh overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex flex-col">

      {/* HEADER */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 border-b border-border/20 px-4 py-4">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { if (step > 1) setStep(step - 1); }}
              className="p-2 -ml-2 hover:bg-secondary rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-muted-foreground">Step {step} of 5</span>
            <div className="w-9" />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-secondary/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-sm mx-auto">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Avatar */}
            {step === 1 && (
              <motion.div key="avatar" variants={variants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-black text-foreground mb-2">Add profile photo</h1>
                <p className="text-sm text-muted-foreground mb-8">Profiles with photos get more trust and replies</p>
                <div className="mb-8">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full aspect-square rounded-[32px] bg-gradient-to-br from-primary/10 to-emerald-600/10 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 active:scale-[0.98] overflow-hidden"
                  >
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-primary/50" />
                        <span className="text-sm font-semibold text-muted-foreground">{loading ? "Uploading..." : "Tap to upload"}</span>
                      </>
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>
                <Button onClick={handleNext} className="w-full rounded-2xl h-14 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2 — Name */}
            {step === 2 && (
              <motion.div key="name" variants={variants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-black text-foreground mb-2">What's your name?</h1>
                <p className="text-sm text-muted-foreground mb-8">Real names help build trusted communities</p>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => { setFormData(prev => ({ ...prev, full_name: e.target.value })); setError(""); }}
                  placeholder="First and last name"
                  className="w-full px-4 h-14 rounded-2xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-all text-lg font-semibold mb-4"
                  autoFocus
                />
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 mb-4">
                    {error}
                  </motion.div>
                )}
                <Button onClick={handleNext} disabled={!formData.full_name.trim()} className="w-full rounded-2xl h-14 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 3 — Location */}
            {step === 3 && (
              <motion.div key="location" variants={variants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-black text-foreground mb-2">Your location</h1>
                <p className="text-sm text-muted-foreground mb-8">Helps show nearby opportunities and people</p>
                <div className="relative mb-8">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Chicago, IL"
                    className="w-full pl-12 pr-4 h-14 rounded-2xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-all text-lg font-semibold"
                    autoFocus
                  />
                </div>
                <Button onClick={handleNext} className="w-full rounded-2xl h-14 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 4 — Interests */}
            {step === 4 && (
              <motion.div key="interests" variants={variants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-black text-foreground mb-2">What interests you?</h1>
                <p className="text-sm text-muted-foreground mb-6">Pick categories you care about</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {INTERESTS.map((interest, idx) => (
                    <motion.button
                      key={interest.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => toggleInterest(interest.id)}
                      className={`relative p-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97] ${
                        formData.interests.includes(interest.id)
                          ? `bg-gradient-to-br ${interest.color} text-white shadow-lg`
                          : "bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {interest.label}
                      {formData.interests.includes(interest.id) && (
                        <Check className="absolute top-2 right-2 w-4 h-4" />
                      )}
                    </motion.button>
                  ))}
                </div>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 mb-4">
                    {error}
                  </motion.div>
                )}
                <Button onClick={handleNext} disabled={formData.interests.length === 0} className="w-full rounded-2xl h-14 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 5 — Complete */}
            {step === 5 && (
              <motion.div key="complete" variants={variants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                  >
                    <Check className="w-12 h-12 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-black text-foreground mb-2">You're all set</h1>
                  <p className="text-sm text-muted-foreground">Welcome to NomadLink</p>
                </div>

                {formData.avatar && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 p-5 rounded-[28px] bg-secondary/30 border border-border/50"
                  >
                    <img src={formData.avatar} alt={formData.full_name} className="w-20 h-20 rounded-[24px] object-cover mx-auto" />
                    <p className="text-center mt-4 font-bold">{formData.full_name}</p>
                    <p className="text-center text-sm text-muted-foreground mt-1">{formData.location}</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
                    {error}
                  </motion.div>
                )}

                <Button onClick={handleNext} disabled={loading} className="w-full rounded-2xl h-14 font-semibold">
                  {loading ? "Setting up..." : "Start exploring"}
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}