import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Award } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { icon: Shield, text: 'Verified Community', color: 'text-blue-500' },
    { icon: CheckCircle2, text: 'Real Mongolians', color: 'text-emerald-500' },
    { icon: Award, text: 'Trusted Sellers', color: 'text-amber-500' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'backOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2 justify-center"
    >
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          variants={badgeVariants}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary/60 to-secondary/40 border border-border/40 hover:border-primary/20 transition-all duration-200"
        >
          <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
          <span className="text-xs font-semibold text-foreground">{badge.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}