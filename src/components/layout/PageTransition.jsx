import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { resolveRoute } from '@/lib/TabNavigationContext';

/**
 * PageTransition
 * - Tab switches: fade only (no directional slide — matches Facebook/Instagram)
 * - Child pushes: slide in from right
 * - Back navigation: slide in from left
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const { state } = useTabNavigation();

  const resolved = resolveRoute(location.pathname);
  const isRoot = resolved.isRoot;
  const stack = state.stacks[state.activeTab] ?? [];
  const isDeep = stack.length > 1;

  // Tab switch or root → simple fade
  // Child page → slide from right
  const variants = isRoot
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.18 } },
        exit:    { opacity: 0, transition: { duration: 0.12 } },
      }
    : {
        initial: { opacity: 0, x: 32 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
        exit:    { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}