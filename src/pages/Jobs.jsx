import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, Heart, Clock } from "lucide-react";
import { MOCK_LISTINGS, MOCK_DISCUSSIONS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { SubTabs, SectionLabel, EmptyState } from "../components/shared/CategoryPageLayout";
import GlobalDiscoveryBar from "../components/discovery/GlobalDiscoveryBar";
import GlobalMapDiscovery from "../components/maps/GlobalMapDiscovery";
import { useDiscovery } from "@/lib/DiscoveryContext";

const SUGGESTIONS = ["Nearby", "Full-time", "Part-time", "Remote", "CDL", "Cash", "Top Rated"];
const TABS = [["hiring", "Hiring"], ["looking", "Looking for Work"]];

function timeAgo(d) {
  if (!d) return "";
  const h = Math.floor((Date.now() - new Date(d)) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function JobCard({ listing, index, isHighlighted, onHighlight }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => { onHighlight(listing.id); navigate(`/listing/${listing.id}`); }}
      className={`flex items-center gap-3 border rounded-2xl px-3 py-3 active:scale-[0.98] cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
        listing.id === isHighlighted
          ? 'bg-primary/8 border-primary/30 ring-1 ring-primary/20'
          : 'bg-card border-border/15'
      }`}
    >
      {listing.images?.[0] ? (
        <img src={listing.images[0]} alt={listing.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
          <Briefcase className="w-6 h-6 text-blue-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground leading-snug line-clamp-1">{listing.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{listing.job_company || listing.poster_name}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {listing.location_city && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </span>
          )}
          {listing.job_type && (
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-semibold px-2 py-0.5 rounded-full capitalize">
              {listing.job_type}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />{timeAgo(listing.created_date)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {listing.price && (
          <span className="text-[13px] font-bold text-primary">
            ${listing.price.toLocaleString()}{listing.price_type === "hourly" ? "/hr" : ""}
          </span>
        )}
        <button onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          className="text-muted-foreground active:scale-90 transition-transform">
          <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>
    </motion.div>
  );
}

function CandidateCard({ disc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 bg-card border border-border/15 rounded-2xl px-3 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <img src={disc.author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
        alt={disc.author_name} className="w-12 h-12 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground">{disc.author_name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{disc.content}</p>
        {disc.city && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-1">
            <MapPin className="w-2.5 h-2.5" />{disc.city}
          </span>
        )}
      </div>
      <button className="shrink-0 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-full">
        View
      </button>
    </motion.div>
  );
}

export default function Jobs() {
  const navigate = useNavigate();
  const { getFilter, getViewMode, setViewMode, applyDiscovery, selectedListingId, setSelectedListingId } = useDiscovery();
  const activeFilter = getFilter('jobs');
  const viewMode = getViewMode('jobs');
  const [activeTab, setActiveTab] = useState("hiring");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "jobs"));

  useEffect(() => {
    base44.entities.Listing.filter({ category: "jobs", status: "active" }, "-created_date", 50)
      .then(data => { if (data?.length) setListings(data); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => applyDiscovery(listings, 'jobs'), [listings, applyDiscovery]);

  const candidates = MOCK_DISCUSSIONS.filter(d => ["Ride Share", "CDL", "Roommate"].includes(d.tag));

  return (
    <div className="min-h-dvh">
      <GlobalDiscoveryBar
        category="jobs"
        suggestions={SUGGESTIONS}
        showMapToggle
        isMapMode={viewMode === "map"}
        onMapToggle={() => setViewMode('jobs', viewMode === 'map' ? 'list' : 'map')}
      />
      <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      {viewMode === "map" ? (
        <GlobalMapDiscovery
          listings={filtered}
          onSelect={l => { navigate(`/listing/${l.id}`); }}
          onBackToList={() => setViewMode('jobs', 'list')}
        />
      ) : (
        <div className="px-4 py-4 space-y-2.5">
          {activeTab === "hiring" && (
            <>
              <SectionLabel>Jobs near you</SectionLabel>
              {filtered.length > 0
                ? filtered.map((l, i) => (
                    <JobCard
                      key={l.id}
                      listing={l}
                      index={i}
                      isHighlighted={selectedListingId === l.id}
                      onHighlight={setSelectedListingId}
                    />
                  ))
                : <EmptyState emoji="💼" title="No jobs found" subtitle="Try adjusting your filters" />
              }
            </>
          )}
          {activeTab === "looking" && (
            <>
              <SectionLabel>People looking for work</SectionLabel>
              {candidates.length > 0
                ? candidates.map((c, i) => <CandidateCard key={c.id} disc={c} index={i} />)
                : <EmptyState emoji="🙋" title="No candidates yet" subtitle="Community members will appear here" />
              }
            </>
          )}
        </div>
      )}
    </div>
  );
}