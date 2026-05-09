import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Eye, Heart, Users, Star, Search, Sparkles, MapPin, Zap, User } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import EmptyState from "../components/common/EmptyState";

const TYPE_CONFIG = {
  message: { icon: MessageSquare, color: "bg-blue-100 text-blue-600" },
  listing_view: { icon: Eye, color: "bg-purple-100 text-purple-600" },
  listing_save: { icon: Heart, color: "bg-pink-100 text-pink-600" },
  group_join: { icon: Users, color: "bg-emerald-100 text-emerald-600" },
  review: { icon: Star, color: "bg-amber-100 text-amber-600" },
  system: { icon: Bell, color: "bg-gray-100 text-gray-600" },
  saved_search: { icon: Search, color: "bg-violet-100 text-violet-600" },
  nearby_event: { icon: MapPin, color: "bg-orange-100 text-orange-600" },
  group_activity: { icon: Users, color: "bg-teal-100 text-teal-600" },
  ai_recommendation: { icon: Sparkles, color: "bg-pink-100 text-pink-600" },
  featured_listing: { icon: Zap, color: "bg-amber-100 text-amber-600" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { setLoading(false); return; }
      const me = await base44.auth.me();
      setUser(me);
      const notifs = await base44.entities.Notification.filter({ user_email: me.email }, "-created_date", 50);
      setNotifications(notifs);
      setLoading(false);

      // Real-time subscription
      const unsub = base44.entities.Notification.subscribe((event) => {
        if (event.data?.user_email !== me.email) return;
        if (event.type === "create") {
          setNotifications(prev => [event.data, ...prev]);
          // Browser push notification
          if (Notification?.permission === "granted") {
            new Notification(event.data.title, { body: event.data.body, icon: "/favicon.ico" });
          }
        } else if (event.type === "update") {
          setNotifications(prev => prev.map(n => n.id === event.id ? { ...n, ...event.data } : n));
        }
      });
      return unsub;
    }
    const cleanup = load();
    return () => { cleanup?.then?.(fn => fn?.())?.catch?.(() => {}); };
  }, []);

  async function requestPushPermission() {
    if (!('Notification' in window)) return;
    await Notification.requestPermission();
  }

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);
  const FILTERS = [
    { id: "all", label: "All" },
    { id: "message", label: "Messages" },
    { id: "saved_search", label: "Matches" },
    { id: "nearby_event", label: "Events" },
    { id: "ai_recommendation", label: "AI" },
  ];
  const filtered = useMemo(() => filter === "all" ? notifications : notifications.filter(n => n.type === filter), [filter, notifications]);

  if (!user && !loading) {
    return (
      <EmptyState
        icon={User}
        title="Sign in for notifications"
        description="Stay updated on your listings, messages, and community activity."
        action={{ label: "Sign In", onClick: () => base44.auth.redirectToLogin() }}
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <div className="min-h-dvh">

      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth ${filter === f.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
            {f.label}
          </button>
        ))}
        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
          <button onClick={requestPushPermission}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Bell className="w-3 h-3" /> Enable Push
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="You'll see activity on your listings, messages, and account here."
          className="min-h-[50vh]"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing here"
          description="No notifications in this category yet."
          secondaryAction={{ label: "Show all", onClick: () => setFilter("all") }}
          className="min-h-[40vh]"
        />
      ) : (
        <div className="divide-y divide-border/30">
          {filtered.map((notif, i) => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <motion.button
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  base44.entities.Notification.update(notif.id, { is_read: true });
                  if (notif.link) navigate(notif.link);
                }}
                className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-smooth ${!notif.is_read ? "bg-primary/5" : "hover:bg-secondary/30"} ${notif.priority === "high" ? "border-l-2 border-primary" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${!notif.is_read ? "font-bold" : "font-semibold"}`}>{notif.title}</p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(notif.created_date)}</p>
                  </div>
                  {notif.body && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>}
                </div>
                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}