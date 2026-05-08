import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PremiumInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  disabled = false,
  className = '',
}) {
  const [focused, setFocused] = useState(false);

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
      
      <div className="relative group">
        <motion.div
          animate={{
            boxShadow: focused
              ? '0 0 0 3px hsl(var(--primary) / 0.1)'
              : '0 0 0 0 hsl(var(--primary) / 0)',
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
        />

        <div className={`relative flex items-center bg-secondary/40 border border-border/60 rounded-xl transition-all duration-200 ${
          focused ? 'border-primary/40 bg-secondary/60' : ''
        } ${error ? 'border-destructive/40' : ''}`}>
          {Icon && (
            <motion.div
              animate={{ x: focused ? 2 : 0 }}
              className="pl-3.5 text-muted-foreground"
            >
              <Icon className="w-4 h-4" />
            </motion.div>
          )}

          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-transparent py-3.5 px-3 text-sm outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
              Icon ? '' : 'px-4'
            } ${className}`}
          />
        </div>
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