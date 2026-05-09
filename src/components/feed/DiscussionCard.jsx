/**
 * DiscussionCard — conversational post card.
 * Feels like a Telegram/Facebook community message, not a marketplace listing.
 */
import { MessageCircle, Heart, Eye, MapPin, Clock } from "lucide-react";
import { memo } from "react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function DiscussionCard({ post }) {
  const { author_name, author_avatar, content, city, reply_count = 0, views = 0, likes = 0, created_date, top_reply, tag } = post;

  return (
    <div className="bg-card border border-border/20 rounded-2xl px-3.5 py-3 active:bg-secondary/20 transition-colors duration-150 cursor-pointer">
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <img
          src={author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"}
          alt={author_name}
          className="w-8 h-8 rounded-full object-cover border border-border/30 shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-foreground">{author_name}</span>
            {city && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="w-2.5 h-2.5" />{city}
              </span>
            )}
            {tag && (
              <span className="text-[10px] font-semibold text-primary/70 bg-primary/8 rounded-full px-1.5 py-0.5">
                {tag}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <Clock className="w-2.5 h-2.5" />{timeAgo(created_date)}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-[14px] text-foreground leading-relaxed mb-2.5">{content}</p>

      {/* Top reply preview */}
      {top_reply && (
        <div className="bg-secondary/40 rounded-xl px-3 py-2 mb-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <img
              src={top_reply.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32"}
              alt={top_reply.name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="text-[11px] font-semibold text-foreground">{top_reply.name}</span>
          </div>
          <p className="text-[12px] text-muted-foreground line-clamp-2">{top_reply.text}</p>
        </div>
      )}

      {/* Engagement footer */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {reply_count > 0 ? `${reply_count} ${reply_count === 1 ? "reply" : "replies"}` : "Reply"}
        </span>
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{likes}</span>
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{views}</span>
      </div>
    </div>
  );
}

export default memo(DiscussionCard);