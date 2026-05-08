import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Image, Check, CheckCheck, Loader2 } from "lucide-react";
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
  const [otherTyping, setOtherTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const typingTimerRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const msgs = await base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100);
      setMessages(msgs);
      msgs.filter(m => m.to_user === me.email && !m.is_read).forEach(m => {
        base44.entities.Message.update(m.id, { is_read: true });
      });
    }
    load();

    // Real-time subscription
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversationId) return;
      if (event.type === "create") {
        setMessages(prev => {
          if (prev.find(m => m.id === event.id)) return prev;
          // Show typing indicator briefly before new message appears
          setOtherTyping(true);
          setTimeout(() => setOtherTyping(false), 800);
          return [...prev, event.data];
        });
        if (event.data.to_user) {
          base44.entities.Message.update(event.id, { is_read: true }).catch(() => {});
        }
      } else if (event.type === "update") {
        setMessages(prev => prev.map(m => m.id === event.id ? { ...m, ...event.data } : m));
      }
    });

    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherUser = useCallback(() => {
    return messages.find(m => m.from_user !== user?.email)?.from_user ||
           messages.find(m => m.to_user !== user?.email)?.to_user || "";
  }, [messages, user]);

  async function send() {
    if (!text.trim() || !user) return;
    setSending(true);
    const newMsg = await base44.entities.Message.create({
      conversation_id: conversationId,
      from_user: user.email,
      from_name: user.full_name,
      to_user: getOtherUser(),
      to_name: otherName,
      content: text.trim(),
      listing_title: listingTitle,
      is_read: false,
    });
    setMessages(prev => [...prev, newMsg]);
    setText("");
    setSending(false);
  }

  async function sendImage(file) {
    if (!file || !user) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Message.create({
      conversation_id: conversationId,
      from_user: user.email,
      from_name: user.full_name,
      to_user: getOtherUser(),
      to_name: otherName,
      content: "",
      image_url: file_url,
      listing_title: listingTitle,
      is_read: false,
    });
    setUploadingImage(false);
  }

  function handleTyping(val) {
    setText(val);
    // Show "typing" hint would need backend; we simulate locally
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <p className="text-sm font-bold">{otherName}</p>
          {listingTitle && <p className="text-[10px] text-primary">Re: {listingTitle}</p>}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 pb-4 overflow-y-auto overscroll-contain">
        {messages.map((msg, i) => {
          const isMe = msg.from_user === user?.email;
          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] rounded-2xl overflow-hidden text-sm leading-relaxed ${
                isMe
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-card border border-border/50 rounded-bl-sm"
              }`}>
                {msg.image_url ? (
                  <img src={msg.image_url} alt="Shared image" className="max-w-full rounded-2xl" />
                ) : (
                  <div className="px-4 py-2.5">{msg.content}</div>
                )}
                <div className={`flex items-center gap-1 px-4 pb-2 ${isMe ? "justify-end" : ""}`}>
                  <p className={`text-[10px] ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                    {msg.created_date ? new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                  {isMe && (
                    msg.is_read
                      ? <CheckCheck className="w-3 h-3 text-white/80" />
                      : <Check className="w-3 h-3 text-white/50" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {otherTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Start the conversation! Say hello 👋</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && sendImage(e.target.files[0])} />
      <div className="glass border-t border-border/30 px-4 py-3 flex gap-2 items-center pb-[env(safe-area-inset-bottom)] shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center shrink-0"
        >
          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
        </button>
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Type a message..."
          className="flex-1 bg-secondary/70 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}