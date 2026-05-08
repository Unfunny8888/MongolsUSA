import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function PremiumSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {label && (
        <label className="text-sm font-semibold text-foreground mb-2 block">
          {label}
        </label>
      )}

      <div className="relative">
        <motion.button
          onClick={() => !disabled && setOpen(!open)}
          className={`w-full flex items-center justify-between px-4 py-3.5 bg-secondary/40 border border-border/60 rounded-xl text-sm font-medium transition-all duration-200 ${
            open ? 'border-primary/40 bg-secondary/60' : ''
          } ${error ? 'border-destructive/40' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedLabel}
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto">
                {options.map((option, i) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="w-full px-4 py-3 text-sm text-left font-medium text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-between group"
                  >
                    {option.label}
                    {value === option.value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive mt-1.5"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}