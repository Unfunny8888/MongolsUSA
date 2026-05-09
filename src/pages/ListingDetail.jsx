import { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Eye, Shield, Car, Fuel, Gauge, Calendar, Building2, DollarSign, Bed, Bath, Home, MessageCircle, Zap, ImageOff, CheckCircle2, AlertCircle, Send, Heart, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import ChildPageLayout from "../components/layout/ChildPageLayout";
import ContactMask from "../components/common/ContactMask";
import TranslateButton from "../components/common/TranslateButton";
import BoostModal from "../components/common/BoostModal";
import SaveButton from "../components/common/SaveButton";
import ShareButton from "../components/common/ShareButton";
import EventRSVPButton from "../components/common/EventRSVPButton";
import { MOCK_LISTINGS } from "../lib/mockData";
import SpamFlagButton from "../components/common/SpamFlagButton";
import { base44 } from "@/api/base44Client";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CarDetails = memo(function CarDetails({ listing }) {
  const details = [
    { icon: Calendar, label: "Year", value: listing.car_year },
    { icon: Gauge, label: "Mileage", value: listing.car_mileage ? `${listing.car_mileage.toLocaleString()} mi` : null },
    { icon: Car, label: "Transmission", value: listing.car_transmission },
    { icon: Fuel, label: "Fuel", value: listing.car_fuel },
    { icon: Shield, label: "Condition", value: listing.car_condition },
  ].filter(d => d.value);
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {details.map((d, i) => (
        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50">
          <d.icon className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">{d.label}</p>
            <p className="text-xs font-semibold capitalize">{d.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

const JobDetails = memo(function JobDetails({ listing }) {
  const details = [
    { icon: Building2, label: "Company", value: listing.job_company },
    { icon: DollarSign, label: "Salary", value: listing.job_salary_min && listing.job_salary_max ? `$${listing.job_salary_min.toLocaleString()} - $${listing.job_salary_max.toLocaleString()}` : null },
    { icon: Clock, label: "Type", value: listing.job_type },
    { icon: Calendar, label: "Schedule", value: listing.job_schedule },
  ].filter(d => d.value);
  return (
    <div className="space-y-2.5">
      {details.map((d, i) => (
        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50">
          <d.icon className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">{d.label}</p>
            <p className="text-xs font-semibold capitalize">{d.value}</p>
          </div>
        </div>
      ))}
      {listing.job_benefits && (
        <div className="p-3 rounded-xl bg-secondary/50 border border-border/40">
          <p className="text-[10px] text-primary font-semibold mb-1">Benefits</p>
          <p className="text-xs text-foreground">{listing.job_benefits}</p>
        </div>
      )}
    </div>
  );
});

const HousingDetails = memo(function HousingDetails({ listing }) {
  const details = [
    { icon: Bed, label: "Bedrooms", value: listing.housing_bedrooms },
    { icon: Bath, label: "Bathrooms", value: listing.housing_bathrooms },
    { icon: Home, label: "Type", value: listing.housing_type },
    { icon: Calendar, label: "Lease", value: listing.housing_lease },
  ].filter(d => d.value);
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {details.map((d, i) => (
        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50">
          <d.icon className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">{d.label}</p>
            <p className="text-xs font-semibold capitalize">{String(d.value)}</p>
          </div>
        </div>
      ))}
      {listing.housing_utilities && (
        <div className="col-span-2 p-3 rounded-xl bg-secondary/50 border border-border/40">
          <p className="text-[10px] text-primary font-semibold">Utilities: {listing.housing_utilities}</p>
        </div>
      )}
    </div>
  );
});

const EventDetails = memo(function EventDetails({ listing }) {
  return (
    <div className="space-y-2.5">
      {listing.event_date && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/40">
          <Calendar className="w-5 h-5 text-pink-600" />
          <div>
            <p className="text-[10px] text-primary font-semibold">Event Date</p>
            <p className="text-sm font-bold text-foreground">{new Date(listing.event_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
          </div>
        </div>
      )}
      {listing.event_venue && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50">
          <MapPin className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">Venue</p>
            <p className="text-xs font-semibold">{listing.event_venue}</p>
          </div>
        </div>
      )}
      {listing.event_organizer && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50">
          <Building2 className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">Organizer</p>
            <p className="text-xs font-semibold">{listing.event_organizer}</p>
          </div>
        </div>
      )}
    </div>
  );
});

// Status badge config
const STATUS_CONFIG = {
  active:   { label: "Available",  color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40" },
  pending:  { label: "Pending",     color: "text-amber-700  bg-amber-50  border-amber-200  dark:bg-amber-950/40"  },
  sold:     { label: "Sold",        color: "text-rose-700   bg-rose-50   border-rose-200   dark:bg-rose-950/40"   },
  expired:  { label: "Closed",      color: "text-slate-500  bg-slate-100 border-slate-200  dark:bg-slate-800/40"  },
  flagged:  { label: "Under Review",color: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {status === "active" && <CheckCircle2 className="w-3 h-3" />}
      {(status === "sold" || status === "expired") && <AlertCircle className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

// Inline quick-ask panel with chips + text
function InlineContactPanel({ listing, user }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const CHIPS = listing.category === "jobs"
    ? ["Is this position still open?", "Can I apply?", "What are the hours?"]
    : listing.category === "housing"
    ? ["Is this still available?", "Can I schedule a viewing?", "Is the price negotiable?"]
    : listing.category === "cars"
    ? ["Is this still available?", "Can we meet to see it?", "Is the price negotiable?"]
    : ["Is this still available?", "Can we meet this week?", "Is the price negotiable?"];

  async function send(msg) {
    const content = (msg || text).trim();
    if (!content || sending || !user) return;
    setSending(true);
    const sellerEmail = listing.contact_email || listing.created_by || "";
    const convId = [user.email, sellerEmail].sort().join("_") + "_" + listing.id;
    await base44.entities.Message.create({
      conversation_id: convId,
      from_user: user.email,
      from_name: user.full_name,
      to_user: sellerEmail,
      to_name: listing.poster_name || "Seller",
      content,
      listing_id: listing.id,
      listing_title: listing.title,
      is_read: false,
    });
    setSending(false);
    setSent(true);
    setTimeout(() => {
      navigate(`/conversation/${encodeURIComponent(convId)}?other=${encodeURIComponent(listing.poster_name || "Seller")}&listing=${encodeURIComponent(listing.title)}`);
    }, 400);
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm font-semibold text-emerald-600">
        <CheckCircle2 className="w-4 h-4" /> Message sent! Opening conversation…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(c => (
          <button key={c} disabled={sending} onClick={() => send(c)}
            className="text-[12px] font-medium text-foreground/75 bg-secondary/60 rounded-full px-3 py-1.5 border border-border/25 active:bg-secondary transition-colors">
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2 border border-border/20">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask the seller something…"
          className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none min-h-[28px]"
        />
        <button onClick={() => send()} disabled={!text.trim() || sending}
          className="text-primary font-semibold text-[12px] shrink-0 disabled:opacity-30">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState(null);
  const [showBoost, setShowBoost] = useState(false);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      setIsLoggedIn(authed);
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
      if (!listingId.startsWith("mock-")) {
        const data = await base44.entities.Listing.get(listingId);
        setListing(data);
        return;
      }
      setListing(MOCK_LISTINGS.find((l) => l.id === listingId));
    }
    load();
  }, [listingId]);

  function formatPrice() {
    if (!listing) return "";
    if (listing.price_type === "free") return "Free";
    if (!listing.price) return "Contact for price";
    const p = `$${listing.price.toLocaleString()}`;
    if (listing.price_type === "hourly") return `${p}/hr`;
    if (listing.price_type === "monthly") return `${p}/mo`;
    if (listing.price_type === "weekly") return `${p}/wk`;
    return p;
  }

  if (!listing) {
    return (
      <ChildPageLayout className="flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </ChildPageLayout>
    );
  }

  return (
    <ChildPageLayout>
      <div className="relative">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full aspect-[4/3] object-cover bg-secondary"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        {(!listing.images?.[0]) && (
          <div className="w-full aspect-[4/3] bg-secondary flex items-center justify-center">
            <ImageOff className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <div style={{ display: 'none' }} className="w-full aspect-[4/3] bg-secondary flex items-center justify-center">
          <ImageOff className="w-12 h-12 text-muted-foreground/30" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute top-4 right-4 flex gap-2">
          <ShareButton title={listing.title} className="w-10 h-10 rounded-xl glass flex items-center justify-center" />
          <SaveButton listing={listing} className="w-10 h-10 rounded-xl glass flex items-center justify-center" />
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-xl border border-border/50"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xl font-extrabold text-primary">{formatPrice()}</p>
              <StatusBadge status={listing.status || "active"} />
            </div>
            <h1 className="text-lg font-bold text-foreground mt-1 leading-tight">{listing.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {listing.location_city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.location_city}, {listing.location_state}
                </span>
              )}
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {listing.views} views</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(listing.created_date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-secondary/50">
            <img
              src={listing.poster_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
              alt={listing.poster_name}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">{listing.poster_name || "Anonymous"}</p>
              <p className="text-[10px] text-muted-foreground">Posted {timeAgo(listing.created_date)}</p>
            </div>
          </div>

          {listing.category === "cars" && <CarDetails listing={listing} />}
          {listing.category === "jobs" && <JobDetails listing={listing} />}
          {listing.category === "housing" && <HousingDetails listing={listing} />}
          {listing.category === "events" && <EventDetails listing={listing} />}
          {listing.category === "events" && <EventRSVPButton eventId={listing.id} eventTitle={listing.title} />}

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Description</h3>
              {listing.description && (
                <TranslateButton text={listing.description} onTranslated={setTranslatedDesc} />
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {translatedDesc || listing.description}
            </p>
          </div>

          {listing.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {listing.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-border">
            <h3 className="text-sm font-bold mb-3">Contact Information</h3>
            <ContactMask
              phone={listing.contact_phone}
              email={listing.contact_email}
              telegram={listing.contact_telegram}
              whatsapp={listing.contact_whatsapp}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* Marketplace actions — contact seller */}
          {listing.status !== "sold" && listing.status !== "expired" && (
            <div className="mt-5 pt-5 border-t border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold">Contact Seller</h3>
              </div>
              {isLoggedIn && user && listing.created_by !== user?.email ? (
                <InlineContactPanel listing={listing} user={user} />
              ) : !isLoggedIn ? (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Sign in to contact seller
                </button>
              ) : null}
            </div>
          )}

          {isLoggedIn && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <SpamFlagButton listingId={listing.id} />
            </div>
          )}

          {isLoggedIn && user?.email === listing.created_by && (
            <button
              onClick={() => setShowBoost(true)}
              className="mt-3 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Boost This Listing
            </button>
          )}
        </motion.div>
      </div>

      {showBoost && (
        <BoostModal
          listingId={listing.id}
          listingTitle={listing.title}
          onClose={() => setShowBoost(false)}
        />
      )}
    </ChildPageLayout>
  );
}