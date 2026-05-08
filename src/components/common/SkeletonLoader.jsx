import { motion } from 'framer-motion';

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-card rounded-2xl border border-border/50 overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="aspect-[16/10] bg-gradient-to-r from-secondary via-secondary/50 to-secondary"
      />
      <div className="p-3.5 space-y-2.5">
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-3.5 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded w-3/4"
        />
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1, ease: 'easeInOut' }}
          className="h-3 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded w-1/2"
        />
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: 'easeInOut' }}
          className="h-3 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded w-1/3"
        />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
          className={`h-3 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`w-12 h-12 rounded-xl bg-gradient-to-r from-secondary via-secondary/50 to-secondary ${className}`}
    />
  );
}

export function SkeletonList({ count = 4, variant = 'card' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          {variant === 'card' && <SkeletonCard />}
          {variant === 'text' && <SkeletonText lines={2} />}
          {variant === 'row' && (
            <div className="flex items-center gap-3 p-3 rounded-xl">
              <SkeletonAvatar />
              <div className="flex-1">
                <SkeletonText lines={1} />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}