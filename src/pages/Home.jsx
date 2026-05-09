import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, Flame, MapPin, Briefcase, CalendarDays, Store, Users,
  TrendingUp, Eye, Heart, MessageCircle, ArrowRight, Sparkles, Star, Zap
} from "lucide-react";
import CitySelector from "../components/home/CitySelector";
import CategoryChip from "../components/cards/CategoryChip";
import ListingCard from "../components/cards/ListingCard";
import GroupCard from "../components/cards/GroupCard";
import BusinessCard from "../components/cards/BusinessCard";
import FeedSkeleton from "../components/common/FeedSkeleton";
import SuggestedUsers from "../components/discovery/SuggestedUsers";
import TrendingPosts from "../components/discovery/TrendingPosts";
import ActiveNow from "../components/discovery/ActiveNow";
import { MOCK_LISTINGS, MOCK_GROUPS, MOCK_BUSINESSES, CATEGORIES } from "../lib/mockData";
import { buildFeedSections } from "../lib/feedAlgorithm";
import { getUserCityFromIP } from "../lib/geolocationUtils";
import { base44 } from "@/api/base44Client";

// Inline section label — subtle, not loud
function FeedLabel({ icon: Icon, label, linkTo, onPress }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary" strokeWidth={2} />}
        <span className="text-[13px] font-bold text-foreground tracking-tight">{label}</span>
      </div>
      {linkTo && (
        <button
          onClick={() => navigate(linkTo)}
          className="flex items-center gap-1 text-[12px] font-semibold text-primary/80 active:text-primary transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Trending card — large, social, with engagement stats
function TrendingCard({ listing, rank, index }) {
  const navigate = useNavigate();
  const hasImg = listing.images?.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.22 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm active:scale-[0.985] active:shadow-none transition-all duration-200 cursor-pointer"
    >
      {hasImg && (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {/* Rank badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-2.5 py-1">
            <Flame className="w-3 h-3 text-orange-400" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-white">#{rank} Trending</span>
          </div>
          {/* Price */}
          {listing.price && (
            <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur rounded-lg px-2.5 py-1 text-primary-foreground font-bold text-sm">
              ${listing.price.toLocaleString()}
            </div>
          )}
          {/* Bottom overlay — title + stats */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-[15px] leading-snug line-clamp-2 mb-2">{listing.title}</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-white/80 text-[11px] font-semibold">
                <Eye className="w-3 h-3" /> {listing.views || 0}
              </span>
              <span className="flex items-center gap-1 text-white/80 text-[11px] font-semibold">
                <Heart className="w-3 h-3" /> {listing.saves || 0}
              </span>
              {listing.location_city && (
                <span className="flex items-center gap-1 text-white/70 text-[11px]">
                  <MapPin className="w-3 h-3" /> {listing.location_city}
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
          <p className="font-bold text-[15px] leading-snug mb-2">{listing.title}</p>
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{listing.saves || 0}</span>
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
      className="flex-shrink-0 w-44 bg-card rounded-xl border border-border/30 overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-150 cursor-pointer"
    >
      <div className="w-full h-28 bg-secondary/40">
        {hasImg && <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />}
      </div>
      <div className="p-2.5">
        <p className="text-[12px] font-semibold line-clamp-2 leading-snug text-foreground">{listing.title}</p>
        {listing.price ? (
          <p className="text-primary font-bold text-[13px] mt-1">${listing.price.toLocaleString()}</p>
        ) : (
          <p className="text-muted-foreground text-[11px] mt-1">Contact</p>
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
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-[13px] font-bold text-foreground tracking-tight">Browse</p>
        <CitySelector city={selectedCity} onCityChange={setSelectedCity} />
      </div>
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
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

      {/* ── SOCIAL FEED ─────────────────────────────── */}
      {!selectedCategory && (
        <div className="pb-6">

          {/* SECTION: Trending Now — large social cards */}
          {isLoading ? (
            <div className="px-4 space-y-3"><FeedSkeleton count={2} /></div>
          ) : trending.length > 0 && (
            <>
              <FeedLabel icon={Flame} label="Trending Now" linkTo="/explore" />
              <div className="px-4 space-y-3">
                {trending.slice(0, 3).map((l, i) => (
                  <TrendingCard key={l.id} listing={l} rank={i + 1} index={i} />
                ))}
              </div>
            </>
          )}

          {/* SECTION: Active community */}
          <div className="mt-1">
            <ActiveNow />
          </div>

          {/* SECTION: Near You — horizontal scroll tiles */}
          {nearby.length > 0 && (
            <>
              <FeedLabel icon={MapPin} label={`Near ${cityLabel}`} linkTo="/explore" />
              <div className="px-4">
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {nearby.map(l => <MiniListingCard key={l.id} listing={l} />)}
                </div>
              </div>
            </>
          )}

          {/* SECTION: Trending Posts / discussions */}
          <div className="mt-1">
            <TrendingPosts />
          </div>

          {/* SECTION: Featured spotlight — full width cards */}
          {featured.length > 0 && (
            <>
              <FeedLabel icon={Sparkles} label="Spotlight" linkTo="/explore?featured=true" />
              <div className="px-4 space-y-3">
                {featured.slice(0, 2).map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
              </div>
            </>
          )}

          {/* SECTION: Jobs */}
          {jobs.length > 0 && (
            <>
              <FeedLabel icon={Briefcase} label="Jobs" linkTo="/explore?category=jobs" />
              <div className="px-4">
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {jobs.map(l => <MiniListingCard key={l.id} listing={l} />)}
                </div>
              </div>
            </>
          )}

          {/* SECTION: Communities */}
          <FeedLabel icon={Users} label="Communities" linkTo="/groups" />
          <div className="px-4 space-y-3">
            {isLoading ? <FeedSkeleton count={2} /> : groups.slice(0, 3).map((g, i) => <GroupCard key={g.id} group={g} index={i} />)}
          </div>

          {/* SECTION: Suggested users */}
          <div className="mt-1">
            <SuggestedUsers />
          </div>

          {/* SECTION: Fresh listings — just posted */}
          {fresh.length > 0 && (
            <>
              <FeedLabel icon={Star} label="Just Listed" linkTo="/explore" />
              <div className="px-4">
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {fresh.map(l => <MiniListingCard key={l.id} listing={l} />)}
                </div>
              </div>
            </>
          )}

          {/* SECTION: Events */}
          {events.length > 0 && (
            <>
              <FeedLabel icon={CalendarDays} label="Events" linkTo="/explore?category=events" />
              <div className="px-4 space-y-3">
                {events.slice(0, 2).map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
              </div>
            </>
          )}

          {/* SECTION: Businesses */}
          <FeedLabel icon={Store} label="Businesses" linkTo="/businesses" />
          <div className="px-4">
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {businesses.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}
            </div>
          </div>

          {/* For You — vertical feed at the bottom */}
          {forYou.length > 0 && (
            <>
              <FeedLabel icon={TrendingUp} label="For You" linkTo="/explore" />
              <div className="px-4 space-y-3">
                {forYou.slice(0, 4).map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}