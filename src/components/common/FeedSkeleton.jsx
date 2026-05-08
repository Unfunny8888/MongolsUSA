import { motion } from "framer-motion";

export default function FeedSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-xl border border-border/30 overflow-hidden shadow-sm"
        >
          {/* Image skeleton */}
          <div className="relative w-full bg-secondary/50 animate-pulse" style={{ aspectRatio: '16/10' }} />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 bg-secondary/50 rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-secondary/50 rounded-lg w-1/2 animate-pulse" />
            </div>
            
            {/* Meta */}
            <div className="space-y-1.5">
              <div className="h-3 bg-secondary/30 rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-secondary/30 rounded w-1/2 animate-pulse" />
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 bg-secondary/30 rounded-full w-20 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-4 bg-secondary/30 rounded w-12 animate-pulse" />
                <div className="h-4 bg-secondary/30 rounded w-12 animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}