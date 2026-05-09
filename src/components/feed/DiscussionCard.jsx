/**
 * DiscussionCard — inline interactive community post.
 * Tap reply → thread expands inline. Like → optimistic toggle.
 */
import { useState, useRef, useEffect, memo } from "react";
import { MessageCircle, Heart, MapPin, Clock, Send, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

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

const TONE_ACCENT = {
  urgent:    "border-l-2 border-l-orange-400",
  lonely:    "border-l-2 border-l-blue-300",
  active:    "border-l-2 border-l-primary",
  helpful:   "border-l-2 border-l-green-400",
  quiet:     "",
  practical: "",
};

function DiscussionCard({ post, currentUser }) {
  const postId        = post?.id;
  const author_name   = post?.author_name;
  const author_avatar = post?.author_avatar;
  const content       = post?.content;
  const city          = post?.city;
  const reply_count   = post?.reply_count ?? 0;
  const likes         = post?.likes ?? 0;
  const created_date  = post?.created_date;
  const top_reply     = post?.top_reply;
  const tag           = post?.tag;
  const tone          = post?.tone;

  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(likes);
  const [threadOpen, setThreadOpen] = useState(false);
  const [replies, setReplies]       = useState(top_reply && reply_count > 0 ? [top_reply] : []);
  const [replyText, setReplyText]   = useState("");
  const [posting, setPosting]       = useState(false);
  const inputRef = useRef(null);

  const isQuiet   = reply_count === 0 && replies.length === 0;
  const accentCls = TONE_ACCENT[tone] || "";

  useEffect(() => {
    if (threadOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [threadOpen]);

  function toggleLike() {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  }

  async function submitReply() {
    if (!replyText.trim()) return;
    const name   = currentUser?.full_name || "You";
    const avatar = currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face";
    const optimistic = { name, avatar, text: replyText.trim(), _local: true };

    setReplies(prev => [...prev, optimistic]);
    setReplyText("");
    setPosting(true);

    await base44.entities.Comment.create({
      post_id:      postId || "community",
      author_name:  name,
      author_email: currentUser?.email || "",
      author_avatar: avatar,
      content:      replyText.trim(),
    });

    setPosting(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); }
  }

  return (
    <div className={`bg-card border border-border/20 rounded-2xl overflow-hidden ${accentCls}`}>
      <div className="px-3 pt-3 pb-2">
        {/* Author */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"}
            alt={author_name}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] font-semibold text-foreground">{author_name}</span>
              {tag && (
                <span className="text-[10px] text-muted-foreground/80 bg-secondary rounded-full px-1.5 py-0.5 font-medium leading-none">
                  {tag}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              <span>{timeAgo(created_date)}</span>
              {city && <><span>·</span><MapPin className="w-2.5 h-2.5" /><span>{city}</span></>}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-[13px] text-foreground leading-relaxed mb-2.5">{content}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <button
            onClick={() => setThreadOpen(o => !o)}
            className="flex items-center gap-1 active:text-foreground transition-colors duration-100"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {isQuiet ? (
              <span className="text-primary/60 font-medium">Reply</span>
            ) : (
              <span>{replies.length + (reply_count > 1 ? reply_count - (top_reply ? 1 : 0) : 0)} replies</span>
            )}
            {!isQuiet && (
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${threadOpen ? "rotate-180" : ""}`} />
            )}
          </button>

          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 transition-colors duration-100 ${liked ? "text-rose-500" : ""}`}
          >
            <Heart className={`w-3.5 h-3.5 transition-all duration-150 ${liked ? "fill-rose-500 scale-110" : ""}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        </div>
      </div>

      {/* Inline thread */}
      <AnimatePresence>
        {threadOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/15 bg-secondary/20 px-3 pt-2.5 pb-2.5 space-y-2.5">
              {replies.map((r, i) => (
                <motion.div
                  key={i}
                  initial={r._local ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex gap-2"
                >
                  <img
                    src={r.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop"}
                    alt={r.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-foreground mr-1.5">{r.name}</span>
                    <span className="text-[12px] text-muted-foreground leading-snug">{r.text}</span>
                  </div>
                </motion.div>
              ))}

              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"}
                  alt="You"
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-3 py-1.5 border border-border/20">
                  <input
                    ref={inputRef}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a reply…"
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none min-h-[28px]"
                  />
                  <button
                    onClick={submitReply}
                    disabled={!replyText.trim() || posting}
                    className="shrink-0 text-primary disabled:opacity-30 transition-opacity"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(DiscussionCard);