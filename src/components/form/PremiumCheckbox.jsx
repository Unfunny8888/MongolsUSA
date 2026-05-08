import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function PremiumCheckbox({
  checked = false,
  onChange,
  label,
  disabled = false,
}) {
  return (
    <motion.label
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 cursor-pointer group"
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
          checked
            ? 'bg-primary border-primary'
            : 'border-border/60 bg-secondary/30 group-hover:border-primary/40'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {checked && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </motion.div>
      {label && (
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {label}
        </span>
      )}
    </motion.label>
  );
}