import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { suggestUsers } from '@/lib/engagementAlgorithm';
import ReputationBadge from '../common/ReputationBadge';

/**
 * Suggested users discovery component
 * Shows active, high-reputation users to follow
 */
export default function SuggestedUsers() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [following, setFollowing] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const me = await base44.auth.me();
        setCurrentUser(me);

        // Get all reputations
        const reps = await base44.entities.UserReputation.list('-reputation_score', 100);
        
        // Get user follows
        const follows = await base44.entities.Follow.filter({ follower_email: me.email });
        setFollowing(new Set(follows.map(f => f.following_email)));

        // Get suggested users
        const suggested = suggestUsers(reps, me.email, 6);
        setUsers(suggested);
      } catch (err) {
        console.error('Error loading suggestions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSuggestions();
  }, []);

  async function handleFollow(user) {
    try {
      await base44.entities.Follow.create({
        follower_email: currentUser.email,
        follower_name: currentUser.full_name,
        following_email: user.user_email,
        following_name: user.user_name,
      });
      setFollowing(prev => new Set([...prev, user.user_email]));
    } catch (err) {
      console.error('Follow error:', err);
    }
  }

  async function handleUnfollow(userEmail) {
    try {
      const follows = await base44.entities.Follow.filter({
        follower_email: currentUser.email,
        following_email: userEmail
      });
      if (follows.length > 0) {
        await base44.entities.Follow.delete(follows[0].id);
        setFollowing(prev => {
          const newSet = new Set(prev);
          newSet.delete(userEmail);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">Suggested Users</h3>
        <p className="text-xs text-muted-foreground">People you might follow</p>
      </div>

      <div className="px-4 space-y-2">
        {users.map((user, i) => {
          const isFollowing = following.has(user.user_email);

          return (
            <motion.div
              key={user.user_email}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 hover:border-border/60 transition-all"
            >
              <img
                src={user.user_avatar || `https://i.pravatar.cc/150?u=${user.user_email}`}
                alt={user.user_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{user.user_name}</p>
                  <ReputationBadge reputation={user} size="xs" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.total_transactions || 0} transactions
                </p>
              </div>

              {isFollowing ? (
                <button
                  onClick={() => handleUnfollow(user.user_email)}
                  className="p-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-all active:scale-95"
                  title="Unfollow"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              ) : (
                <button
                  onClick={() => handleFollow(user)}
                  className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-all active:scale-95"
                  title="Follow"
                >
                  <UserPlus className="w-4 h-4 text-primary" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}