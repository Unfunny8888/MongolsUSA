import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import FeaturedBanner from "../components/home/FeaturedBanner";
import SectionHeader from "../components/home/SectionHeader";
import CategoryChip from "../components/cards/CategoryChip";
import ListingCard from "../components/cards/ListingCard";
import GroupCard from "../components/cards/GroupCard";
import BusinessCard from "../components/cards/BusinessCard";
import { MOCK_LISTINGS, MOCK_GROUPS, MOCK_BUSINESSES, CATEGORIES } from "../lib/mockData";
import { buildFeedSections } from "../lib/feedAlgorithm";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        setCurrentUser(me);
        if (!me.onboarded) navigate("/onboarding");
      }

      const [dbListings, dbGroups, dbBiz] = await Promise.allSettled([
        base44.entities.Listing.list("-created_date", 60),
        base44.entities.Group.list("-member_count", 10),
        base44.entities.Business.list("-rating", 10),
      ]);
      if (dbListings.status === "fulfilled" && dbListings.value.length > 0) {
        setListings(dbListings.value);
      }
      if (dbGroups.status === "fulfilled" && dbGroups.value.length > 0) {
        setGroups(dbGroups.value);
      }
      if (dbBiz.status === "fulfilled" && dbBiz.value.length > 0) {
        setBusinesses(dbBiz.value);
      }
    }
    loadData();
  }, []);

  const { forYou, nearby, trending, fresh, featured, jobs, events } = buildFeedSections(listings, currentUser);

  return (
    <div className="min-h-dvh">
      <HomeHeader />
      <SearchBar />
      <FeaturedBanner />

      {/* Categories */}
      <SectionHeader title="Categories" subtitle="Browse by type" />
      <div className="px-4 pb-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat, i) => (
            <CategoryChip key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>

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
      <div className="px-4 space-y-3 pb-2">
        {trending.map((l, i) => (
          <ListingCard key={l.id} listing={l} index={i} />
        ))}
      </div>

      {/* Just Listed — freshness */}
      <SectionHeader title="🆕 Just Listed" subtitle="Posted recently" linkTo="/explore" />
      <div className="px-4 pb-2">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {fresh.map((l, i) => (
            <div key={l.id} className="min-w-[280px] max-w-[300px]">
              <ListingCard listing={l} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Jobs Section */}
      {jobs.length > 0 && (
        <>
          <SectionHeader title="💼 Jobs" subtitle="Latest opportunities" linkTo="/explore?category=jobs" />
          <div className="px-4 pb-2">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {jobs.map((l, i) => (
                <div key={l.id} className="min-w-[280px] max-w-[300px]">
                  <ListingCard listing={l} index={i} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Events */}
      {events.length > 0 && (
        <>
          <SectionHeader title="🎉 Events" subtitle="Upcoming gatherings" linkTo="/explore?category=events" />
          <div className="px-4 pb-2">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {events.map((l, i) => (
                <div key={l.id} className="min-w-[280px] max-w-[300px]">
                  <ListingCard listing={l} index={i} />
                </div>
              ))}
            </div>
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
        {groups.slice(0, 3).map((g, i) => (
          <GroupCard key={g.id} group={g} index={i} />
        ))}
      </div>
    </div>
  );
}