import { motion } from "framer-motion";
import { Settings, Shield } from "lucide-react";

export default function PremiumProfileHeader({ user }) {
  return (
    <div className="relative">
      {/* Green header background */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-500 to-emerald-600 overflow-hidden" style={{ paddingTop: 'max(0px, env(safe-area-inset-top))' }}>
        {/* Settings icon in top-right */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-smooth active:scale-95"
        >
          <Settings className="w-5 h-5 text-emerald-600" />
        </motion.button>
      </div>

      {/* Profile card with overlapping avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative px-4 -mt-16 z-10 mb-4"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg">
          {/* Avatar - overlapping the header */}
          <div className="flex items-end gap-4 mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative -mt-28"
            >
              {/* Avatar with online indicator */}
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 border-4 border-white dark:border-slate-800 flex items-center justify-center text-6xl shadow-xl overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>
              
              {/* Share icon in bottom-right of avatar */}
              <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center text-white dark:text-slate-800 shadow-lg">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </div>
            </motion.div>

            {/* Name and badges */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="pb-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-foreground">
                  {user.full_name || "Nomad User"}
                </h1>
                {user.is_verified && (
                  <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />
                )}
              </div>
              {user.membership_tier === "premium" || user.membership_tier === "gold" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold"
                >
                  💰 GOLD
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Handle and description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <p className="text-sm font-medium text-muted-foreground">@{user.email?.split("@")[0]}</p>
            <p className="text-sm text-foreground mt-1">
              {user.bio || "Community member"}
            </p>
            {user.city && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                📍 {user.city}
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}