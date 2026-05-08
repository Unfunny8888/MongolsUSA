import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronRight, Crown, Shield, Heart, Eye, Bell, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReputationBadge from "../components/common/ReputationBadge";
import TrustCard from "../components/common/TrustCard";
import ReputationBreakdown from "../components/common/ReputationBreakdown";
import { base44 } from "@/api/base44Client";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repBreakdown, setRepBreakdown] = useState(null);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      setIsLoggedIn(authed);
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        // Refresh reputation score in background
        base44.functions.invoke('calculateReputation', {}).then(res => {
          if (res?.data?.breakdown) setRepBreakdown(res.data.breakdown);
          if (res?.data?.trust_score !== undefined) setUser(u => ({ ...u, trust_score: res.data.trust_score, reputation_rank: res.data.rank, reputation_score: res.data.trust_score }));
        }).catch(() => {});
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-primary/20"
        >
          <span className="text-4xl">🐎</span>
        </motion.div>
        <h1 className="text-2xl font-extrabold mb-2">Welcome to NomadLink</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
          Join the largest Mongolian community marketplace in the USA.
        </p>
        <Button
          onClick={() => base44.auth.redirectToLogin()}
          className="rounded-xl bg-primary text-white px-10 py-6 text-base font-bold hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          Get Started
        </Button>
        <p className="text-xs text-muted-foreground mt-4">Free to join • Browse as guest</p>
      </div>
    );
  }

  const menuItems = [
    { icon: Heart, label: "Saved Listings", link: "/saved" },
    { icon: Eye, label: "My Listings", link: "/my-listings" },
    { icon: MessageSquare, label: "Messages", link: "/inbox" },
    { icon: Bell, label: "Notifications", link: "/notifications" },
    { icon: Crown, label: "Upgrade to VIP", highlight: true, link: "/vip" },
    ...(user?.role === "admin" ? [{ icon: Shield, label: "Admin Dashboard", link: "/admin" }] : []),
    ...(user?.role === "business_owner" || user?.verified_business ? [{ icon: Eye, label: "Business Dashboard", link: "/business-dashboard" }] : []),
    { icon: Settings, label: "Edit Profile", link: "/edit-profile" },
  ];

  return (
    <div className="min-h-dvh pb-24">
      <div className="bg-gradient-to-br from-primary/90 to-emerald-600/80 px-4 pt-5 pb-6 relative overflow-hidden" style={{ paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/3 rounded-full -translate-y-6 translate-x-6 blur-xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/3 rounded-full translate-y-4 -translate-x-4 blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl shadow-lg overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
              ) : "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-white truncate">{user.full_name || "Nomad User"}</h1>
                {user.is_verified && <Shield className="w-3.5 h-3.5 text-blue-300 fill-blue-300 flex-shrink-0" />}
              </div>
              <p className="text-xs text-emerald-100 truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <ReputationBadge
              rank={user.reputation_rank || "bronze"}
              tier={user.membership_tier || "free"}
              score={user.reputation_score || 0}
            />
          </div>
        </div>
      </div>

      <div className="px-4 mt-2 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 border border-white/20 shadow-sm"
        >
          <div className="grid grid-cols-3 gap-0 divide-x divide-white/10">
            {[
              { label: "Listings", value: user.listing_count || 0 },
              { label: "Reputation", value: user.reputation_score || 0 },
              { label: "Groups", value: user.joined_groups?.length || 0 },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center py-4 px-2">
                <p className="text-2xl font-extrabold text-primary leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-4 mt-4 mb-6 space-y-3">
        <ReputationBreakdown user={user} breakdown={repBreakdown} />
        <TrustCard user={user} />
      </div>

      <div className="px-4 mt-6 space-y-1">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => item.link && navigate(item.link)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-smooth ${
              item.highlight
                ? "bg-gradient-to-r from-amber-100/40 to-orange-100/40 border border-amber-200/60 hover:from-amber-100/60 hover:to-orange-100/60"
                : "bg-secondary/30 border border-border/30 hover:bg-secondary/50"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              item.highlight ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm" : "bg-secondary/60"
            }`}>
              <item.icon className={`w-4 h-4 ${item.highlight ? "text-white" : "text-foreground"}`} />
            </div>
            <span className={`text-sm font-medium flex-1 text-left ${item.highlight ? "text-amber-800" : ""}`}>
              {item.label}
            </span>
            {item.count !== undefined && (
              <Badge variant="secondary" className="text-[10px]">{item.count}</Badge>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      <div className="px-4 mt-8 mb-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <Button
          variant="ghost"
          onClick={() => base44.auth.logout()}
          className="w-full rounded-xl text-destructive hover:bg-destructive/10 gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}