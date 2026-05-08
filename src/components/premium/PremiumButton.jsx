import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Premium button with premium animations and depth
 */
export default function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  ...props
}) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:shadow-lg active:shadow-sm',
    secondary: 'bg-secondary/60 text-foreground hover:bg-secondary/80 hover:shadow-md',
    outline: 'border border-border bg-transparent text-foreground hover:shadow-md',
    premium: 'bg-gradient-to-br from-primary to-emerald-600 text-white hover:shadow-premium active:shadow-lg'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        'relative rounded-lg font-medium transition-all duration-250',
        'active:shadow-inner active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </motion.button>
  );
}