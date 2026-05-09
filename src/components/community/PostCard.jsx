import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Smile, BarChart2, CalendarDays, Car, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

const REACTIONS = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

export default function PostCard({ post, user, isExpanded, onExpandComments }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});
  const [liked, setLiked] = useState(false);

  const handleReaction = async (emoji) => {
    if (!user) return;
    try {
      await base44.entities.Reaction.create({
        target_type: 'post',
        target_id: post.id,
        user_email: user.email,
        user_name: user.full_name,
        emoji,
      });
      setReactions((r) => ({
        ...r,
        [emoji]: (r[emoji] || 0) + 1,
      }));
      setShowReactions(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      layout
      className="bg-card rounded-2xl border border-border/40 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <img
            src={post.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop'}
            alt={post.author_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{post.author_name}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(post.created_date)}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-secondary/50 rounded-lg transition-smooth">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div>
        <p className="text-sm leading-relaxed text-foreground">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="mt-3 rounded-lg w-full max-h-96 object-cover"
          />
        )}
      </div>

      {/* Post type indicators */}
      {post.type === 'poll' && post.poll_question && (
        <div className="bg-secondary/50 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart2 className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            <p className="text-xs font-semibold text-foreground">{post.poll_question}</p>
          </div>
          <div className="space-y-1.5">
            {post.poll_options?.map((opt) => (
              <div key={opt} className="flex items-center gap-2 p-2 bg-background/50 rounded hover:bg-background transition-smooth cursor-pointer">
                <input type="radio" id={opt} name="poll" className="w-4 h-4" />
                <label htmlFor={opt} className="text-xs text-foreground cursor-pointer">{opt}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {post.type === 'event' && post.event_date && (
        <div className="bg-secondary/50 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            <p className="text-xs font-semibold text-foreground">Event</p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(post.event_date).toLocaleDateString()} · {post.event_location}</p>
        </div>
      )}

      {post.type === 'ride_share' && (
        <div className="bg-secondary/50 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Car className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            <p className="text-xs font-semibold text-foreground">Ride Share</p>
          </div>
          <p className="text-xs text-muted-foreground">{post.ride_share_from} → {post.ride_share_to}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{post.ride_share_seats} seats · {new Date(post.ride_share_date).toLocaleDateString()}</p>
        </div>
      )}

      {post.type === 'travel' && (
        <div className="bg-secondary/50 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Plane className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            <p className="text-xs font-semibold text-foreground">Travel Buddy</p>
          </div>
          <p className="text-xs text-muted-foreground">{post.travel_destination}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{post.travel_dates}</p>
        </div>
      )}

      {/* Reactions */}
      {Object.keys(reactions).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60 hover:bg-secondary/80 text-xs transition-smooth"
              onClick={() => handleReaction(emoji)}
            >
              <span>{emoji}</span>
              <span className="text-muted-foreground text-[10px]">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-2.5 border-t border-border/20">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/40 active:bg-secondary/80 transition-colors duration-150 text-xs font-semibold text-muted-foreground active:scale-95">
          <Heart className="w-3.5 h-3.5" strokeWidth={2} />
          Like
        </button>
        <button
          onClick={onExpandComments}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors duration-150 text-xs font-semibold text-muted-foreground active:scale-95 ${
            isExpanded ? 'bg-secondary/80' : 'bg-secondary/40 active:bg-secondary/80'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
          {post.comment_count || 0}
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/40 active:bg-secondary/80 transition-colors duration-150 text-xs font-semibold text-muted-foreground active:scale-95">
          <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
          Share
        </button>
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/40 active:bg-secondary/80 transition-colors duration-150 text-xs font-semibold text-muted-foreground active:scale-95"
        >
          <Smile className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Reactions menu */}
      {showReactions && (
        <div className="flex gap-1.5 p-2 bg-secondary/50 rounded-lg">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="flex-1 py-1.5 text-lg hover:bg-background/50 rounded transition-smooth"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}