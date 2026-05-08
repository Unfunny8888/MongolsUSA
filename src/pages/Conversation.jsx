import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function Conversation() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const otherName = urlParams.get("other") || "User";
  const listingTitle = urlParams.get("listing") || "";
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const msgs = await base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100);
      setMessages(msgs);
      // Mark received as read
      msgs.filter(m => m.to_user === me.email && !m.is_read).forEach(m => {
        base44.entities.Message.update(m.id, { is_read: true });
      });
    }
    load();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim() || !user) return;
    setSending(true);
    const toUser = messages.find(m => m.from_user !== user.email)?.from_user ||
                   messages.find(m => m.to_user !== user.email)?.to_user || "";
    const newMsg = await base44.entities.Message.create({
      conversation_id: conversationId,
      from_user: user.email,
      from_name: user.full_name,
      to_user: toUser,
      to_name: otherName,
      content: text.trim(),
      listing_title: listingTitle,
      is_read: false,
    });
    setMessages(prev => [...prev, newMsg]);
    setText("");
    setSending(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <p className="text-sm font-bold">{otherName}</p>
          {listingTitle && <p className="text-[10px] text-primary">Re: {listingTitle}</p>}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 pb-24 overflow-y-auto">
        {messages.map((msg, i) => {
          const isMe = msg.from_user === user?.email;
          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMe
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-card border border-border/50 rounded-bl-sm"
              }`}>
                {msg.content}
                <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                  {msg.created_date ? new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </p>
              </div>
            </motion.div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Start the conversation! Say hello 👋</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 px-4 py-3 flex gap-3 items-center pb-[env(safe-area-inset-bottom)]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Type a message..."
          className="flex-1 bg-secondary/70 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}