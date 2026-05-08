import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getTrendingPosts } from '@/lib/engagementAlgorithm';

/**
 * Trending posts feed
 * Top engaged posts from last 24 hours
 */
export default function TrendingPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      try {
        // Get posts from all groups
        const allPosts = await base44.entities.Post.list('-created_date', 100);
        const trending = getTrendingPosts(allPosts, 24);
        setPosts(trending.slice(0, 5));
      } catch (err) {
        console.error('Error loading trending:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTrending();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="px-4 py-3 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        <div>
          <h3 className="text-sm font-bold text-foreground">Trending Now</h3>
          <p className="text-xs text-muted-foreground">Hot discussions</p>
        </div>
      </div>

      <div className="px-4 space-y-2">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200/30 dark:border-orange-900/30"
          >
            <div className="flex items-start gap-3 mb-2">
              <img
                src={post.author_avatar || `https://i.pravatar.cc/40?u=${post.author_email}`}
                alt={post.author_name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{post.author_name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{post.like_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.comment_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3" />
                <span>{post.repost_count || 0}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}