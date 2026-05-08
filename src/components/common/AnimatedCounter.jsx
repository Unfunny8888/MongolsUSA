import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedCounter({ from = 0, to = 100, duration = 2, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const steps = 30;
    const stepValue = (to - from) / steps;
    let current = from;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = from + stepValue * step;
      setCount(Math.min(Math.round(current), to));
      if (step >= steps) clearInterval(interval);
    }, (duration * 1000) / steps);

    return () => clearInterval(interval);
  }, [from, to, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  );
}