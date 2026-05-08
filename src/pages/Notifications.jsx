import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, MessageSquare, Eye, Heart, Users, Star, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const TYPE_CONFIG = {
  message: { icon: MessageSquare, color: "bg-blue-100 text-blue-600" },
  listing_view: { icon: Eye, color: "bg-purple-100 text-purple-600" },
  listing_save: { icon: Heart, color: "bg-pink-100 text-pink-600" },
  group_join: { icon: Users, color: "bg-emerald-100 text-emerald-600" },
  review: { icon: Star, color: "bg-amber-100 text-amber-600" },
  system: { icon: Bell, color: "bg-gray-100 text-gray-600" },
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { setLoading(false); return; }
      const me = await base44.auth.me();
      setUser(me);
      const notifs = await base44.entities.Notification.filter({ user_email: me.email }, "-created_date", 30);
      setNotifications(notifs);
      setLoading(false);
    }
    load();
  }, []);

  async function markAllRead() {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Bell className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold mb-2">Sign in to view notifications</h2>
        <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-base font-bold flex-1">Notifications {unreadCount > 0 && `(${unreadCount})`}</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary font-semibold">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 px-6">
          <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-base font-semibold mb-1">No notifications yet</p>
          <p className="text-sm text-muted-foreground">You'll see activity on your listings and account here.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {notifications.map((notif, i) => {
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
                className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-smooth ${!notif.is_read ? "bg-primary/5" : "hover:bg-secondary/30"}`}
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