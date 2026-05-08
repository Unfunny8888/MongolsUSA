import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITIES } from "../lib/mockData";
import { base44 } from "@/api/base44Client";

const STEPS = ["welcome", "city", "interests", "done"];

const INTEREST_OPTIONS = [
  { id: "jobs", label: "Jobs", emoji: "💼" },
  { id: "housing", label: "Housing", emoji: "🏠" },
  { id: "cars", label: "Cars", emoji: "🚗" },
  { id: "events", label: "Events", emoji: "🎉" },
  { id: "services", label: "Services", emoji: "🔧" },
  { id: "community", label: "Community", emoji: "👥" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  function toggleInterest(id) {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function finish() {
    setSaving(true);
    await base44.auth.updateMe({ preferred_city: city, interests, onboarded: true });
    navigate("/");
  }

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-emerald-700 to-teal-800 flex flex-col">
      {/* Progress */}
      <div className="flex gap-1.5 px-6 pt-14">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-smooth ${i <= step ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center text-white"
          >
            <div className="text-7xl mb-6">🐎</div>
            <h1 className="text-3xl font-extrabold mb-3">Welcome to NomadLink</h1>
            <p className="text-emerald-100 text-base leading-relaxed mb-10">
              The #1 community marketplace for Mongolians in the USA. Let's personalize your experience.
            </p>
            <p className="text-xs text-emerald-200/70 mb-3">Монгол хэлний дэмжлэгтэй • Bilingual support</p>
            <Button
              onClick={() => setStep(s => s + 1)}
              className="bg-white text-primary hover:bg-white/90 rounded-2xl px-10 py-6 text-base font-bold shadow-xl gap-2"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {currentStep === "city" && (
          <motion.div
            key="city"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex-1 flex flex-col px-6 pt-10 text-white"
          >
            <div className="mb-8">
              <MapPin className="w-8 h-8 mb-3 opacity-80" />
              <h2 className="text-2xl font-extrabold mb-2">Where are you?</h2>
              <p className="text-emerald-100 text-sm">See listings near you first.</p>
            </div>
            <div className="space-y-2.5 flex-1">
              {CITIES.filter(c => c.state).map(c => (
                <button
                  key={c.name}
                  onClick={() => setCity(c.name)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-smooth ${
                    city === c.name ? "bg-white text-primary shadow-xl" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${city === c.name ? "bg-primary/10" : "bg-white/10"}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{c.name}, {c.state}</p>
                    <p className={`text-xs ${city === c.name ? "text-primary/60" : "text-emerald-200"}`}>{c.count.toLocaleString()} active members</p>
                  </div>
                  {city === c.name && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!city}
              className="bg-white text-primary hover:bg-white/90 rounded-2xl py-6 text-base font-bold mt-6 mb-8 gap-2 disabled:opacity-40"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {currentStep === "interests" && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex-1 flex flex-col px-6 pt-10 text-white"
          >
            <div className="mb-8">
              <Bell className="w-8 h-8 mb-3 opacity-80" />
              <h2 className="text-2xl font-extrabold mb-2">What are you looking for?</h2>
              <p className="text-emerald-100 text-sm">Select all that apply.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {INTEREST_OPTIONS.map(opt => {
                const active = interests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleInterest(opt.id)}
                    className={`p-5 rounded-2xl text-center transition-smooth ${active ? "bg-white text-primary shadow-xl" : "bg-white/10 hover:bg-white/20"}`}
                  >
                    <div className="text-3xl mb-2">{opt.emoji}</div>
                    <p className={`text-sm font-semibold ${active ? "text-primary" : "text-white"}`}>{opt.label}</p>
                    {active && <Check className="w-4 h-4 text-primary mx-auto mt-1" />}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={() => setStep(s => s + 1)}
              className="bg-white text-primary hover:bg-white/90 rounded-2xl py-6 text-base font-bold mt-6 mb-8 gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {currentStep === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center text-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center text-5xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-extrabold mb-3">You're all set!</h2>
            <p className="text-emerald-100 text-sm mb-10 leading-relaxed">
              Your feed is personalized for <strong>{city}</strong>. Start exploring listings, communities, and businesses.
            </p>
            <Button
              onClick={finish}
              disabled={saving}
              className="bg-white text-primary hover:bg-white/90 rounded-2xl px-10 py-6 text-base font-bold shadow-xl"
            >
              {saving ? "Saving..." : "Explore NomadLink 🚀"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}