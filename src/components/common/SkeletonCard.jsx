import { motion } from "framer-motion";

export default function SkeletonCard({ variant = "listing", width = "w-full" }) {
  if (variant === "listing") {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`${width} rounded-2xl overflow-hidden border border-border/30 bg-card`}
      >
        <div className="aspect-[16/10] bg-secondary/50" />
        <div className="p-3.5 space-y-2">
          <div className="h-3.5 bg-secondary/50 rounded w-3/4" />
          <div className="h-3 bg-secondary/50 rounded w-1/2" />
          <div className="h-3 bg-secondary/50 rounded w-1/3" />
        </div>
      </motion.div>
    );
  }

  if (variant === "group") {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="rounded-2xl overflow-hidden border border-border/30 bg-card"
      >
        <div className="h-28 bg-secondary/50" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-secondary/50 rounded w-2/3" />
          <div className="h-3 bg-secondary/50 rounded w-1/3" />
        </div>
      </motion.div>
    );
  }

  if (variant === "business") {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="min-w-[240px] rounded-2xl overflow-hidden border border-border/30 bg-card"
      >
        <div className="h-32 bg-secondary/50" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-secondary/50 rounded w-2/3" />
          <div className="h-3 bg-secondary/50 rounded w-1/2" />
        </div>
      </motion.div>
    );
  }

  return null;
}