/**
 * Community — modern social feed for the Mongolian-US community.
 * Mixed content: discussions, help requests, ride shares, local events, job referrals, etc.
 * City-aware ranking, seeded ecosystem data, AI integration.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Users, MapPin, TrendingUp, Clock, MessageCircle, Heart, ChevronRight, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDiscovery } from "@/lib/DiscoveryContext";
import { useAuth } from "@/lib/AuthContext";
import { MOCK_DISCUSSIONS, MOCK_GROUPS, MOCK_LISTINGS, MOCK_BUSINESSES } from "@/lib/mockData";

// ─── Feed filter chips ────────────────────────────────────────────────────────
const FILTERS = [
  { id: "all",       label: "All"         },
  { id: "nearby",    label: "Nearby"      },
  { id: "trending",  label: "Trending 🔥" },
  { id: "help",      label: "Help"        },
  { id: "housing",   label: "Housing"     },
  { id: "jobs",      label: "Jobs"        },
  { id: "rideshare", label: "Ride Share"  },
  { id: "events",    label: "Events"      },
  { id: "food",      label: "Food"        },
  { id: "new",       label: "New Here"    },
];

const TAG_MAP = {
  nearby:    ["Chicago", "Seattle", "Los Angeles", "New York", "Denver", "Dallas", "Minneapolis"],
  help:      ["Help", "Ask"],
  housing:   ["Roommate", "Housing Help"],
  jobs:      ["CDL", "Job"],
  rideshare: ["Ride Share"],
  events:    ["Events"],
  food:      ["Food"],
  new:       ["New Here"],
};

// ─── Time helper ──────────────────────────────────────────────────────────────
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

// ─── Tag pill ─────────────────────────────────────────────────────────────────
const TAG_COLORS = {
  "CDL":        "bg-blue-50 text-blue-700 dark:bg-blue-950/40",
  "Ride Share": "bg-violet-50 text-violet-700 dark:bg-violet-950/40",
  "Roommate":   "bg-rose-50 text-rose-700 dark:bg-rose-950/40",
  "Food":       "bg-amber-50 text-amber-700 dark:bg-amber-950/40",
  "Events":     "bg-pink-50 text-pink-700 dark:bg-pink-950/40",
  "New Here":   "bg-teal-50 text-teal-700 dark:bg-teal-950/40",
  "Help":       "bg-orange-50 text-orange-700 dark:bg-orange-950/40",
  "Ask":        "bg-orange-50 text-orange-700 dark:bg-orange-950/40",
};

// ─── Discussion post card ─────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(post.top_reply ? [post.top_reply] : []);

  const tagColor = TAG_COLORS[post.tag] || "bg-secondary text-muted-foreground";

  function toggleLike() {
    setLiked(p => !p);
    setLikeCount(p => liked ? p - 1 : p + 1);
  }

  async function submitReply() {
    if (!replyText.trim()) return;
    const name   = currentUser?.full_name || "You";
    const avatar = currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32";
    setReplies(prev => [...prev, { name, avatar, text: replyText.trim() }]);
    setReplyText("");
    await base44.entities.Comment.create({
      post_id: post.id || "community",
      author_name: name,
      author_email: currentUser?.email || "",
      author_avatar: avatar,
      content: replyText.trim(),
    }).catch(() => {});
  }

  return (
    <div className="bg-card border border-border/20 rounded-2xl overflow-hidden">
      <div className="px-3.5 pt-3.5 pb-2.5">
        {/* Author row */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <img
            src={post.author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40"}
            alt={post.author_name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] font-semibold text-foreground leading-none">{post.author_name}</span>
              {post.tag && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none ${tagColor}`}>
                  {post.tag}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              <span>{timeAgo(post.created_date)}</span>
              {post.city && (
                <><span>·</span><MapPin className="w-2.5 h-2.5" /><span>{post.city}</span></>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-[13.5px] text-foreground leading-relaxed mb-2.5">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <button
            onClick={() => setReplyOpen(o => !o)}
            className="flex items-center gap-1 active:text-foreground transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{replies.length > 0 ? replies.length : "Reply"}</span>
          </button>
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 transition-colors ${liked ? "text-rose-500" : ""}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500" : ""}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        </div>
      </div>

      {/* Inline reply thread */}
      <AnimatePresence>
        {replyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-border/15 bg-secondary/20 px-3.5 pt-2.5 pb-2.5 space-y-2"
          >
            {replies.map((r, i) => (
              <div key={i} className="flex gap-2">
                <img
                  src={r.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32"}
                  alt={r.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div>
                  <span className="text-[11px] font-semibold text-foreground mr-1.5">{r.name}</span>
                  <span className="text-[12px] text-muted-foreground">{r.text}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32"}
                alt="You"
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-3 py-1.5 border border-border/20">
                <input
                  autoFocus
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitReply()}
                  placeholder="Write a reply…"
                  className="flex-1 bg-transparent text-[13px] outline-none min-h-[28px] text-foreground placeholder:text-muted-foreground/50"
                />
                <button onClick={submitReply} disabled={!replyText.trim()} className="shrink-0 text-primary disabled:opacity-30">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Listing snippet card (for ride shares, jobs, housing in feed) ────────────
function FeedListingCard({ listing }) {
  const navigate = useNavigate();
  const EMOJI = { jobs: "💼", housing: "🏠", cars: "🚗", events: "🎉", community: "🤝", services: "🔧" };

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex items-center gap-3 bg-card border border-border/20 rounded-2xl px-3 py-3 active:scale-[0.98] cursor-pointer transition-all"
    >
      {listing.images?.[0] ? (
        <img src={listing.images[0]} alt={listing.title} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-secondary/60 flex items-center justify-center text-2xl shrink-0">
          {EMOJI[listing.category] || "📦"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground line-clamp-1 leading-snug">{listing.title}</p>
        {listing.price != null && (
          <p className="text-[13px] font-bold text-primary mt-0.5">
            ${listing.price.toLocaleString()}
            {listing.price_type === "hourly" && <span className="text-[11px] font-normal text-muted-foreground">/hr</span>}
            {listing.price_type === "monthly" && <span className="text-[11px] font-normal text-muted-foreground">/mo</span>}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
          {listing.location_city && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{listing.location_city}</span>}
          {listing.job_type && <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full capitalize">{listing.job_type}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}

// ─── Group card ───────────────────────────────────────────────────────────────
function GroupCard({ group }) {
  return (
    <div className="shrink-0 w-44 bg-card border border-border/20 rounded-2xl overflow-hidden active:scale-[0.97] cursor-pointer transition-all">
      <div className="h-20 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl">
        {group.avatar || "👥"}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-bold text-foreground leading-snug line-clamp-1">{group.name}</p>
        <p className="text-[10px] text-primary font-semibold mt-0.5">{group.member_count?.toLocaleString()} members</p>
        {group.city && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <MapPin className="w-2.5 h-2.5" />{group.city}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Rank feed items ──────────────────────────────────────────────────────────
function rankFeed(discussions, listings, city) {
  const now = Date.now();

  const scoredDiscussions = discussions.map(d => {
    let score = 0;
    if (city && d.city === city) score += 30;
    score += Math.min((d.reply_count || 0) * 3, 20);
    score += Math.min((d.likes || 0) * 2, 15);
    const ageH = (now - new Date(d.created_date || now)) / 3600000;
    score += Math.max(0, 20 - ageH / 4);
    return { type: "post", data: d, score };
  });

  const rideshares = listings.filter(l =>
    l.tags?.includes("rideshare") || l.category === "community"
  ).slice(0, 4).map((l, i) => ({ type: "listing", data: l, score: 15 - i * 2 }));

  const featuredJobs = listings.filter(l => l.category === "jobs" && l.is_featured)
    .slice(0, 2).map((l, i) => ({ type: "listing", data: l, score: 18 - i }));

  const combined = [...scoredDiscussions, ...rideshares, ...featuredJobs]
    .sort((a, b) => b.score - a.score);

  // Interleave: don't stack more than 2 listings in a row
  const result = [];
  let listingStreak = 0;
  for (const item of combined) {
    if (item.type === "listing") {
      if (listingStreak >= 2) continue;
      listingStreak++;
    } else {
      listingStreak = 0;
    }
    result.push(item);
  }
  return result;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Community() {
  const navigate = useNavigate();
  const { city } = useDiscovery();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState("all");
  const [discussions, setDiscussions] = useState(MOCK_DISCUSSIONS);
  const [listings, setListings] = useState(
    MOCK_LISTINGS.filter(l => ["community", "jobs", "housing"].includes(l.category) || l.tags?.includes("rideshare"))
  );
  const [groups, setGroups] = useState(MOCK_GROUPS);

  useEffect(() => {
    // Merge live DB data on top of seeded
    base44.entities.Post.list("-created_date", 30)
      .then(data => {
        if (data?.length) {
          const live = data.map(p => ({
            id: p.id, author_name: p.author_name, author_avatar: p.author_avatar,
            content: p.content, city: p.city || city, tag: p.type || "Post",
            reply_count: p.comment_count || 0, likes: p.like_count || 0,
            created_date: p.created_date, top_reply: null, tone: "active",
          }));
          setDiscussions([...live, ...MOCK_DISCUSSIONS].slice(0, 30));
        }
      })
      .catch(() => {});

    base44.entities.Listing.filter({ status: "active" }, "-created_date", 30)
      .then(data => {
        if (data?.length) setListings([...data, ...MOCK_LISTINGS].filter(l =>
          ["community", "jobs", "housing"].includes(l.category) || l.tags?.includes("rideshare")
        ).slice(0, 30));
      })
      .catch(() => {});

    base44.entities.Group.list("-member_count", 20)
      .then(data => { if (data?.length) setGroups([...data, ...MOCK_GROUPS].slice(0, 20)); })
      .catch(() => {});
  }, []);

  // Filter logic
  const filteredDiscussions = useMemo(() => {
    if (activeFilter === "all") return discussions;
    if (activeFilter === "nearby") return city ? discussions.filter(d => d.city === city) : discussions;
    if (activeFilter === "trending") return [...discussions].sort((a, b) => ((b.likes || 0) + (b.reply_count || 0)) - ((a.likes || 0) + (a.reply_count || 0)));
    if (activeFilter === "new") return discussions.filter(d => d.tag === "New Here" || d.tone === "lonely");
    const tags = TAG_MAP[activeFilter] || [];
    return discussions.filter(d => tags.some(t => d.tag?.includes(t) || d.content?.toLowerCase().includes(t.toLowerCase())));
  }, [discussions, activeFilter, city]);

  const feedItems = useMemo(() =>
    rankFeed(filteredDiscussions, listings, city),
    [filteredDiscussions, listings, city]
  );

  const suggestedGroups = useMemo(() => {
    if (!city) return groups.slice(0, 8);
    const local = groups.filter(g => g.city === city);
    const other = groups.filter(g => g.city !== city);
    return [...local, ...other].slice(0, 8);
  }, [groups, city]);

  return (
    <div className="min-h-dvh pb-4">

      {/* ── FILTER CHIPS ── */}
      <div className="bg-background border-b border-border/10">
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.94] border ${
                activeFilter === f.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border/20 text-muted-foreground bg-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── AI SHORTCUT BANNER ── */}
      <div className="px-4 pt-4 pb-1">
        <button
          onClick={() => navigate("/ai-assistant")}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 rounded-2xl px-4 py-3 active:scale-[0.98] transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-bold text-foreground leading-none">Ask NomadLink AI</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Find housing, jobs, businesses, events…</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
        </button>
      </div>

      {/* ── SUGGESTED GROUPS ── */}
      <section className="pt-4 pb-2">
        <div className="flex items-center justify-between px-4 mb-2.5">
          <h2 className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" /> Community Groups
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {suggestedGroups.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      </section>

      {/* ── MAIN FEED ── */}
      <section className="px-4 pt-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            {city ? `${city} Feed` : "Community Feed"}
          </h2>
          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-1 text-[12px] font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5 active:bg-primary/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Post
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {feedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-[14px] font-semibold text-foreground">No posts yet</p>
              <p className="text-[12px] text-muted-foreground mt-1">Try a different filter or city</p>
            </div>
          )}
          {feedItems.map((item, i) => (
            <motion.div
              key={`${item.type}-${item.data.id}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.25) }}
            >
              {item.type === "post"
                ? <PostCard post={item.data} currentUser={user} />
                : <FeedListingCard listing={item.data} />
              }
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </div>
  );
}