import { motion } from 'framer-motion';
import { Users, Briefcase, Shield, TrendingUp, Heart, Star } from 'lucide-react';

export default function SocialProof({ compact = false }) {
  const metrics = [
    { icon: Users, label: '2,000+ Mongolians', value: 'Connected', color: 'text-blue-500' },
    { icon: Briefcase, label: 'Jobs posted', value: 'Daily', color: 'text-emerald-500' },
    { icon: Heart, label: 'Trusted', value: 'Community', color: 'text-pink-500' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  if (compact) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center gap-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/10"
      >
        {metrics.map((m, i) => (
          <motion.div key={i} variants={itemVariants} className="flex items-center gap-1.5">
            <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
            <span className="text-[11px] font-semibold text-foreground">{m.label}</span>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 py-6 space-y-3"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Why NomadLink
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ translateY: -2 }}
            className="flex flex-col items-center p-3.5 rounded-2xl bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/30 hover:border-border/50 transition-all duration-200"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${metric.color} bg-current/10`}>
              <metric.icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold text-foreground text-center leading-tight">
              {metric.label}
            </p>
            <p className="text-[9px] text-muted-foreground mt-1">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Trust Statement */}
      <motion.div variants={itemVariants} className="pt-2">
        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          Join the largest Mongolian marketplace in North America. Verified listings, real connections, zero fees.
        </p>
      </motion.div>
    </motion.div>
  );
}