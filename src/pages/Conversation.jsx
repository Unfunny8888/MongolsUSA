import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import { Send, Image, Check, CheckCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import TranslateButton from "../components/common/TranslateButton";
import { base44 } from "@/api/base44Client";

const MsgBubble = memo(function MsgBubble({ msg, isMe }) {
  const [translated, setTranslated] = useState(null);
  return (
    <div className={`max-w-[75%] rounded-2xl overflow-hidden text-sm leading-relaxed ${
      isMe ? "bg-primary text-white rounded-br-sm" : "bg-card border border-border/50 rounded-bl-sm"
    }`}>
      {msg.image_url ? (
        <img
          src={msg.image_url}
          alt="Shared image"
          className="max-w-full rounded-2xl"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="px-4 pt-2.5 pb-1">{translated || msg.content}</div>
      )}
      <div className={`flex items-center gap-2 px-4 pb-2 ${isMe ? "justify-end" : "justify-between"}`}>
        {!isMe && msg.content && (
          <TranslateButton text={msg.content} onTranslated={setTranslated} />
        )}
        <div className="flex items-center gap-1 ml-auto">
          <p className={`text-[10px] ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
            {msg.created_date ? new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
          </p>
          {isMe && (msg.is_read ? <CheckCheck className="w-3 h-3 text-white/80" /> : <Check className="w-3 h-3 text-white/50" />)}
        </div>
      </div>
    </div>
  );
});

export default function Conversation() {
  const { conversationId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const otherName = urlParams.get("other") || "User";
  const listingTitle = urlParams.get("listing") || "";
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversationId) return;
      if (event.type === "create") {
        setMessages(prev => {
          if (prev.find(m => m.id === event.id)) return prev;
          setOtherTyping(true);
          setTimeout(() => setOtherTyping(false), 800);
          return [...prev, event.data];
        });
        if (event.data.to_user) base44.entities.Message.update(event.id, { is_read: true }).catch(() => {});
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

  const send = useCallback(async () => {
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
  }, [text, user, conversationId, otherName, listingTitle, getOtherUser]);

  const sendImage = useCallback(async (file) => {
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
  }, [user, conversationId, otherName, listingTitle, getOtherUser]);

  return (
    <div className="flex flex-col">
      {/* Message list — scrolls inside AppLayout's main scroller */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.from_user === user?.email;
          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <MsgBubble msg={msg} isMe={isMe} />
            </motion.div>
          );
        })}
        {otherTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
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

      {/* Sticky input bar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && sendImage(e.target.files[0])}
      />
      <div className="sticky bottom-0 bg-card/98 backdrop-blur-xl border-t border-border/30 px-4 py-3 flex gap-2 items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center shrink-0"
        >
          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
        </button>
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
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}