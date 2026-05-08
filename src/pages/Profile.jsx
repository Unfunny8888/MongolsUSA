import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronRight, Crown, Heart, Eye, Bell, MessageSquare, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PremiumProfileHeader from "../components/profile/PremiumProfileHeader";
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
      <PremiumProfileHeader user={user} />

      <div className="px-4 mt-0 mb-5 space-y-2.5">
        <ReputationBreakdown user={user} breakdown={repBreakdown} />
        <TrustCard user={user} />
      </div>

      <div className="px-4 mt-5 space-y-1">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => item.link && navigate(item.link)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-smooth ${
              item.highlight
                ? "bg-gradient-to-r from-amber-100/50 to-orange-100/50 border border-amber-200/70 hover:from-amber-100/70 hover:to-orange-100/70 shadow-sm"
                : "bg-secondary/35 border border-border/40 hover:bg-secondary/55"
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