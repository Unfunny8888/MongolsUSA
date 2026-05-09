/**
 * QuickPostBar — feels like typing into a group chat.
 * Low-pressure, conversational, mobile-first.
 */
import { useState } from "react";
import { X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PROMPTS = [
  "Anyone know good movers in Chicago?",
  "Need a roommate near Arlington?",
  "Best Mongolian grocery nearby?",
  "Anyone driving to Denver this weekend?",
  "Looking for a good accountant?",
  "Know anyone hiring CDL drivers?",
];

const TAGS = ["Question", "Ride Share", "Roommate", "Food", "Job", "Help", "Event"];

export default function QuickPostBar({ user }) {
  const [open, setOpen]     = useState(false);
  const [text, setText]     = useState("");
  const [tag, setTag]       = useState(null);
  const [posting, setPosting] = useState(false);
  const [done, setDone]     = useState(false);

  const placeholder = PROMPTS[new Date().getHours() % PROMPTS.length];

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    await base44.entities.Post.create({
      group_id: "community",
      author_name: user?.full_name || "Community Member",
      author_email: user?.email || "",
      author_avatar: user?.avatar || "",
      content: text.trim(),
      type: "text",
      like_count: 0,
      comment_count: 0,
    });
    setPosting(false);
    setDone(true);
    setTimeout(() => { setDone(false); setOpen(false); setText(""); setTag(null); }, 2000);
  }

  if (done) {
    return (
      <div className="bg-primary/6 rounded-2xl px-4 py-3 text-center border border-primary/10">
        <p className="text-[13px] font-medium text-primary">Your post is live ✓</p>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-2xl transition-all duration-200 ${open ? "border-border/40" : "border-border/20"}`}>
      {/* Collapsed — looks like a chat input */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-secondary/20 transition-colors duration-150 rounded-2xl"
        >
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"}
            alt=""
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <span className="text-[13px] text-muted-foreground flex-1 truncate">{placeholder}</span>
        </button>
      ) : (
        /* Expanded — minimal composer */
        <div className="px-4 py-3 space-y-3">
          {/* Top row */}
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"}
              alt=""
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
            <span className="text-[12px] font-semibold text-foreground flex-1">{user?.full_name || "You"}</span>
            <button onClick={() => { setOpen(false); setText(""); setTag(null); }}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Text input */}
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
          />

          {/* Tag chips — optional, low pressure */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {TAGS.map(t => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? null : t)}
                className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors duration-150 ${
                  tag === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Send */}
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={!text.trim() || posting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold disabled:opacity-40 active:opacity-80 transition-opacity duration-150"
            >
              <Send className="w-3.5 h-3.5" />
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}