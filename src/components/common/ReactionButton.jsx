import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';

/**
 * ReactionButton - Emoji reaction with optimistic toggle
 * Instantly shows/hides reaction on tap, syncs with server
 */
export default function ReactionButton({ postId, emoji, initialReacted = false }) {
  const [hasReacted, setHasReacted] = useState(initialReacted);

  const { value: reacted, toggle } = useOptimisticUpdate(hasReacted, async (newState) => {
    const post = await base44.entities.Post.get(postId);
    const reactions = post.reactions || {};

    if (newState) {
      reactions[emoji] = (reactions[emoji] || 0) + 1;
    } else {
      reactions[emoji] = Math.max(0, (reactions[emoji] || 0) - 1);
      if (reactions[emoji] === 0) delete reactions[emoji];
    }

    await base44.entities.Post.update(postId, { reactions });
    setHasReacted(newState);
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      className={`px-2 py-1 rounded-full text-sm transition-smooth ${
        reacted ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
      }`}
    >
      {emoji}
    </button>
  );
}