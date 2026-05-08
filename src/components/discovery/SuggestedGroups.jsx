import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { suggestGroups } from '@/lib/engagementAlgorithm';
import { useNavigate } from 'react-router-dom';

/**
 * Suggested groups discovery component
 * Shows popular groups to join
 */
export default function SuggestedGroups() {
  const [groups, setGroups] = useState([]);
  const [joined, setJoined] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const me = await base44.auth.me();
        const allGroups = await base44.entities.Group.list('-member_count', 50);
        
        // TODO: Get user's joined groups
        const userGroups = [];
        
        const suggested = suggestGroups(allGroups, userGroups, 5);
        setGroups(suggested);
        setJoined(new Set(userGroups.map(g => g.id)));
      } catch (err) {
        console.error('Error loading group suggestions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="px-4 py-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-600" />
        <div>
          <h3 className="text-sm font-bold text-foreground">Suggested Communities</h3>
          <p className="text-xs text-muted-foreground">Groups you might like</p>
        </div>
      </div>

      <div className="px-4 space-y-2">
        {groups.map((group, i) => {
          const isJoined = joined.has(group.id);

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/group/${group.id}`)}
              className="p-3 rounded-xl bg-card border border-border/40 hover:border-border/60 transition-all cursor-pointer hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <img
                  src={group.avatar || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=60&h=60&fit=crop'}
                  alt={group.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.member_count || 0} members</p>
                </div>

                {!isJoined && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Join group logic
                    }}
                    className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-all active:scale-95"
                    title="Join group"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}