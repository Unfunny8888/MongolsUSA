import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import CommentThread from './CommentThread';

export default function DiscussionFeed({ groupId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);

      const data = await base44.entities.Post.filter(
        { group_id: groupId, is_pinned: false },
        '-created_date',
        50
      );
      setPosts(data);
      setLoading(false);
    }
    load();
  }, [groupId]);

  useEffect(() => {
    const unsubscribe = base44.entities.Post.subscribe((event) => {
      if (event.data?.group_id === groupId) {
        if (event.type === 'create') {
          setPosts((p) => [event.data, ...p]);
        } else if (event.type === 'update') {
          setPosts((p) => p.map((post) => post.id === event.id ? event.data : post));
        } else if (event.type === 'delete') {
          setPosts((p) => p.filter((post) => post.id !== event.id));
        }
      }
    });
    return unsubscribe;
  }, [groupId]);

  if (loading) return <div className="p-4 text-center text-muted-foreground">Loading discussion...</div>;

  return (
    <div className="space-y-4 pb-4">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
        >
          <PostCard
            post={post}
            user={user}
            isExpanded={expandedPost === post.id}
            onExpandComments={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
          />
          {expandedPost === post.id && <CommentThread postId={post.id} user={user} />}
        </motion.div>
      ))}
      {posts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No posts yet. Be the first to start a discussion!</p>
        </div>
      )}
    </div>
  );
}