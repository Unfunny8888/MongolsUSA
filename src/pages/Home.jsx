/**
 * Home — unified social + discovery feed.
 * Featured businesses → What's happening tabs → mixed community posts.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { Bookmark, Store } from "lucide-react";
import { MOCK_BUSINESSES, MOCK_DISCUSSIONS, MOCK_LISTINGS } from "../lib/mockData";
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
  const { applyDiscovery } = useDiscovery();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const containerRef = useRef(null);

  useEffect(() => {
    base44.entities.Business.list("-rating", 10)
      .then(data => { if (data?.length) setBusinesses(data); })
      .catch(() => {});
    base44.entities.Listing.filter({ status: "active" }, "-created_date", 50)
      .then(data => { if (data?.length) setListings(data); })
      .catch(() => {});
  }, []);

  // Build mixed feed: discussions + ranked listings interspersed
  const feedItems = useMemo(() => {
    const d = MOCK_DISCUSSIONS;
    const rankedListings = applyDiscovery(listings, 'home');
    const jobs = rankedListings.filter((l) => l.category === "jobs").slice(0, 4);
    const other = rankedListings.filter((l) => l.category !== "jobs").slice(0, 6);
    const items = [];

    // Interleave discussions + listings
    const all = [...d];
    let li = 0;
    for (let i = 0; i < all.length; i++) {
      items.push({ type: "discussion", data: all[i] });
      if (i % 2 === 1 && li < jobs.length) {
        items.push({ type: "listing", data: jobs[li++] });
      }
    }
    other.forEach((l) => items.push({ type: "listing", data: l }));
    return items;
  }, [listings, applyDiscovery]);

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
          {businesses.map((b, i) =>
          <FeaturedBusinessCard key={b.id} business={b} />
          )}
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