import { motion } from "framer-motion";

/**
 * EmptyState — premium, on-brand empty screen component.
 *
 * Props:
 *  icon        — Lucide icon component (required)
 *  title       — primary headline
 *  description — supporting copy
 *  action      — { label, onClick } for the CTA button
 *  secondaryAction — { label, onClick } for a subtle secondary link
 *  className   — extra classes on the wrapper
 */
export default function EmptyState({ icon: Icon, title, description, action, secondaryAction, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={`flex flex-col items-center justify-center text-center px-8 py-16 ${className}`}
    >
      {/* Icon container — soft primary glow ring */}
      <div className="relative mb-6">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/8 scale-[1.6] blur-xl" />
        {/* Middle ring */}
        <div className="absolute inset-0 rounded-full bg-primary/6 scale-[1.25]" />
        {/* Icon circle */}
        <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center">
          <Icon className="w-9 h-9 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-[17px] font-bold text-foreground tracking-tight mb-2 leading-snug">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
          {description}
        </p>
      )}

      {/* CTA */}
      {action && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={action.onClick}
          className="mt-7 px-7 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold shadow-sm active:shadow-none transition-all duration-150"
        >
          {action.label}
        </motion.button>
      )}

      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="mt-3 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors duration-150"
        >
          {secondaryAction.label}
        </button>
      )}
    </motion.div>
  );
}