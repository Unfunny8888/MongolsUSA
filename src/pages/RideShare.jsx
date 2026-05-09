/**
 * RideShare — carpooling, rides, travel coordination.
 * Same architecture as all category pages.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, Users, Calendar, Clock, ArrowRight } from "lucide-react";
import { MOCK_DISCUSSIONS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  LocationBar, FilterBar, SubTabs,
  SectionLabel, EmptyState,
} from "../components/shared/CategoryPageLayout";

const FILTERS = ["All", "Today", "This Week", "Airport", "Long Distance"];
const TABS = [["find", "Find a Ride"], ["offer", "Offer a Ride"], ["travel", "Travel Buddy"]];

function RideCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card border border-border/20 rounded-2xl px-3 py-3 cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-3">
        <img
          src={item.author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
          alt={item.author_name}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground">{item.author_name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.content}</p>
        </div>
        <button className="shrink-0 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
          Join
        </button>
      </div>
      {item.city && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
          <MapPin className="w-2.5 h-2.5" />
          <span>{item.city}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function RideShare() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("find");
  const [location, setLocation] = useState("Chicago, IL");

  const rides = MOCK_DISCUSSIONS.filter(d => d.tag === "Ride Share");

  return (
    <div className="min-h-dvh">
      <LocationBar location={location} onChangeClick={() => {}} />
      <FilterBar filters={FILTERS} active={activeFilter} onSelect={setActiveFilter} />
      <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      <div className="px-4 py-4">
        {activeTab === "find" && (
          <>
            <SectionLabel>Available rides</SectionLabel>
            {rides.length > 0 ? (
              <div className="space-y-2.5">
                {rides.map((r, i) => <RideCard key={r.id} item={r} index={i} />)}
              </div>
            ) : (
              <EmptyState emoji="🚗" title="No rides posted yet" subtitle="Check back soon or post your own" />
            )}
          </>
        )}
        {activeTab === "offer" && (
          <EmptyState emoji="🙋" title="Offer a ride" subtitle="Post your route to help others get around" />
        )}
        {activeTab === "travel" && (
          <EmptyState emoji="✈️" title="Find a travel buddy" subtitle="Connect with others headed the same way" />
        )}
      </div>
    </div>
  );
}