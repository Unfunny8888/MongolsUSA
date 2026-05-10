/**
 * Home — unified social + discovery feed.
 * Featured businesses → What's happening tabs → mixed community posts.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bookmark, ChevronRight, MessageCircle, Heart, Clock, Store } from "lucide-react";
import { MOCK_BUSINESSES, MOCK_DISCUSSIONS, MOCK_LISTINGS } from "../lib/mockData";
import { useDiscovery } from "@/lib/DiscoveryContext";
import { base44 } from "@/api/base44Client";
import DiscussionCard from "../components/feed/DiscussionCard";
import GlobalDiscoveryBar from "../components/shared/GlobalDiscoveryBar";
import FeedItem from "../components/feed/FeedItem";
import { getUserCityFromIP } from "../lib/geolocationUtils";

function timeAgo(d) {
  if (!d) return "";
  const mins = Math.floor((Date.now() - new Date(d)) / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

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

const FEED_TABS = [
{ id: "all", label: "All", icon: "🌐" },
{ id: "foryou", label: "For You", icon: null },
{ id: "nearby", label: "Nearby", icon: null },
{ id: "following", label: "Following", icon: null }];


export default function Home() {
  const navigate = useNavigate();
  const { city } = useDiscovery();
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const containerRef = useRef(null);

  useEffect(() => {
    async function load() {
      const geoData = await getUserCityFromIP().catch(() => null);
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        const userWithLocation = { ...me, city: me.city || geoData?.city };
        setCurrentUser(userWithLocation);
        if (!me.onboarded) navigate("/onboarding");
      }
      const [dbBiz] = await Promise.allSettled([
      base44.entities.Business.list("-rating", 10)]
      );
      if (dbBiz.status === "fulfilled" && dbBiz.value?.length > 0) setBusinesses(dbBiz.value);

      base44.entities.Listing.filter({ status: "active" }, "-created_date", 50).
      then((data) => {if (data?.length) setListings(data);}).
      catch(() => {});
    }
    load();
  }, [navigate]);

  // Build mixed feed: discussions + listings interspersed
  const feedItems = useMemo(() => {
    const d = MOCK_DISCUSSIONS;
    const jobs = listings.filter((l) => l.category === "jobs").slice(0, 4);
    const other = listings.filter((l) => l.category !== "jobs").slice(0, 6);
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
  }, [listings]);

  // city from global discovery context (or user's detected city as fallback)
  const displayCity = city || currentUser?.city || "your area";

  return (
    <div ref={containerRef} className="min-h-dvh pb-4">

      {/* ── GLOBAL DISCOVERY BAR ── */}
      <GlobalDiscoveryBar suggestions={["Nearby", "For You", "Following", "Top Rated", "Free Items"]} activeSug="Nearby" />

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

        {/* Feed tabs */}
        <div className="flex gap-1 px-4 mb-3 hidden">
          {FEED_TABS.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors shrink-0 ${
            activeTab === tab.id ?
            "bg-foreground text-background" :
            "bg-secondary/60 text-muted-foreground border border-border/20"}`
            }>
            
              {tab.icon && <span className="text-[11px]">{tab.icon}</span>}
              {tab.label}
            </button>
          )}
        </div>

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
                  
                  <CommunityPost post={item.data} currentUser={currentUser} />
                </motion.div>);

            }
            return (
              <motion.div
                key={`l-${item.data.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                
                <FeedItem listing={item.data} variant="compact" userCity={currentUser?.city} />
              </motion.div>);

          })}
        </div>
      </section>
    </div>);

}