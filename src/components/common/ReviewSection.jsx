import { useState, useEffect } from "react";
import { Star, Send } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className="transition-smooth"
        >
          <Star className={`w-5 h-5 ${n <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ businessId }) {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [rv, me] = await Promise.allSettled([
        base44.entities.Review.filter({ business_id: businessId }, "-created_date", 20),
        base44.auth.me(),
      ]);
      if (rv.status === "fulfilled") setReviews(rv.value);
      if (me.status === "fulfilled") setUser(me.value);
    }
    load();
  }, [businessId]);

  async function submit() {
    if (!rating || !user) return;
    setSubmitting(true);
    const rev = await base44.entities.Review.create({
      business_id: businessId,
      reviewer_name: user.full_name,
      reviewer_avatar: user.avatar,
      rating,
      comment,
    });
    setReviews(prev => [rev, ...prev]);
    setRating(0);
    setComment("");
    setSubmitting(false);
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Reviews</h3>
        {avg && (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{avg}</span>
            <span className="text-xs text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      {user && (
        <div className="bg-secondary/50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold mb-2">Write a review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full mt-3 bg-card rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 min-h-[70px] resize-none"
          />
          <button
            onClick={submit}
            disabled={!rating || submitting}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-4 py-2 rounded-xl disabled:opacity-40"
          >
            <Send className="w-3 h-3" /> {submitting ? "Posting..." : "Post Review"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((rev, i) => (
          <motion.div
            key={rev.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-secondary/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden text-sm">
                {rev.reviewer_avatar ? <img src={rev.reviewer_avatar} alt={rev.reviewer_name} className="w-full h-full object-cover" /> : "👤"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">{rev.reviewer_name || "Anonymous"}</p>
                <StarRating value={rev.rating} />
              </div>
            </div>
            {rev.comment && <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>}
          </motion.div>
        ))}
        {reviews.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}