import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardStats from "../components/business/DashboardStats";
import LeadTracker from "../components/business/LeadTracker";
import CampaignManager from "../components/business/CampaignManager";
import ReviewManager from "../components/business/ReviewManager";

const TABS = ["Overview", "Leads", "Campaigns", "Reviews"];

function generateChartData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(d => ({ name: d, views: Math.floor(Math.random() * 80) + 20 }));
}

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);

      // Find business owned by this user
      const businesses = await base44.entities.Business.filter({ email: me.email });
      if (businesses.length > 0) {
        const biz = businesses[0];
        setBusiness(biz);
        const bizReviews = await base44.entities.Review.filter({ business_id: biz.id }, "-created_date", 50);
        setReviews(bizReviews);
      }

      const msgs = await base44.entities.Message.filter({ to_user: me.email }, "-created_date", 30);
      setMessages(msgs);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold mb-2">No Business Found</h2>
        <p className="text-sm text-muted-foreground mb-4">Create a business listing first to access the dashboard.</p>
        <button onClick={() => navigate("/businesses")} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
          Browse Businesses
        </button>
      </div>
    );
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const stats = {
    views: business.views || Math.floor(Math.random() * 500),
    leads: messages.filter(m => m.listing_title).length,
    messages: messages.length,
    reviews: avgRating,
    revenue: campaigns.reduce((s, c) => s + (c.budget || 0), 0),
    growth: Math.floor(Math.random() * 25) + 5,
  };

  const leads = messages.slice(0, 15).map((m, i) => ({
    id: m.id,
    name: m.from_name || "Unknown",
    email: m.from_user,
    phone: "",
    avatar: m.from_avatar,
    status: i < 3 ? "new" : i < 8 ? "contacted" : "converted",
    date: m.created_date,
  }));

  function handleCreateCampaign({ name, budget }) {
    setCampaigns(prev => [...prev, {
      id: `camp-${Date.now()}`,
      name,
      budget,
      status: "active",
      impressions: 0,
      clicks: 0,
    }]);
  }

  async function handleReply(reviewId, text) {
    if (!text.trim()) return;
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: text } : r));
  }

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Business Dashboard</h1>
            <p className="text-[10px] text-muted-foreground">{business.name}</p>
          </div>
          {business.logo && (
            <img src={business.logo} alt={business.name} className="w-9 h-9 rounded-xl object-cover border border-border/50" />
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {tab === "Overview" && (
          <DashboardStats stats={stats} chartData={generateChartData()} />
        )}
        {tab === "Leads" && (
          <LeadTracker leads={leads} />
        )}
        {tab === "Campaigns" && (
          <CampaignManager campaigns={campaigns} onCreateCampaign={handleCreateCampaign} />
        )}
        {tab === "Reviews" && (
          <ReviewManager reviews={reviews} onReply={handleReply} />
        )}
      </div>
    </div>
  );
}