import { useState, useEffect } from "react";
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
import { base44 } from "@/api/base44Client";

export default function Home() {
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);

  useEffect(() => {
    async function loadData() {
      const [dbListings, dbGroups, dbBiz] = await Promise.allSettled([
        base44.entities.Listing.list("-created_date", 20),
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

  const featured = listings.filter((l) => l.is_featured);
  const jobs = listings.filter((l) => l.category === "jobs");
  const events = listings.filter((l) => l.category === "events");
  const recent = listings.slice(0, 6);

  return (
    <div className="min-h-screen">
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

      {/* Featured Listings */}
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

      {/* Recent Listings */}
      <SectionHeader title="🔥 Trending" subtitle="Most viewed this week" linkTo="/explore" />
      <div className="px-4 space-y-3 pb-2">
        {recent.map((l, i) => (
          <ListingCard key={l.id} listing={l} index={i} />
        ))}
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

      {/* Groups */}
      <SectionHeader title="👥 Communities" subtitle="Join your local group" linkTo="/groups" />
      <div className="px-4 space-y-3 pb-2">
        {groups.slice(0, 3).map((g, i) => (
          <GroupCard key={g.id} group={g} index={i} />
        ))}
      </div>

      {/* Businesses */}
      <SectionHeader title="🏪 Businesses" subtitle="Mongolian-owned" linkTo="/businesses" />
      <div className="px-4 pb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {businesses.map((b, i) => (
            <BusinessCard key={b.id} business={b} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}