import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, Flame, MapPin, Briefcase, CalendarDays, Store, Users,
  TrendingUp, Eye, Heart, MessageCircle, ArrowRight, Sparkles, Star, Zap, Clock
} from "lucide-react";
import FeedItem from "../components/feed/FeedItem";
import CitySelector from "../components/home/CitySelector";
import CategoryChip from "../components/cards/CategoryChip";
import ListingCard from "../components/cards/ListingCard";
import GroupCard from "../components/cards/GroupCard";
import BusinessCard from "../components/cards/BusinessCard";
import FeedSkeleton from "../components/common/FeedSkeleton";
import SuggestedUsers from "../components/discovery/SuggestedUsers";
import TrendingPosts from "../components/discovery/TrendingPosts";
import ActiveNow from "../components/discovery/ActiveNow";
import SuggestedGroups from "../components/discovery/SuggestedGroups";
import { MOCK_LISTINGS, MOCK_GROUPS, MOCK_BUSINESSES, CATEGORIES } from "../lib/mockData";
import { buildFeedSections } from "../lib/feedAlgorithm";
import { getUserCityFromIP } from "../lib/geolocationUtils";
import { base44 } from "@/api/base44Client";

// Inline section label — subtle, not loud
function FeedLabel({ icon: Icon, label, linkTo }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary/70" strokeWidth={2.5} />}
        <span className="text-[12px] font-bold text-foreground/70 uppercase tracking-widest">{label}</span>
      </div>
      {linkTo && (
        <button
          onClick={() => navigate(linkTo)}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-primary/70 active:text-primary transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Trending card — social, with engagement overlay
function TrendingCard({ listing, rank, index }) {
  const navigate = useNavigate();
  const hasImg = listing.images?.length > 0;
  const engagementScore = (listing.views || 0) + (listing.saves || 0) * 3;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm active:scale-[0.985] active:shadow-none transition-all duration-150 cursor-pointer"
    >
      {hasImg && (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Flame className="w-3 h-3 text-orange-400" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-white">#{rank}</span>
            </div>
            {engagementScore > 50 && (
              <div className="flex items-center gap-1 bg-primary/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Zap className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                <span className="text-[10px] font-bold text-white">Hot</span>
              </div>
            )}
          </div>
          {listing.price && (
            <div className="absolute top-2.5 right-2.5 bg-card/90 backdrop-blur rounded-lg px-2 py-0.5 text-foreground font-bold text-[13px]">
              ${listing.price.toLocaleString()}
            </div>
          )}
          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
            <p className="text-white font-bold text-[14px] leading-snug line-clamp-2 mb-2 drop-shadow">{listing.title}</p>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-white/75 text-[11px]">
                <Eye className="w-3 h-3" /> {listing.views || 0}
              </span>
              <span className="flex items-center gap-1 text-white/75 text-[11px]">
                <Heart className="w-3 h-3" /> {listing.saves || 0}
              </span>
              <span className="flex items-center gap-1 text-white/75 text-[11px]">
                <MessageCircle className="w-3 h-3" /> {listing.comment_count || 0}
              </span>
              {listing.location_city && (
                <span className="ml-auto flex items-center gap-0.5 text-white/60 text-[10px]">
                  <MapPin className="w-2.5 h-2.5" /> {listing.location_city}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {!hasImg && (
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[11px] font-bold text-orange-500">#{rank} Trending</span>
          </div>
          <p className="font-bold text-[14px] leading-snug mb-2">{listing.title}</p>
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{listing.saves || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{listing.comment_count || 0}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Compact horizontal listing tile
function MiniListingCard({ listing }) {
  const navigate = useNavigate();
  const hasImg = listing.images?.length > 0;
  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex-shrink-0 w-40 bg-card rounded-xl border border-border/30 overflow-hidden active:scale-[0.97] active:opacity-90 transition-all duration-150 cursor-pointer"
    >
      <div className="w-full h-24 bg-secondary/50">
        {hasImg && <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />}
      </div>
      <div className="p-2">
        <p className="text-[11px] font-semibold line-clamp-2 leading-snug text-foreground">{listing.title}</p>
        {listing.price ? (
          <p className="text-primary font-bold text-[12px] mt-1">${listing.price.toLocaleString()}</p>
        ) : (
          <p className="text-muted-foreground text-[10px] mt-1">Contact</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState(undefined);
  const touchStartY = useRef(0);
  const scrolledDistance = useRef(0);
  const scrollStartPos = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const geoData = await getUserCityFromIP();
      setIpLocation(geoData);
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        const userWithLocation = { ...me, city: me.city || geoData?.city };
        setCurrentUser(userWithLocation);
        if (!me.onboarded) navigate("/onboarding");
      }
      setListings(MOCK_LISTINGS);
      const [dbGroups, dbBiz] = await Promise.allSettled([
        base44.entities.Group.list("-member_count", 10),
        base44.entities.Business.list("-rating", 10),
      ]);
      setGroups(dbGroups.status === "fulfilled" && dbGroups.value.length > 0 ? dbGroups.value : MOCK_GROUPS);
      setBusinesses(dbBiz.status === "fulfilled" && dbBiz.value.length > 0 ? dbBiz.value : MOCK_BUSINESSES);
      setIsLoading(false);
    }
    loadData();
  }, [navigate]);

  const filteredListings = useMemo(
    () => listings
      .filter(l => !selectedCategory || l.category === selectedCategory.id)
      .filter(l => !selectedCity || l.location_city === selectedCity),
    [listings, selectedCategory, selectedCity]
  );

  const feedSections = useMemo(
    () => buildFeedSections(filteredListings, currentUser),
    [filteredListings, currentUser]
  );
  const { forYou, nearby, trending, fresh, featured, jobs, events } = feedSections;

  const handlePullToRefresh = useCallback(async (e) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop !== 0) return;
    if (e.type === "touchstart") {
      touchStartY.current = e.touches[0].clientY;
      scrollStartPos.current = scrollTop;
      scrolledDistance.current = 0;
      return;
    }
    if (e.type === "touchmove" && !isRefreshing) {
      if (containerRef.current) scrolledDistance.current = Math.abs((containerRef.current.scrollTop || 0) - scrollStartPos.current);
      const diff = e.touches[0].clientY - touchStartY.current;
      if (diff > 0 && scrolledDistance.current < 5) setPullProgress(Math.min(diff / 80, 1));
      return;
    }
    if (e.type === "touchend") {
      if (pullProgress > 0.7) {
        setIsRefreshing(true);
        setPullProgress(0);
        setTimeout(async () => {
          setListings(MOCK_LISTINGS);
          const [dbGroups, dbBiz] = await Promise.allSettled([
            base44.entities.Group.list("-member_count", 10),
            base44.entities.Business.list("-rating", 10),
          ]);
          setGroups(dbGroups.status === "fulfilled" && dbGroups.value.length > 0 ? dbGroups.value : MOCK_GROUPS);
          setBusinesses(dbBiz.status === "fulfilled" && dbBiz.value.length > 0 ? dbBiz.value : MOCK_BUSINESSES);
          setIsRefreshing(false);
        }, 800);
      } else {
        setPullProgress(0);
      }
    }
  }, [pullProgress, isRefreshing]);

  const cityLabel = currentUser?.city || ipLocation?.city || "your area";

  return (
    <div
      ref={containerRef}
      onTouchStart={handlePullToRefresh}
      onTouchMove={handlePullToRefresh}
      onTouchEnd={handlePullToRefresh}
      className="min-h-dvh feed-container"
    >
      {/* Pull-to-refresh indicator */}
      {pullProgress > 0 && (
        <motion.div className="fixed top-16 left-1/2 -translate-x-1/2 z-40" animate={{ scale: pullProgress }}>
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </motion.div>
      )}
      {isRefreshing && (
        <div className="sticky top-0 z-30 flex justify-center py-2.5 bg-primary/8 border-b border-primary/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Refreshing…
          </div>
        </div>
      )}

      {/* ── CATEGORY FILTER BAR ─────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <p className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Browse</p>
        <CitySelector city={selectedCity} onCityChange={setSelectedCity} />
      </div>
      <div className="px-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <CategoryChip
            category={{ id: "all", label: "All", icon: "globe" }}
            index={0}
            onClick={() => setSelectedCategory(null)}
            isSelected={selectedCategory === null}
          />
          {CATEGORIES.map((cat, i) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              index={i + 1}
              onClick={setSelectedCategory}
              isSelected={selectedCategory?.id === cat.id}
            />
          ))}
        </div>
      </div>

      {/* ── CATEGORY FILTERED VIEW ──────────────────── */}
      {selectedCategory && (
        <div className="px-4 pb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">{selectedCategory.label}</h2>
              <p className="text-[11px] text-muted-foreground">{filteredListings.length} listings</p>
            </div>
            <button onClick={() => setSelectedCategory(null)} className="text-xs font-semibold text-primary">Clear</button>
          </div>
          {isLoading ? <FeedSkeleton count={3} /> : filteredListings.length > 0 ? (
            <div className="space-y-3">
              {filteredListings.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-medium text-foreground">No listings in this category</p>
            </div>
          )}
        </div>
      )}

      {/* ── CONTINUOUS SOCIAL FEED ─────────────────── */}
      {!selectedCategory && (
        <div className="px-4 pb-8 space-y-3">
          {isLoading ? (
            <FeedSkeleton count={4} />
          ) : (() => {
            const feedItems = [];
            if (trending[0]) feedItems.push({ type: "trending", data: trending[0], key: "t0" });
            feedItems.push({ type: "widget_active", key: "active" });
            feedItems.push({ type: "widget_trending_posts", key: "tp" });
            if (trending[1]) feedItems.push({ type: "trending", data: trending[1], key: "t1" });
            nearby.slice(0, 2).forEach((l, i) => feedItems.push({ type: "listing", data: l, key: `nb${i}` }));
            if (jobs.length > 0) feedItems.push({ type: "row_jobs", key: "jobs" });
            feedItems.push({ type: "row_groups", key: "groups" });
            feedItems.push({ type: "widget_users", key: "users" });
            fresh.slice(0, 2).forEach((l, i) => feedItems.push({ type: "listing", data: l, key: `fr${i}` }));
            if (trending[2]) feedItems.push({ type: "trending", data: trending[2], key: "t2" });
            events.slice(0, 2).forEach((l, i) => feedItems.push({ type: "listing", data: l, key: `ev${i}` }));
            feedItems.push({ type: "row_businesses", key: "biz" });
            forYou.slice(0, 4).forEach((l, i) => feedItems.push({ type: "listing", data: l, key: `fy${i}` }));

            return feedItems.map(item => {
              if (item.type === "trending") return <FeedItem key={item.key} listing={item.data} isTrending />;
              if (item.type === "listing") return <FeedItem key={item.key} listing={item.data} />;
              if (item.type === "widget_active") return <div key={item.key} className="-mx-4"><ActiveNow /></div>;
              if (item.type === "widget_trending_posts") return <div key={item.key} className="-mx-4"><TrendingPosts /></div>;
              if (item.type === "widget_users") return <div key={item.key} className="-mx-4"><SuggestedUsers /></div>;
              if (item.type === "row_jobs") return (
                <div key={item.key}>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Jobs</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">{jobs.map(l => <MiniListingCard key={l.id} listing={l} />)}</div>
                </div>
              );
              if (item.type === "row_groups") return (
                <div key={item.key}>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Users className="w-3 h-3" /> Communities</p>
                  <div className="space-y-2.5">{groups.slice(0, 2).map((g, i) => <GroupCard key={g.id} group={g} index={i} />)}</div>
                </div>
              );
              if (item.type === "row_businesses") return (
                <div key={item.key}>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Store className="w-3 h-3" /> Businesses</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">{businesses.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}</div>
                </div>
              );
              return null;
            });
          })()}
        </div>
      )}
    </div>
  );
}