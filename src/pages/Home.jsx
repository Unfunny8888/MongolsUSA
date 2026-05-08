import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import SectionHeader from "../components/home/SectionHeader";
import CitySelector from "../components/home/CitySelector"
import CategoryChip from "../components/cards/CategoryChip";
import ListingCard from "../components/cards/ListingCard";
import GroupCard from "../components/cards/GroupCard";
import BusinessCard from "../components/cards/BusinessCard";
import FeedSkeleton from "../components/common/FeedSkeleton";
import { MOCK_LISTINGS, MOCK_GROUPS, MOCK_BUSINESSES, CATEGORIES } from "../lib/mockData";
import { buildFeedSections } from "../lib/feedAlgorithm";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
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
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        setCurrentUser(me);
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

  const filteredListings = listings
    .filter(l => !selectedCategory || l.category === selectedCategory.id)
    .filter(l => !selectedCity || l.location_city === selectedCity);
  const { forYou, nearby, trending, fresh, featured, jobs, events } = buildFeedSections(filteredListings, currentUser);

  const handlePullToRefresh = async (e) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop !== 0) return;

    if (e.type === "touchstart") {
      touchStartY.current = e.touches[0].clientY;
      scrollStartPos.current = scrollTop;
      scrolledDistance.current = 0;
      return;
    }

    if (e.type === "touchmove" && !isRefreshing) {
      if (containerRef.current) {
        scrolledDistance.current = Math.abs((containerRef.current.scrollTop || 0) - scrollStartPos.current);
      }
      const touchCurrentY = e.touches[0].clientY;
      const diff = touchCurrentY - touchStartY.current;
      if (diff > 0 && scrolledDistance.current < 5) {
        const progress = Math.min(diff / 80, 1);
        setPullProgress(progress);
      }
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
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handlePullToRefresh}
      onTouchMove={handlePullToRefresh}
      onTouchEnd={handlePullToRefresh}
      className="min-h-dvh overflow-y-auto relative"
      data-scrollable="true"
    >
      {pullProgress > 0 && (
        <motion.div
          className="fixed top-8 left-1/2 -translate-x-1/2 z-40"
          animate={{ scale: pullProgress }}
        >
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </motion.div>
      )}
      {isRefreshing && (
        <div className="sticky top-0 z-30 flex justify-center py-3 bg-emerald-100 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Refreshing feed...
          </div>
        </div>
      )}
      <div className="min-h-dvh">
        {/* Categories */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <div>
            <h2 className="text-xl font-bold text-foreground">Categories</h2>
            <p className="text-xs text-muted-foreground">Browse by type</p>
          </div>
          <CitySelector city={selectedCity} onCityChange={setSelectedCity} />
        </div>
        <div className="px-4 pb-4">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1" data-scrollable="true">
            <CategoryChip
              category={{ id: "all", label: "All", labelMn: "Бүгд", icon: "globe" }}
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

        {/* Category View */}
        {selectedCategory && (
          <>
            <div className="px-4 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedCategory.label}</h2>
                <p className="text-xs text-muted-foreground mt-1">{filteredListings.length} listings</p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="px-4 space-y-3 pb-6">
             {isLoading ? (
              <FeedSkeleton count={3} />
            ) : filteredListings.length > 0 ? (
              filteredListings.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm font-medium text-foreground">No listings found</p>
              </div>
            )}
            </div>
          </>
        )}

        {!selectedCategory && (
          <>
            {/* Featured — premium boosted */}
            {featured.length > 0 && (
              <>
                <SectionHeader title="✨ Featured" subtitle="Promoted listings" linkTo="/explore?featured=true" />
                <div className="px-4 pb-2">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {featured.map((l, i) => (
                      <div key={l.id} className="min-w-[280px] max-w-[300px]">
                        <ListingCard listing={l} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* For You — interest + reputation + proximity ranked */}
            {forYou.length > 0 && (
              <>
                <SectionHeader title="⭐ For You" subtitle="Based on your interests" linkTo="/explore" />
                <div className="px-4 pb-2">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {forYou.map((l, i) => (
                      <div key={l.id} className="min-w-[280px] max-w-[300px]">
                        <ListingCard listing={l} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Nearby — location proximity */}
            {nearby.length > 0 && (
              <>
                <SectionHeader title="📍 Near You" subtitle={currentUser?.city || "In your city"} linkTo="/explore" />
                <div className="px-4 pb-2">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {nearby.map((l, i) => (
                      <div key={l.id} className="min-w-[280px] max-w-[300px]">
                        <ListingCard listing={l} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Trending — engagement score */}
            <SectionHeader title="🔥 Trending" subtitle="Most viewed this week" linkTo="/explore" />
            <div className="px-4 space-y-3.5 pb-4">
              {isLoading ? (
              <FeedSkeleton count={2} />
            ) : (
              trending.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))
            )}
            </div>

            {/* Just Listed — freshness */}
            <SectionHeader title="🆕 Just Listed" subtitle="Posted recently" linkTo="/explore" />
            <div className="px-4 space-y-3.5 pb-4">
              {fresh.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>

            {/* Jobs Section */}
            {jobs.length > 0 && (
              <>
                <SectionHeader title="💼 Jobs" subtitle="Latest opportunities" linkTo="/explore?category=jobs" />
                <div className="px-4 space-y-3.5 pb-4">
                  {jobs.map((l, i) => (
                    <ListingCard key={l.id} listing={l} index={i} />
                  ))}
                </div>
              </>
            )}

            {/* Events */}
            {events.length > 0 && (
              <>
                <SectionHeader title="🎉 Events" subtitle="Upcoming gatherings" linkTo="/explore?category=events" />
                <div className="px-4 space-y-3.5 pb-4">
                  {events.map((l, i) => (
                    <ListingCard key={l.id} listing={l} index={i} />
                  ))}
                </div>
              </>
            )}

            {/* Businesses */}
            <SectionHeader title="🏪 Businesses" subtitle="Mongolian-owned" linkTo="/businesses" />
            <div className="px-4 pb-4">
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {businesses.map((b, i) => (
                  <BusinessCard key={b.id} business={b} index={i} />
                ))}
              </div>
            </div>

            {/* Groups */}
            <SectionHeader title="👥 Communities" subtitle="Join your local group" linkTo="/groups" />
            <div className="px-4 space-y-3 pb-6">
              {isLoading ? (
              <FeedSkeleton count={2} />
            ) : (
              groups.slice(0, 3).map((g, i) => (
                <GroupCard key={g.id} group={g} index={i} />
              ))
            )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}