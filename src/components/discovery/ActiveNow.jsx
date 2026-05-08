import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Active now users indicator
 * Shows users currently online
 */
export default function ActiveNow() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActive() {
      try {
        const { base44 } = await import('@/api/base44Client');
        const presences = await base44.entities.UserPresence.filter({ is_online: true }, '-updated_date', 12);
        setActiveUsers(presences);
      } catch (err) {
        console.error('Error loading active users:', err);
      } finally {
        setLoading(false);
      }
    }

    loadActive();
    const interval = setInterval(loadActive, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || activeUsers.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <p className="text-xs font-bold text-foreground mb-2">Active Now ({activeUsers.length})</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {activeUsers.map((user, i) => (
          <motion.div
            key={user.user_email}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex-shrink-0"
            title={user.user_name}
          >
            <img
              src={`https://i.pravatar.cc/40?u=${user.user_email}`}
              alt={user.user_name}
              className="w-10 h-10 rounded-full border-2 border-primary/30 object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}