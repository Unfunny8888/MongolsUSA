/**
 * Home — unified social + discovery feed.
 * Featured businesses → What's happening tabs → mixed community posts.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { Bookmark, Store } from "lucide-react";
import { MOCK_BUSINESSES, MOCK_DISCUSSIONS, MOCK_LISTINGS } from "../lib/mockData";

// Rank listings by recency + engagement + city match
function rankListings(listings, userCity) {
  const now = Date.now();
  return [...listings].sort((a, b) => {
    let scoreA = 0, scoreB = 0;
    // City match — strong boost
    if (userCity) {
      if (a.location_city === userCity) scoreA += 40;
      if (b.location_city === userCity) scoreB += 40;
    }
    // Featured/boosted
    if (a.is_featured) scoreA += 20;
    if (b.is_featured) scoreB += 20;
    // Engagement (views + saves weighted)
    scoreA += Math.min((a.views || 0) / 30, 15) + Math.min((a.saves || 0) * 2, 10);
    scoreB += Math.min((b.views || 0) / 30, 15) + Math.min((b.saves || 0) * 2, 10);
    // Recency — decay over 7 days
    const ageA = (now - new Date(a.created_date || now)) / 3600000;
    const ageB = (now - new Date(b.created_date || now)) / 3600000;
    scoreA += Math.max(0, 15 - ageA / 12);
    scoreB += Math.max(0, 15 - ageB / 12);
    return scoreB - scoreA;
  });
}
import { useDiscovery } from "@/lib/DiscoveryContext";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import DiscussionCard from "../components/feed/DiscussionCard";
import GlobalDiscoveryBar from "../components/discovery/GlobalDiscoveryBar";
import FeedItem from "../components/feed/FeedItem";

// Featured business card (horizontal scroll)
function FeaturedBusinessCard({ business }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  return (
    <div
      onClick={() => navigate(`/business/${business.id}`)}
      className="shrink-0 w-48 bg-card rounded-2xl border border-border/20 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
      
      {/* Banner */}
      <div className="relative h-28 bg-secondary/40">
        {business.banner &&
        <img src={business.banner} alt={business.name} className="w-full h-full object-cover" loading="lazy" />
        }
        <button
          onClick={(e) => {e.stopPropagation();setSaved((s) => !s);}}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-card/90 rounded-full flex items-center justify-center shadow-sm">
          
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
      {/* Logo + info */}
      <div className="px-2.5 pb-2.5 -mt-4 relative">
        {business.logo ?
        <img src={business.logo} alt={business.name}
        className="w-10 h-10 rounded-xl object-cover border-2 border-card shadow-sm mb-1.5" /> :

        <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-card flex items-center justify-center mb-1.5">
            <Store className="w-4 h-4 text-primary" />
          </div>
        }
        <p className="text-[13px] font-bold text-foreground leading-tight">{business.name}</p>
        {business.rating &&
        <p className="text-[10px] text-amber-600 font-semibold mt-0.5">★ {business.rating} · {business.city}</p>
        }
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{business.description}</p>
        {business.is_verified &&
        <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[9px] text-primary font-bold flex items-center gap-0.5">
              ✓ Verified Business
            </span>
          </div>
        }
        {business.review_count > 0 &&
        <p className="text-[9px] text-muted-foreground/60 mt-0.5">
            {business.review_count} members recently visited · Popular in {business.city}
          </p>
        }
      </div>
    </div>);

}

// Community post card — matches screenshot style
function CommunityPost({ post, currentUser }) {
  return <DiscussionCard post={post} currentUser={currentUser} />;
}

export default function Home() {
  const navigate = useNavigate();
  const { applyDiscovery, city } = useDiscovery();
  const { user } = useAuth();
  // Start with seeded data — replace with live DB data when available
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [discussions, setDiscussions] = useState(MOCK_DISCUSSIONS);
  const containerRef = useRef(null);

  useEffect(() => {
    // Merge live DB data on top of seeded — DB data takes priority
    base44.entities.Business.list("-rating", 20)
      .then(data => { if (data?.length) setBusinesses([...data, ...MOCK_BUSINESSES].slice(0, 20)); })
      .catch(() => {});
    base44.entities.Listing.filter({ status: "active" }, "-created_date", 80)
      .then(data => { if (data?.length) setListings([...data, ...MOCK_LISTINGS]); })
      .catch(() => {});
    base44.entities.Post.list("-created_date", 20)
      .then(data => {
        if (data?.length) {
          const livePosts = data.map(p => ({
            id: p.id, author_name: p.author_name, author_avatar: p.author_avatar,
            content: p.content, city: p.city, tag: p.type || "Post",
            reply_count: p.comment_count || 0, views: 0, likes: p.like_count || 0,
            created_date: p.created_date, top_reply: null, tone: "active",
          }));
          setDiscussions([...livePosts, ...MOCK_DISCUSSIONS].slice(0, 20));
        }
      })
      .catch(() => {});
  }, []);

  // Build ranked mixed feed
  const feedItems = useMemo(() => {
    const userCity = city || user?.city;
    const ranked = rankListings(applyDiscovery(listings, 'home'), userCity);
    const jobs = ranked.filter(l => l.category === "jobs").slice(0, 5);
    const urgent = ranked.filter(l => l.category !== "jobs" && l.is_featured).slice(0, 3);
    const rest = ranked.filter(l => l.category !== "jobs" && !l.is_featured).slice(0, 8);
    const allListings = [...urgent, ...jobs, ...rest];

    const items = [];
    let li = 0;
    for (let i = 0; i < discussions.length; i++) {
      items.push({ type: "discussion", data: discussions[i] });
      // Insert a listing every 2 discussions
      if (i % 2 === 1 && li < allListings.length) {
        items.push({ type: "listing", data: allListings[li++] });
      }
    }
    // Append remaining listings
    while (li < allListings.length) {
      items.push({ type: "listing", data: allListings[li++] });
    }
    return items;
  }, [listings, discussions, applyDiscovery, city, user?.city]);

  return (
    <div ref={containerRef} className="min-h-dvh pb-4">

      {/* ── DISCOVERY FILTER CHIPS ── */}
      <GlobalDiscoveryBar
        category="home"
        suggestions={["Nearby", "Top Rated", "Recently Posted", "Verified", "Free"]}
      />

      {/* ── FEATURED BUSINESSES ── */}
      <section className="pt-4 pb-2">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-[16px] font-bold text-foreground">Featured Businesses</h2>
          <button onClick={() => navigate("/businesses")} className="text-[12px] font-semibold text-primary">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {[...businesses]
            .sort((a, b) => {
              const ua = city || user?.city;
              const matchA = ua && a.city === ua ? 10 : 0;
              const matchB = ua && b.city === ua ? 10 : 0;
              return (b.rating || 0) + matchB - ((a.rating || 0) + matchA);
            })
            .slice(0, 8)
            .map(b => <FeaturedBusinessCard key={b.id} business={b} />)}
        </div>
      </section>

      {/* ── WHAT'S HAPPENING ── */}
      <section className="pt-4">
        <h2 className="text-[16px] font-bold text-foreground px-4 mb-3">What's happening</h2>

        {/* Mixed community feed */}
        <div className="px-4 space-y-3">
          {feedItems.map((item, i) => {
            if (item.type === "discussion") {
              return (
                <motion.div
                  key={`d-${item.data.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                  
                  <CommunityPost post={item.data} currentUser={user} />
                </motion.div>);

            }
            return (
              <motion.div
                key={`l-${item.data.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                
                <FeedItem listing={item.data} variant="compact" userCity={user?.city} />
              </motion.div>);

          })}
        </div>
      </section>
    </div>);

}