import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Search, Upload, Sparkles, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const CITIES = [
  "Chicago",
  "New York",
  "Los Angeles",
  "Denver",
  "Seattle",
  "Arlington",
  "San Francisco",
  "Boston",
  "Washington DC",
  "Miami",
  "Phoenix",
  "Ulaanbaatar",
];

const INTERESTS = [
  { id: "jobs", label: "🎯 Jobs", color: "from-emerald-500 to-teal-500" },
  { id: "housing", label: "🏠 Housing", color: "from-orange-500 to-red-500" },
  { id: "cars", label: "🚗 Cars", color: "from-blue-500 to-cyan-500" },
  { id: "services", label: "🛠️ Services", color: "from-purple-500 to-pink-500" },
  { id: "events", label: "🎉 Events", color: "from-pink-500 to-rose-500" },
  { id: "community", label: "👥 Community", color: "from-indigo-500 to-purple-500" },
  { id: "business", label: "💼 Business", color: "from-amber-500 to-orange-500" },
  { id: "cdl", label: "🚛 CDL Jobs", color: "from-slate-500 to-gray-600" },
  { id: "food", label: "🍜 Food", color: "from-red-500 to-rose-500" },
  { id: "buysell", label: "💳 Buy/Sell", color: "from-green-500 to-emerald-600" },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("english");
  const [selectedCity, setSelectedCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const filteredCities = CITIES.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatar(file_url);
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    setError("");
    
    if (step === 2 && !selectedCity) {
      setError("Please select a city");
      return;
    }
    if (step === 3 && selectedInterests.length === 0) {
      setError("Please select at least one interest");
      return;
    }
    if (step === 5) {
      // Final step: generate personalized content
      setAiLoading(true);
      try {
        await base44.auth.updateMe({
          language,
          city: selectedCity,
          interests: selectedInterests,
          display_name: displayName,
          bio,
          avatar,
        });
        // Generate personalized feed
        await base44.functions.invoke("generatePersonalizedFeed", {
          language,
          city: selectedCity,
          interests: selectedInterests,
        });
        navigate("/");
      } catch (err) {
        setError("Failed to set up profile");
        setAiLoading(false);
      }
      return;
    }
    setStep((prev) => prev + 1);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex flex-col">
      {/* Header with progress */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border-b border-border/20 px-4 py-4">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
              className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-smooth"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-muted-foreground">
              Step {step} of 5
            </span>
            <div className="w-9" />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-smooth ${
                  i <= step ? "bg-primary" : "bg-secondary/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Language */}
            {step === 1 && (
              <motion.div
                key="language"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-extrabold text-foreground mb-2">
                  Choose your language
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                  You can change this anytime in settings
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { id: "english", label: "🇺🇸 English" },
                    { id: "mongolian", label: "🇲🇳 Mongolian" },
                  ].map((lang) => (
                    <motion.button
                      key={lang.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setLanguage(lang.id)}
                      className={`p-4 rounded-2xl font-semibold transition-smooth active:scale-95 ${
                        language === lang.id
                          ? "bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg"
                          : "bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {lang.label}
                      {language === lang.id && (
                        <Check className="inline ml-2 w-4 h-4" />
                      )}
                    </motion.button>
                  ))}
                </div>

                <Button onClick={handleNext} className="w-full rounded-xl py-3 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: City */}
            {step === 2 && (
              <motion.div
                key="city"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-extrabold text-foreground mb-2">
                  Where are you based?
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  We'll show you local listings and events
                </p>

                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-sm"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-8 max-h-48 overflow-y-auto">
                  {filteredCities.map((city, idx) => (
                    <motion.button
                      key={city}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedCity(city)}
                      className={`p-3 rounded-xl text-sm font-semibold transition-smooth ${
                        selectedCity === city
                          ? "bg-primary text-white shadow-lg"
                          : "bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>

                {error && (
                  <motion.div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 mb-4">
                    {error}
                  </motion.div>
                )}

                <Button onClick={handleNext} disabled={!selectedCity} className="w-full rounded-xl py-3 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <motion.div
                key="interests"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-extrabold text-foreground mb-2">
                  What interests you?
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Pick at least one category
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {INTERESTS.map((interest, idx) => (
                    <motion.button
                      key={interest.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => toggleInterest(interest.id)}
                      className={`relative p-3 rounded-xl text-sm font-semibold transition-smooth active:scale-95 ${
                        selectedInterests.includes(interest.id)
                          ? `bg-gradient-to-br ${interest.color} text-white shadow-lg`
                          : "bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {interest.label}
                      {selectedInterests.includes(interest.id) && (
                        <Check className="absolute top-1 right-1 w-3 h-3" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {error && (
                  <motion.div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 mb-4">
                    {error}
                  </motion.div>
                )}

                <Button onClick={handleNext} disabled={selectedInterests.length === 0} className="w-full rounded-xl py-3 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 4: Profile Setup */}
            {step === 4 && (
              <motion.div
                key="profile"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-extrabold text-foreground mb-2">
                  Complete your profile
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Optional—add a photo, name, and bio
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full aspect-square rounded-2xl bg-secondary/50 border-2 border-dashed border-border/50 hover:border-primary/60 transition-smooth flex flex-col items-center justify-center gap-2 mb-6 active:scale-95"
                >
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {loading ? "Uploading..." : "Add photo"}
                      </span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name (optional)"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-sm mb-3"
                />

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio (optional)"
                  maxLength={150}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-sm resize-none mb-2"
                />
                <p className="text-xs text-muted-foreground mb-6">{bio.length}/150</p>

                <Button onClick={handleNext} className="w-full rounded-xl py-3 font-semibold gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 5: AI Personalization */}
            {step === 5 && (
              <motion.div
                key="ai"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                {aiLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, easing: "linear" }}
                      className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-extrabold text-foreground mb-2">
                      Nomad AI is preparing your feed
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      We're personalizing your experience based on your interests and location
                    </p>
                    <div className="mt-8 space-y-2">
                      {["Generating personalized feed", "Recommending groups", "Suggesting businesses", "Finding nearby listings"].map((text, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.4 }}
                          className="text-xs text-muted-foreground flex items-center justify-center gap-2"
                        >
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {text}
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-extrabold text-foreground mb-2">
                      All set!
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8">
                      Welcome to NomadLink. Let's explore together
                    </p>
                    <Button onClick={handleNext} disabled={aiLoading} className="mx-auto rounded-xl py-3 font-semibold gap-2">
                      Start exploring <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}