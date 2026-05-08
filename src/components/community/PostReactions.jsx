import { useState } from "react";
import { Repeat2, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMOJIS = ["❤️", "🔥", "😂", "👏", "😮", "😢"];

export default function PostReactions({ post, userEmail, onUpdate }) {
  const [showPicker, setShowPicker] = useState(false);

  const reactions = post.reactions || {};
  const hasReactions = Object.values(reactions).some(v => v > 0);
  const reposted = (post.reposted_by || []).includes(userEmail);

  async function addReaction(emoji) {
    const key = emoji;
    const updated = { ...reactions, [key]: (reactions[key] || 0) + 1 };
    await base44.entities.Post.update(post.id, { reactions: updated });
    onUpdate?.({ ...post, reactions: updated });
    setShowPicker(false);
  }

  async function toggleRepost() {
    const list = post.reposted_by || [];
    const updated = reposted ? list.filter(e => e !== userEmail) : [...list, userEmail];
    const count = (post.repost_count || 0) + (reposted ? -1 : 1);
    await base44.entities.Post.update(post.id, { reposted_by: updated, repost_count: count });
    onUpdate?.({ ...post, reposted_by: updated, repost_count: count });
  }

  return (
    <div className="mt-2">
      {/* Existing reactions */}
      {hasReactions && (
        <div className="flex flex-wrap gap-1 mb-2">
          {Object.entries(reactions).filter(([, v]) => v > 0).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="flex items-center gap-0.5 bg-secondary/80 hover:bg-secondary px-2 py-0.5 rounded-full text-xs font-semibold transition-colors"
            >
              {emoji} <span className="text-[10px] text-muted-foreground">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            😊 React
          </button>
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-1 bg-card border border-border/50 rounded-2xl shadow-xl p-2 flex gap-1 z-20">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => addReaction(e)}
                  className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center text-base transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleRepost}
          className={`text-[11px] flex items-center gap-1 transition-colors ${
            reposted ? "text-emerald-500 font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Repeat2 className="w-3.5 h-3.5" />
          {post.repost_count > 0 ? post.repost_count : ""} Repost
        </button>

        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {post.comment_count || 0}
        </span>
      </div>
    </div>
  );
}