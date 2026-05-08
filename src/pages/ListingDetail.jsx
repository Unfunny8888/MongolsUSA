import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Eye, Shield, Car, Fuel, Gauge, Calendar, Building2, DollarSign, Bed, Bath, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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

function CarDetails({ listing }) {
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
}

function JobDetails({ listing }) {
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
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-[10px] text-emerald-700 font-semibold mb-1">Benefits</p>
          <p className="text-xs text-emerald-800">{listing.job_benefits}</p>
        </div>
      )}
    </div>
  );
}

function HousingDetails({ listing }) {
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
        <div className="col-span-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-[10px] text-blue-700 font-semibold">Utilities: {listing.housing_utilities}</p>
        </div>
      )}
    </div>
  );
}

function EventDetails({ listing }) {
  return (
    <div className="space-y-2.5">
      {listing.event_date && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pink-50 border border-pink-100">
          <Calendar className="w-5 h-5 text-pink-600" />
          <div>
            <p className="text-[10px] text-pink-600 font-semibold">Event Date</p>
            <p className="text-sm font-bold text-pink-800">{new Date(listing.event_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
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
}

export default function ListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [saved, setSaved] = useState(false);
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

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const formatPrice = () => {
    if (listing.price_type === "free") return "Free";
    if (!listing.price) return "Contact for price";
    const p = `$${listing.price.toLocaleString()}`;
    if (listing.price_type === "hourly") return `${p}/hr`;
    if (listing.price_type === "monthly") return `${p}/mo`;
    if (listing.price_type === "weekly") return `${p}/wk`;
    return p;
  };

  return (
    <div className="min-h-dvh pb-24">
      <div className="relative">
        <img
          src={listing.images?.[0] || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800"}
          alt={listing.title}
          className="w-full aspect-[4/3] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <ShareButton title={listing.title} className="w-10 h-10 rounded-xl glass flex items-center justify-center" />
            <SaveButton listing={listing} className="w-10 h-10 rounded-xl glass flex items-center justify-center" />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-xl border border-border/50"
        >
          <div className="mb-4">
            <p className="text-2xl font-extrabold text-primary">{formatPrice()}</p>
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

          {isLoggedIn && listing.created_by && listing.created_by !== user?.email && (
            <button
              onClick={() => {
                const convId = [user.email, listing.created_by].sort().join("_") + "_" + listing.id;
                navigate(`/conversation/${convId}?other=${listing.poster_name || "Seller"}&listing=${encodeURIComponent(listing.title)}`);
              }}
              className="mt-4 w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition-smooth"
            >
              💬 Message Seller
            </button>
          )}

          {isLoggedIn && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <SpamFlagButton listingId={listing.id} />
            </div>
          )}

          {isLoggedIn && user?.email === listing.created_by && (
            <button
              onClick={() => setShowBoost(true)}
              className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg"
            >
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
    </div>
  );
}