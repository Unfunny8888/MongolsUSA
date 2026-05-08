import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, X, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function UsernameSetup({ fullName, city, onComplete }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [customUsername, setCustomUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [usernameEdited, setUsernameEdited] = useState(false);

  // Load initial suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("generateUsername", {
          action: "generate",
          full_name: fullName,
          city,
        });
        setSuggestions(res.data.suggestions || []);
        if (res.data.suggestions?.[0]) {
          setSelectedUsername(res.data.suggestions[0]);
        }
      } catch (err) {
        setError("Failed to generate usernames");
      } finally {
        setLoading(false);
      }
    };
    loadSuggestions();
  }, [fullName, city]);

  // Check custom username availability
  const checkCustomAvailability = async (username) => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateUsername", {
        action: "check",
        username,
      });
      setAvailability(res.data.available ? "available" : "taken");
    } catch (err) {
      setAvailability("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomChange = (value) => {
    const clean = value.replace(/[^a-z0-9_]/gi, "").toLowerCase();
    setCustomUsername(clean);
    if (clean.length >= 3) {
      checkCustomAvailability(clean);
    } else {
      setAvailability(null);
    }
  };

  const handleSave = async () => {
    const username = showCustom ? customUsername : selectedUsername;
    if (!username) {
      setError("Please select a username");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateUsername", {
        action: "set",
        username,
      });
      setUsernameEdited(true);
      onComplete?.(res.data.username);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set username");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateUsername", {
        action: "generate",
        full_name: fullName,
        city,
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      setError("Failed to refresh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Choose your username</h2>
        <p className="text-sm text-muted-foreground">
          You can edit it once. Pick something memorable.
        </p>
      </div>

      {/* Suggestions */}
      {!showCustom && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Suggestions
            </span>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1 hover:bg-secondary rounded-lg transition-smooth disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((username) => (
                <motion.button
                  key={username}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedUsername(username)}
                  className={`w-full p-3 rounded-xl text-sm font-semibold transition-smooth text-left ${
                    selectedUsername === username
                      ? "bg-primary text-white shadow-lg"
                      : "bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {username}
                </motion.button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCustom(true)}
            className="w-full p-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Or create your own
          </button>
        </div>
      )}

      {/* Custom Username */}
      {showCustom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
              @
            </span>
            <input
              type="text"
              value={customUsername}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="username"
              maxLength={20}
              className="w-full pl-6 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-primary/30 outline-none transition-smooth text-sm"
              autoFocus
            />
            {availability && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {availability === "available" ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : availability === "taken" ? (
                  <X className="w-5 h-5 text-red-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                )}
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            3-20 characters, letters, numbers, and underscores only
          </p>

          {availability === "taken" && (
            <p className="text-xs text-red-500">Username already taken</p>
          )}
          {availability === "available" && (
            <p className="text-xs text-emerald-500">Username available</p>
          )}

          <button
            onClick={() => setShowCustom(false)}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Back to suggestions
          </button>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
          {error}
        </motion.div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving || !selectedUsername || (showCustom && availability !== "available")}
        className="w-full rounded-xl py-3 font-semibold gap-2"
      >
        {usernameEdited && <Lock className="w-4 h-4" />}
        {saving ? "Setting username..." : "Confirm username"}
      </Button>
    </div>
  );
}