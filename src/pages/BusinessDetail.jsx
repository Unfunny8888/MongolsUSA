/**
 * BusinessDetail — mini local community page for a business.
 * Feels like a trusted local brand, not a directory entry.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Globe, Shield, Crown, Heart, Share2,
         MessageCircle, CheckCircle2, Users, Zap, Send, ChevronRight, Store } from "lucide-react";
import ContactMask from "../components/common/ContactMask";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MOCK_BUSINESSES, MOCK_LISTINGS } from "../lib/mockData";
import ReviewSection from "../components/common/ReviewSection";
import TranslateButton from "../components/common/TranslateButton";
import FeedItem from "../components/feed/FeedItem";
import ChildPageLayout from "../components/layout/ChildPageLayout";
import { base44 } from "@/api/base44Client";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Calm trust signal chips
function TrustSignal({ icon: Icon, label, color = "text-emerald-600", bg = "bg-emerald-50 dark:bg-emerald-950/30" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${bg} ${color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}

// Quick ask box — send message without leaving page
function QuickAsk({ business, user }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const CHIPS = ["Are you hiring?", "What are your hours?", "Do you offer consultations?", "How can I reach you?"];

  async function send(msg) {
    const content = (msg || text).trim();
    if (!content || sending || !user) return;
    setSending(true);
    const sellerEmail = business.email || business.created_by || "";
    const convId = [user.email, sellerEmail].sort().join("_") + "_" + business.id;
    await base44.entities.Message.create({
      conversation_id: convId,
      from_user: user.email,
      from_name: user.full_name,
      to_user: sellerEmail,
      to_name: business.name,
      content,
      is_read: false,
    });
    setSent(true);
    setSending(false);
    setTimeout(() => navigate(`/conversation/${encodeURIComponent(convId)}?other=${encodeURIComponent(business.name)}`), 400);
  }

  if (sent) return (
    <div className="flex items-center gap-2 py-2 text-sm font-semibold text-emerald-600">
      <CheckCircle2 className="w-4 h-4" /> Message sent!
    </div>
  );

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {CHIPS.map(c => (
          <button key={c} onClick={() => send(c)} disabled={sending}
            className="text-[11px] text-foreground/70 bg-secondary/60 rounded-full px-3 py-1.5 border border-border/20 active:bg-secondary transition-colors">
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2 border border-border/15">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask a question…"
          className="flex-1 bg-transparent text-[13px] outline-none min-h-[28px] placeholder:text-muted-foreground/50"
        />
        <button onClick={() => send()} disabled={!text.trim() || sending}
          className="text-primary disabled:opacity-30 shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function BusinessDetail() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      setIsLoggedIn(authed);
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
      let biz;
      if (!businessId.startsWith("biz-")) {
        biz = await base44.entities.Business.get(businessId);
        // load related listings
        base44.entities.Listing.filter({ status: "active" }, "-created_date", 6).then(data => {
          if (data?.length) setListings(data.slice(0, 4));
        });
      } else {
        biz = MOCK_BUSINESSES.find(b => b.id === businessId);
        setListings(MOCK_LISTINGS.filter(l => l.category === "services").slice(0, 4));
      }
      setBusiness(biz);
    }
    load();
  }, [businessId]);

  if (!business) {
    return (
      <ChildPageLayout className="flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </ChildPageLayout>
    );
  }

  // Build trust signals
  const trustSignals = [];
  if (business.is_verified)    trustSignals.push({ label: "Verified Business", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" });
  if (business.is_premium)     trustSignals.push({ label: "Premium Member", icon: Crown, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" });
  if (business.rating >= 4.5)  trustSignals.push({ label: "Highly Rated", icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" });
  if (business.review_count > 10) trustSignals.push({ label: "Community Trusted", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" });
  if (business.city)           trustSignals.push({ label: `Based in ${business.city}`, icon: MapPin, color: "text-muted-foreground", bg: "bg-secondary/60" });

  return (
    <ChildPageLayout>
      {/* Cover */}
      <div className="relative">
        {business.banner ? (
          <img src={business.banner} alt={business.name}
            className="w-full h-44 object-cover bg-secondary"
            onError={e => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-primary/10 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {business.is_premium && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Crown className="w-3 h-3" /> Premium
            </span>
          </div>
        )}
      </div>

      <div className="px-4 pb-10">
        {/* Identity row */}
        <div className="flex items-end gap-3 -mt-8 mb-3 relative z-10">
          {business.logo ? (
            <img src={business.logo} alt={business.name}
              className="w-16 h-16 rounded-2xl object-cover border-4 border-background shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border-4 border-background flex items-center justify-center shadow-md">
              <Store className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="flex-1 pb-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-[17px] font-bold text-foreground leading-tight">{business.name}</h1>
              {business.is_verified && <Shield className="w-4 h-4 text-primary fill-primary/20 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
              {business.category && <span className="capitalize">{business.category.replace("_", " ")}</span>}
              {business.city && <><span>·</span><span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{business.city}</span></>}
              {business.rating && (
                <><span>·</span><span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                  <Star className="w-3 h-3 fill-amber-500" />{business.rating} ({business.review_count || 0})
                </span></>
              )}
            </div>
          </div>
        </div>

        {/* Trust signals */}
        {trustSignals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {trustSignals.slice(0, 4).map((t, i) => <TrustSignal key={i} {...t} />)}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFollowed(f => !f)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
              followed ? "bg-primary text-white" : "bg-secondary text-foreground"
            }`}
          >
            <Heart className={`w-4 h-4 ${followed ? "fill-white" : ""}`} />
            {followed ? "Following" : "Follow"}
          </button>
          <button
            onClick={() => {
              if (!isLoggedIn) { base44.auth.redirectToLogin(); return; }
              navigate(`/inbox`);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold"
          >
            <MessageCircle className="w-4 h-4" /> Message
          </button>
          <button
            onClick={() => navigator.share?.({ title: business.name, url: window.location.href }).catch(() => {})}
            className="w-11 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        {business.description && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">About</p>
              <TranslateButton text={business.description} onTranslated={setTranslatedDesc} />
            </div>
            <p className="text-[13.5px] text-foreground/80 leading-relaxed">{translatedDesc || business.description}</p>
          </div>
        )}

        {/* Contact info */}
        <div className="mb-4 space-y-2">
          {business.hours && (
            <div className="flex items-center gap-2.5 py-2 border-b border-border/15">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-[13px] text-foreground/80">{business.hours}</span>
            </div>
          )}
          {business.website && (
            <a href={business.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-2 border-b border-border/15 active:opacity-70">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[13px] text-primary truncate">{business.website}</span>
            </a>
          )}
          {(business.phone || business.email || business.address) && (
            <div className="pt-1">
              <ContactMask phone={business.phone} email={business.email} address={business.address} isLoggedIn={isLoggedIn} />
            </div>
          )}
        </div>

        {/* Tags */}
        {business.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {business.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
            ))}
          </div>
        )}

        {/* Ask a question */}
        <div className="mb-5 pt-4 border-t border-border/15">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Send a Message</p>
          {isLoggedIn && user ? (
            <QuickAsk business={business} user={user} />
          ) : (
            <button onClick={() => base44.auth.redirectToLogin()}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Sign in to message
            </button>
          )}
        </div>

        {/* Active listings from this business */}
        {listings.length > 0 && (
          <div className="mb-5 pt-4 border-t border-border/15">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Posts</p>
              <button className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {listings.slice(0, 3).map((l, i) => (
                <FeedItem key={l.id} listing={l} variant="compact" />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {business.id && !business.id.startsWith("biz-") && (
          <div className="pt-4 border-t border-border/15">
            <ReviewSection businessId={business.id} />
          </div>
        )}
        {business.id?.startsWith("biz-") && (
          <div className="pt-4 border-t border-border/15">
            <p className="text-xs text-center text-muted-foreground">Reviews available for registered businesses</p>
          </div>
        )}
      </div>
    </ChildPageLayout>
  );
}