import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import ReputationBadge from "../common/ReputationBadge";

export default function PremiumProfileHeader({ user }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="relative h-56 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-900 overflow-hidden" style={{ paddingTop: 'max(0px, env(safe-area-inset-top))' }}>
        {/* Animated background blobs */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
        />
        <motion.div
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 40, -20, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.3, 0.5, 0.2, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Floating profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative -mt-20 mx-4 z-10"
      >
        <div className="glass rounded-3xl p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/70 border border-white/40 dark:border-white/10 shadow-2xl shadow-black/10">
          {/* Premium gradient border accent */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none opacity-50" />

          <div className="relative z-10 space-y-4">
            {/* Avatar section */}
            <div className="flex items-start justify-between">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* Avatar glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 blur-lg opacity-40 scale-110" />

                {/* Avatar */}
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 border-4 border-white dark:border-slate-800 flex items-center justify-center text-4xl shadow-xl overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>

                {/* Online indicator */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-3 border-white dark:border-slate-800 shadow-lg"
                />
              </motion.div>

              {/* Reputation badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ReputationBadge
                  rank={user.reputation_rank || "bronze"}
                  tier={user.membership_tier || "free"}
                  score={user.reputation_score || 0}
                  compact={true}
                />
              </motion.div>
            </div>

            {/* User info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-foreground leading-tight">
                  {user.full_name || "Nomad User"}
                </h1>
                {user.is_verified && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {user.email}
              </p>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 pt-3 border-t border-white/20 dark:border-white/5"
            >
              {[
                { label: "Listings", value: user.listing_count || 0, icon: "📋" },
                { label: "Reputation", value: user.reputation_score || 0, icon: "⭐" },
                { label: "Groups", value: user.joined_groups?.length || 0, icon: "👥" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <span className="text-lg mb-1">{stat.icon}</span>
                  <p className="text-xl font-black text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Spacer for content below */}
      <div className="h-8" />
    </div>
  );
}