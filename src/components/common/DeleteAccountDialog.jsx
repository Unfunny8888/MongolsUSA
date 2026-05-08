import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DeleteAccountDialog({ isOpen, onClose }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE MY ACCOUNT") {
      setError("Please type the exact message to confirm");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call backend function to delete account
      await base44.functions.invoke("deleteAccount", {});
      // Logout after deletion
      base44.auth.logout();
    } catch (err) {
      setError(err?.message || "Failed to delete account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end bg-black/40"
        >
          <motion.div
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-12 space-y-6"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">Delete Account?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>

            {/* Warning List */}
            <div className="space-y-2 px-3 py-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900">
              {[
                "Your profile and all listings will be deleted",
                "Your messages and conversations will be removed",
                "You cannot recover your account after deletion",
              ].map((item, i) => (
                <p key={i} className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                  • {item}
                </p>
              ))}
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">
                Type "DELETE MY ACCOUNT" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError("");
                }}
                placeholder="Type confirmation text..."
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:ring-2 focus:ring-red-500/30 outline-none transition-smooth text-sm"
                disabled={loading}
              />
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 font-semibold text-sm text-foreground hover:bg-secondary/70 transition-smooth disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== "DELETE MY ACCOUNT"}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}