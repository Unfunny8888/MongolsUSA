import { Heart } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * LikeButton - Tap-to-like with haptic feedback
 * Optimistic update for instant feedback, syncs with server
 */
export default function LikeButton({ postId, initialLikes = 0, userEmail }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating) return;

    // Optimistic update
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likes + 1 : Math.max(0, likes - 1);

    setIsLiked(newLikedState);
    setLikes(newLikeCount);
    setIsAnimating(true);
    triggerHaptic();

    try {
      const post = await base44.entities.Post.get(postId);
      await base44.entities.Post.update(postId, {
        like_count: newLikeCount,
      });
    } catch (err) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikes(!newLikedState ? likes + 1 : Math.max(0, likes - 1));
    } finally {
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-2 px-3 py-2 rounded-full transition-all active:scale-95"
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
    >
      <div className="relative">
        <Heart
          className={`w-5 h-5 transition-all duration-300 ${
            isLiked
              ? 'fill-red-500 text-red-500 scale-125'
              : 'text-muted-foreground hover:text-red-500'
          }`}
        />
        {isAnimating && isLiked && (
          <div className="absolute inset-0 animate-pulse">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </div>
        )}
      </div>
      {likes > 0 && (
        <span className="text-xs font-semibold text-foreground">{likes}</span>
      )}
    </button>
  );
}