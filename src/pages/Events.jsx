import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Clock, Heart } from "lucide-react";
import { MOCK_LISTINGS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  DiscoveryBar, SubTabs, SectionLabel,
  EmptyState, ImageCard, MapDiscovery,
} from "../components/shared/CategoryPageLayout";

const SUGGESTIONS = ["Nearby", "This Week", "Free", "Popular", "Concerts", "Community", "Sports"];
const TABS = [["upcoming", "Upcoming"], ["past", "Past"], ["hosting", "Hosting"]];

function EventCard({ listing, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const dateStr = listing.event_date
    ? new Date(listing.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <ImageCard
        imageSrc={listing.images?.[0]}
        imageAlt={listing.title}
        imageFallback={<CalendarDays className="w-10 h-10 text-violet-300" />}
        priceOverlay={listing.event_ticket_price ? `$${listing.event_ticket_price}` : "Free"}
        topRight={
          <button onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
            className="w-8 h-8 bg-white/90 dark:bg-card/90 rounded-full flex items-center justify-center shadow-sm">
            <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
          </button>
        }
        title={listing.title}
        meta={
          <>
            {dateStr && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{dateStr}</span>}
            {listing.event_venue && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{listing.event_venue}</span>}
          </>
        }
        onClick={() => navigate(`/listing/${listing.id}`)}
      />
    </motion.div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const [activeSug, setActiveSug] = useState("Nearby");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [viewMode, setViewMode] = useState("list");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "events"));
  const [city, setCity] = useState(null);

  useEffect(() => {
    base44.entities.Listing.filter({ category: "events", status: "active" }, "-created_date", 50)
      .then(data => { if (data?.length) setListings(data); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = city ? listings.filter(l => l.location_city === city) : listings;
    if (activeSug === "Free") return result.filter(l => !l.event_ticket_price || l.event_ticket_price === 0);
    return result;
  }, [listings, activeSug, city]);

  return (
    <div className="min-h-dvh">
      <DiscoveryBar
        city={city}
        onCityChange={setCity}
        suggestions={SUGGESTIONS}
        activeSug={activeSug}
        onSuggest={setActiveSug}
        viewMode={viewMode}
        onToggleView={() => setViewMode("map")}
      />
      <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      {viewMode === "map" ? (
        <MapDiscovery listings={filtered} onSelect={l => navigate(`/listing/${l.id}`)} onBackToList={() => setViewMode("list")} />
      ) : (
        <div className="px-4 py-4">
          {activeTab === "upcoming" && (
            <>
              <SectionLabel>Events near you</SectionLabel>
              {filtered.length > 0 ? (
                <div className="space-y-3">
                  {filtered.map((l, i) => <EventCard key={l.id} listing={l} index={i} />)}
                </div>
              ) : (
                <EmptyState emoji="🎉" title="No events found" subtitle="Check back soon for local events" />
              )}
            </>
          )}
          {activeTab === "past" && (
            <EmptyState emoji="📅" title="No past events" subtitle="Events you attended will appear here" />
          )}
          {activeTab === "hosting" && (
            <EmptyState emoji="🎤" title="Not hosting any events" subtitle="Create a listing to host your own event" />
          )}
        </div>
      )}
    </div>
  );
}