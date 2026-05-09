/**
 * ServicesPage — businesses, freelancers, community recommended.
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Wrench, SlidersHorizontal, Heart, CheckCircle2, Users } from "lucide-react";
import { MOCK_LISTINGS, MOCK_BUSINESSES } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const SVC_FILTERS = ["All", "Home", "Auto", "Legal", "Cleaning", "Tax", "Beauty"];

function BusinessRow({ business, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/business/${business.id}`)}
      className="flex items-center gap-3 bg-card border border-border/20 rounded-2xl px-3 py-3 cursor-pointer active:scale-[0.99]"
    >
      {business.logo ? (
        <img src={business.logo} alt={business.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-amber-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13.5px] font-bold text-foreground leading-snug">{business.name}</p>
          {business.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
        </div>
        <p className="text-[11px] text-muted-foreground capitalize">{business.category?.replace("_", " ")}</p>
        <div className="flex items-center gap-2 mt-1">
          {business.rating && (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-600">
              <Star className="w-3 h-3 fill-amber-500" />{business.rating}
              <span className="text-muted-foreground font-normal">({business.review_count})</span>
            </span>
          )}
          {business.city && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />{business.city}
            </span>
          )}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
        className="shrink-0 text-muted-foreground">
        <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
      </button>
    </motion.div>
  );
}

function FreelancerCard({ listing, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex items-center gap-3 bg-card border border-border/20 rounded-2xl px-3 py-3 cursor-pointer"
    >
      <img src={listing.poster_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
        alt={listing.poster_name} className="w-12 h-12 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground">{listing.poster_name}</p>
        <p className="text-[11px] text-muted-foreground capitalize">{listing.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {listing.location_city && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{listing.location_city}</span>}
          {listing.rating && <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-500" />{listing.rating}</span>}
        </div>
      </div>
      <button className="shrink-0 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
        View
      </button>
    </motion.div>
  );
}

export default function ServicesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("businesses");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "services"));
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [location, setLocation] = useState("Chicago, IL");

  useEffect(() => {
    base44.entities.Business.list("-rating", 20).then(data => { if (data?.length) setBusinesses(data); });
    base44.entities.Listing.filter({ category: "services", status: "active" }, "-created_date", 30)
      .then(data => { if (data?.length) setListings(data); });
  }, []);

  const filteredBiz = useMemo(() => {
    if (activeFilter === "All") return businesses;
    return businesses.filter(b =>
      b.category?.toLowerCase().includes(activeFilter.toLowerCase()) ||
      b.tags?.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()))
    );
  }, [businesses, activeFilter]);

  return (
    <div className="min-h-dvh">
      {/* Location */}
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
        {SVC_FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              activeFilter === f ? "bg-foreground text-background" : "bg-secondary/60 text-muted-foreground"
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
        {[["businesses", "Businesses"], ["freelancers", "Freelancers"], ["recommended", "Recommended"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`py-3 mr-5 text-[13px] font-semibold border-b-2 transition-colors ${
              activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {activeTab === "businesses" && (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Top rated services</p>
            <div className="space-y-2.5">
              {filteredBiz.map((b, i) => <BusinessRow key={b.id} business={b} index={i} />)}
            </div>
          </>
        )}
        {activeTab === "freelancers" && (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Top freelancers</p>
            <div className="space-y-2.5">
              {listings.map((l, i) => <FreelancerCard key={l.id} listing={l} index={i} />)}
            </div>
          </>
        )}
        {activeTab === "recommended" && (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-medium">Community Recommendations</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}