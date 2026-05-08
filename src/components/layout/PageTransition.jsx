import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - Smooth route animations with native app feeling
 * 
 * Features:
 * - Slide-in from right (forward navigation)
 * - Slide-out to right (back navigation)
 * - No flickering or layout flashes
 * - Syncs with header transitions
 * - GPU-accelerated
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  // Determine if navigating forward or backward
  const isForward = location.pathname !== '/' && !location.pathname.includes('search');

  const pageVariants = {
    initial: {
      opacity: 0,
      x: isForward ? 50 : -50,
      y: 0,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.35,
        ease: 'easeOut',
        opacity: { duration: 0.25 },
      },
    },
    exit: {
      opacity: 0,
      x: isForward ? -30 : 50,
      y: 0,
      transition: {
        duration: 0.25,
        ease: 'easeIn',
      },
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-dvh"
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}