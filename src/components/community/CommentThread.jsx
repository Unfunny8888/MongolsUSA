import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, Smile, Reply } from 'lucide-react';
import { motion } from 'framer-motion';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

const REACTIONS = ['❤️', '🔥', '😂', '😮', '👏'];

function CommentCard({ comment, user, onReply, level = 0 }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || {});

  const handleReaction = async (emoji) => {
    if (!user) return;
    try {
      await base44.entities.Reaction.create({
        target_type: 'comment',
        target_id: comment.id,
        user_email: user.email,
        emoji,
      });
      setReactions((r) => ({
        ...r,
        [emoji]: (r[emoji] || 0) + 1,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`space-y-2 ${level > 0 ? 'ml-4 pl-4 border-l border-border/30' : ''}`}
    >
      {/* Comment header */}
      <div className="flex items-center gap-2.5">
        <img
          src={comment.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop'}
          alt={comment.author_name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{comment.author_name}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo(comment.created_date)}</p>
        </div>
      </div>

      {/* Comment content */}
      <div className="ml-10">
        <p className="text-xs leading-relaxed text-foreground">{comment.content}</p>
        {comment.image_url && (
          <img
            src={comment.image_url}
            alt="Comment"
            className="mt-2 rounded-lg w-full max-h-60 object-cover"
          />
        )}

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary/40 text-[10px] hover:bg-secondary/60 transition-smooth"
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => handleReaction('❤️')}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Heart className="w-3 h-3" />
            Like
          </button>
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
          {level === 0 && comment.reply_count > 0 && (
            <button className="text-[10px] text-primary hover:underline">
              {comment.reply_count} replies
            </button>
          )}
        </div>

        {/* Reaction menu */}
        {showReactions && (
          <div className="flex gap-1 mt-2 p-1.5 bg-secondary/50 rounded-lg">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-lg hover:scale-110 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CommentThread({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Comment.filter(
        { post_id: postId, parent_comment_id: null },
        '-created_date',
        50
      );
      setComments(data);
      setLoading(false);
    }
    load();
  }, [postId]);

  useEffect(() => {
    const unsubscribe = base44.entities.Comment.subscribe((event) => {
      if (event.data?.post_id === postId && !event.data?.parent_comment_id) {
        if (event.type === 'create') {
          setComments((c) => [event.data, ...c]);
        } else if (event.type === 'update') {
          setComments((c) => c.map((com) => com.id === event.id ? event.data : com));
        } else if (event.type === 'delete') {
          setComments((c) => c.filter((com) => com.id !== event.id));
        }
      }
    });
    return unsubscribe;
  }, [postId]);

  const handleSubmit = async () => {
    if (!input.trim() || !user) return;
    try {
      await base44.entities.Comment.create({
        post_id: postId,
        parent_comment_id: replyingTo,
        author_email: user.email,
        author_name: user.full_name,
        author_avatar: user.avatar || '',
        content: input,
      });
      setInput('');
      setReplyingTo(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center py-4 text-muted-foreground text-xs">Loading comments...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-secondary/30 rounded-2xl p-4 space-y-3 mt-3"
    >
      {/* Comments list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            user={user}
            onReply={setReplyingTo}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">No comments yet. Start the discussion!</p>
        )}
      </div>

      {/* Input */}
      {user && (
        <div className="space-y-2 pt-3 border-t border-border/20">
          {replyingTo && (
            <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
              <p className="text-xs text-primary">Replying to a comment</p>
              <button onClick={() => setReplyingTo(null)} className="text-xs text-primary hover:underline">
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop'}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Add a comment..."
                className="flex-1 bg-background border border-border/40 rounded-full px-3 py-2 text-xs placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}