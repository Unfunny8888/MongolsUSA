import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, User, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import EmptyState from "../components/common/EmptyState";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function Inbox() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { setLoading(false); return; }
      const me = await base44.auth.me();
      setUser(me);
      // Get all messages involving this user and group by conversation
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ from_user: me.email }, "-created_date", 50),
        base44.entities.Message.filter({ to_user: me.email }, "-created_date", 50),
      ]);
      const all = [...sent, ...received];
      // Group by conversation_id, take latest
      const convMap = {};
      all.forEach((msg) => {
        if (!convMap[msg.conversation_id] || new Date(msg.created_date) > new Date(convMap[msg.conversation_id].created_date)) {
          convMap[msg.conversation_id] = msg;
        }
      });
      setConversations(Object.values(convMap).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      setLoading(false);
    }
    load();
  }, []);

  if (!user) {
    return (
      <EmptyState
        icon={User}
        title="Sign in to view messages"
        description="Connect with buyers and sellers in the community."
        action={{ label: "Sign In", onClick: () => base44.auth.redirectToLogin() }}
        className="min-h-[60vh]"
      />
    );
  }

  const unreadCount = conversations.filter(c => !c.is_read && c.to_user === user?.email).length;

  return (
    <div className="min-h-dvh">
      {unreadCount > 0 && (
        <div className="mx-4 mt-3 mb-1 px-3 py-2 bg-primary/8 rounded-xl flex items-center gap-2">
          <Circle className="w-2 h-2 text-primary fill-primary shrink-0" />
          <p className="text-[12px] font-semibold text-primary">{unreadCount} unread {unreadCount === 1 ? "message" : "messages"}</p>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="When you contact a seller or receive a message, it will appear here."
          action={{ label: "Browse Listings", onClick: () => navigate("/explore") }}
          className="min-h-[60vh]"
        />
      ) : (
        <div className="divide-y divide-border/50">
          {conversations.map((conv, i) => {
            const isFromMe = conv.from_user === user.email;
            const otherName = isFromMe ? conv.to_name : conv.from_name;
            const otherAvatar = isFromMe ? null : conv.from_avatar;
            const unread = !conv.is_read && !isFromMe;
            return (
              <motion.button
                key={conv.conversation_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/conversation/${conv.conversation_id}?other=${otherName}&listing=${conv.listing_title || ""}`)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/30 transition-smooth text-left"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl overflow-hidden">
                    {otherAvatar ? <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" /> : "👤"}
                  </div>
                  {unread && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${unread ? "font-bold" : "font-semibold"}`}>{otherName || "User"}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(conv.created_date)}</p>
                  </div>
                  {conv.listing_title && <p className="text-[10px] text-primary font-medium truncate">Re: {conv.listing_title}</p>}
                  <p className={`text-xs truncate mt-0.5 ${unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {isFromMe ? "You: " : ""}{conv.content}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}