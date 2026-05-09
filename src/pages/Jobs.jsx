/**
 * Jobs — dedicated hiring + job seekers ecosystem.
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, ChevronRight, Heart, Clock, SlidersHorizontal, Eye } from "lucide-react";
import { MOCK_LISTINGS, MOCK_BUSINESSES, MOCK_DISCUSSIONS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const JOB_FILTERS = ["All", "Full-time", "Part-time", "Remote", "CDL", "Restaurant", "Office"];

function timeAgo(d) {
  if (!d) return "";
  const h = Math.floor((Date.now() - new Date(d)) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function JobCard({ listing, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex items-center gap-3 bg-card border border-border/20 rounded-2xl px-3 py-3 active:scale-[0.99] cursor-pointer"
    >
      {listing.images?.[0] ? (
        <img src={listing.images[0]} alt={listing.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
          <Briefcase className="w-6 h-6 text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold text-foreground leading-snug line-clamp-1">{listing.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{listing.job_company || listing.poster_name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {listing.location_city && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </span>
          )}
          {listing.job_type && (
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-medium px-2 py-0.5 rounded-full capitalize">
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
            ${listing.price.toLocaleString()}{listing.price_type === "hourly" ? "/hr" : listing.price_type === "weekly" ? "/wk" : ""}
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

// Candidate card for "Looking for Work" tab
function CandidateCard({ disc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 bg-card border border-border/20 rounded-2xl px-3 py-3"
    >
      <img src={disc.author_avatar} alt={disc.author_name}
        className="w-12 h-12 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground">{disc.author_name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{disc.content}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {disc.city && <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" />{disc.city}</span>}
        </div>
      </div>
      <button className="shrink-0 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
        View
      </button>
    </motion.div>
  );
}

export default function Jobs() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("hiring");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "jobs"));
  const [location, setLocation] = useState("Chicago, IL");

  useEffect(() => {
    base44.entities.Listing.filter({ category: "jobs", status: "active" }, "-created_date", 50)
      .then(data => { if (data?.length) setListings(data); });
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return listings;
    const map = { "Full-time": "full-time", "Part-time": "part-time", "Remote": "remote", "CDL": "cdl", "Restaurant": "restaurant", "Office": "office" };
    const key = map[activeFilter];
    return listings.filter(l =>
      l.job_type === key ||
      l.tags?.some(t => t.toLowerCase().includes(key)) ||
      l.title.toLowerCase().includes(key) ||
      l.description?.toLowerCase().includes(key)
    );
  }, [listings, activeFilter]);

  // Candidates from discussions (mock)
  const candidates = MOCK_DISCUSSIONS.filter(d => ["Ride Share", "CDL", "Roommate"].includes(d.tag));

  return (
    <div className="min-h-dvh">
      {/* Location bar */}
      <div className="px-4 py-2.5 border-b border-border/15">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium">Location</p>
            <p className="text-[13px] font-bold text-foreground">{location}</p>
          </div>
          <button className="text-[12px] font-semibold text-primary">Change</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5 border-b border-border/10">
        {JOB_FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              activeFilter === f
                ? "bg-foreground text-background"
                : "bg-secondary/60 text-muted-foreground"
            }`}>
            {f}
          </button>
        ))}
        <button className="shrink-0 w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-border/20 px-4">
        {[["hiring", "Hiring (Jobs)"], ["looking", "Looking for Work"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`py-3 mr-5 text-[13px] font-semibold border-b-2 transition-colors ${
              activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-2.5">
        {activeTab === "hiring" ? (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Jobs near you</p>
            {filtered.map((l, i) => <JobCard key={l.id} listing={l} index={i} />)}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">💼</p>
                <p className="text-sm text-muted-foreground">No jobs found</p>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Candidates looking for work</p>
            {candidates.map((c, i) => <CandidateCard key={c.id} disc={c} index={i} />)}
          </>
        )}
      </div>
    </div>
  );
}