import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, Flag } from "lucide-react";
import { motion } from "framer-motion";

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`w-3 h-3 ${n <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function ReviewManager({ reviews, onReply }) {
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";
  const dist = [5, 4, 3, 2, 1].map(n => ({ rating: n, count: reviews.filter(r => r.rating === n).length }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">Reviews ({reviews.length})</span>
      </div>

      {/* Summary */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-extrabold">{avg}</p>
          <Stars rating={Math.round(Number(avg))} />
          <p className="text-[10px] text-muted-foreground mt-1">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {dist.map(({ rating, count }) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-[10px] w-3 text-right font-semibold">{rating}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
              </div>
              <span className="text-[10px] w-5 text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-2">
        {reviews.map((r, i) => (
          <motion.div
            key={r.id || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl border border-border/50 p-3"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm shrink-0">
                {r.reviewer_avatar || "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{r.reviewer_name || "Anonymous"}</p>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.comment}</p>
                {r.reply && (
                  <div className="mt-2 p-2 bg-primary/5 rounded-lg border-l-2 border-primary">
                    <p className="text-[10px] font-semibold text-primary mb-0.5">Your Reply</p>
                    <p className="text-xs text-muted-foreground">{r.reply}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <button className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                    <ThumbsUp className="w-3 h-3" /> {r.helpful_count || 0}
                  </button>
                  {!r.reply && (
                    <button
                      onClick={() => setReplyTo(replyTo === r.id ? null : r.id)}
                      className="text-[10px] text-primary font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> Reply
                    </button>
                  )}
                  <button className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 ml-auto transition-colors">
                    <Flag className="w-3 h-3" /> Report
                  </button>
                </div>
                {replyTo === r.id && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex gap-2">
                    <input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 text-xs bg-secondary/70 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => { onReply(r.id, replyText); setReplyTo(null); setReplyText(""); }}
                      disabled={!replyText.trim()}
                      className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg disabled:opacity-40"
                    >
                      Send
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}