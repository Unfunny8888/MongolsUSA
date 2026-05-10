import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Loader2, Bot, Bookmark, MapPin, Users, Briefcase, Home, Car, Utensils, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { MOCK_LISTINGS, MOCK_GROUPS, MOCK_BUSINESSES } from "../lib/mockData";
import { getAISession, saveAIMessages, saveAIScroll, saveAIDraft, saveAIMeta } from "@/lib/aiSessionStore";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "CDL trucking jobs near Chicago",
  "Apartments under $1,500",
  "Mongolian restaurants nearby",
  "Toyota Prius under $8,000",
  "Cash jobs available today",
  "2-bedroom furnished housing",
];

const TRENDING = [
  { icon: <Briefcase className="w-3.5 h-3.5" />, label: "CDL jobs paying $2000+" },
  { icon: <Home className="w-3.5 h-3.5" />, label: "Furnished rooms in Chicago" },
  { icon: <Car className="w-3.5 h-3.5" />, label: "Used cars under $10k" },
  { icon: <Utensils className="w-3.5 h-3.5" />, label: "Mongolian food near me" },
  { icon: <Users className="w-3.5 h-3.5" />, label: "Mongolian community groups" },
  { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Owner operator opportunities" },
];

const CATEGORY_QUICK = [
  { emoji: "💼", label: "Jobs" },
  { emoji: "🏠", label: "Housing" },
  { emoji: "🚗", label: "Cars" },
  { emoji: "🍜", label: "Food" },
  { emoji: "👥", label: "Groups" },
  { emoji: "🔧", label: "Services" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultCard({ item, type }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (type === "listing") navigate(`/listing/${item.id}`);
    else if (type === "business") navigate(`/business/${item.id}`);
  };

  if (type === "listing") {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-3 bg-background rounded-2xl border border-border/20 p-3 active:scale-[0.98] cursor-pointer transition-all"
      >
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl shrink-0">
            {item.category === "jobs" ? "💼" : item.category === "housing" ? "🏠" : item.category === "cars" ? "🚗" : "📦"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground leading-snug line-clamp-1">{item.title}</p>
          {item.price != null && (
            <p className="text-[13px] font-bold text-primary mt-0.5">
              ${item.price.toLocaleString()}
              {item.price_type === "hourly" && <span className="text-[11px] font-normal text-muted-foreground">/hr</span>}
              {item.price_type === "monthly" && <span className="text-[11px] font-normal text-muted-foreground">/mo</span>}
              {item.price_type === "weekly" && <span className="text-[11px] font-normal text-muted-foreground">/wk</span>}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.location_city && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <MapPin className="w-2.5 h-2.5" />{item.location_city}
              </span>
            )}
            {item.job_type && (
              <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{item.job_type}</span>
            )}
            {item.housing_type && (
              <span className="text-[10px] bg-blue-500/10 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{item.housing_type}</span>
            )}
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  if (type === "business") {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-3 bg-background rounded-2xl border border-border/20 p-3 active:scale-[0.98] cursor-pointer transition-all"
      >
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">🏪</div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground leading-snug line-clamp-1">{item.name}</p>
          {item.rating && (
            <p className="text-[12px] text-amber-600 font-semibold mt-0.5">★ {item.rating} · {item.category}</p>
          )}
          {item.city && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground mt-0.5">
              <MapPin className="w-2.5 h-2.5" />{item.city}
            </span>
          )}
          {item.is_verified && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
              Mongolian-owned ✓
            </span>
          )}
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  if (type === "group") {
    return (
      <div className="flex items-center gap-3 bg-background rounded-2xl border border-border/20 p-3">
        <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl shrink-0">👥</div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground leading-snug line-clamp-1">{item.name}</p>
          <p className="text-[12px] text-primary font-semibold mt-0.5">{item.member_count?.toLocaleString()} members</p>
          {item.city && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground mt-0.5">
              <MapPin className="w-2.5 h-2.5" />{item.city} · Active recently
            </span>
          )}
          <span className="text-[10px] bg-blue-500/10 text-blue-600 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
            Community Group
          </span>
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return null;
}

function AIMessage({ msg, onFollowup }) {
  const isUser = msg.role === "user";
  const hasResults = msg.listings?.length || msg.businesses?.length || msg.groups?.length;

  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[75%] bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-[14px] leading-snug">
          {msg.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        {/* Text summary */}
        <div className="bg-card border border-border/20 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[14px] text-foreground leading-snug mb-2">
          {msg.content}
        </div>

        {/* Result cards */}
        {hasResults > 0 && (
          <div className="space-y-2">
            {msg.listings?.map((l) => <ResultCard key={l.id} item={l} type="listing" />)}
            {msg.businesses?.map((b) => <ResultCard key={b.id} item={b} type="business" />)}
            {msg.groups?.map((g) => <ResultCard key={g.id} item={g} type="group" />)}
          </div>
        )}

        {/* Follow-up suggestions */}
        {msg.followups?.length > 0 && (
          <div className="mt-2">
            <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">You might also ask</p>
            <div className="flex flex-wrap gap-1.5">
              {msg.followups.map((f, i) => (
                <button
                  key={i}
                  onClick={() => onFollowup?.(f)}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/8 border border-primary/15 rounded-full px-2.5 py-1 active:bg-primary/15"
                >
                  <TrendingUp className="w-2.5 h-2.5" /> {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Discovery Home (shown when no conversation yet) ──────────────────────────
function DiscoveryHome({ onSend }) {
  return (
    <div className="px-4 pt-2 pb-4">
      {/* Greeting */}
      <div className="flex gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-card border border-border/20 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[14px] text-foreground leading-snug">
          Sain baina uu! I'm your NomadLink AI. I can help you find apartments, jobs, cars, restaurants, and more. What are you looking for?
        </div>
      </div>

      {/* Category quick-access */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {CATEGORY_QUICK.map((c) => (
          <button
            key={c.label}
            onClick={() => onSend(`Find ${c.label.toLowerCase()} near me`)}
            className="flex flex-col items-center gap-1 bg-card border border-border/20 rounded-2xl py-3 active:scale-[0.97] transition-all"
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="text-[11px] font-semibold text-foreground">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Trending searches */}
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Trending searches</p>
      <div className="space-y-1.5">
        {TRENDING.map((t, i) => (
          <button
            key={i}
            onClick={() => onSend(t.label)}
            className="w-full flex items-center gap-3 bg-card border border-border/15 rounded-2xl px-3.5 py-2.5 active:scale-[0.98] transition-all text-left"
          >
            <span className="text-muted-foreground">{t.icon}</span>
            <span className="text-[13px] font-medium text-foreground">{t.label}</span>
            <TrendingUp className="w-3 h-3 text-primary ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const navigate = useNavigate();

  // ── Single-mount session restore ──────────────────────────────────────────
  // getAISession() is called ONCE at module init time, not on every render.
  const sessionRef = useRef(null);
  if (!sessionRef.current) sessionRef.current = getAISession();
  const initialSession = sessionRef.current;

  const [messages, setMessages] = useState(initialSession.messages);
  const [input, setInput]       = useState(initialSession.draftInput || "");
  const [loading, setLoading]   = useState(false);

  const scrollRef   = useRef(null);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const didInit     = useRef(false);
  const prevMsgLen  = useRef(initialSession.messages.length);

  // ── Scroll restoration — double-rAF so images/cards have time to paint ────
  useLayoutEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const savedScroll = initialSession.scrollTop;
    if (savedScroll > 0 && scrollRef.current) {
      // First rAF: DOM laid out. Second rAF: paint complete.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = savedScroll;
        });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist scroll on scroll ───────────────────────────────────────────────
  const onScroll = useCallback(() => {
    if (scrollRef.current) saveAIScroll(scrollRef.current.scrollTop);
  }, []);

  // ── Persist draft on every keystroke ──────────────────────────────────────
  const onInputChange = useCallback((e) => {
    setInput(e.target.value);
    saveAIDraft(e.target.value);
  }, []);

  // ── Auto-scroll to bottom only on NEW messages (not on restore) ───────────
  useEffect(() => {
    if (messages.length > prevMsgLen.current) {
      // Small delay so cards render before scrolling
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    }
    prevMsgLen.current = messages.length;
  }, [messages]);

  // Also scroll on loading indicator appearing
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    }
  }, [loading]);

  const sendMessage = useCallback(async (text) => {
    const userText = (typeof text === "string" ? text : input).trim();
    if (!userText || loading) return;
    setInput("");
    saveAIDraft("");

    // Persist meta: last query
    saveAIMeta({ lastQuery: userText });

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    saveAIMessages(newMessages);
    setLoading(true);

    let allListings = [...MOCK_LISTINGS];
    let allGroups = [...MOCK_GROUPS];
    let allBiz = [...MOCK_BUSINESSES];
    const [dbL, dbG, dbB] = await Promise.allSettled([
      base44.entities.Listing.list("-created_date", 30),
      base44.entities.Group.list("-member_count", 10),
      base44.entities.Business.list("-rating", 10),
    ]);
    if (dbL.status === "fulfilled" && dbL.value?.length) allListings = [...dbL.value, ...allListings];
    if (dbG.status === "fulfilled" && dbG.value?.length) allGroups = [...dbG.value, ...allGroups];
    if (dbB.status === "fulfilled" && dbB.value?.length) allBiz = [...dbB.value, ...allBiz];

    const listingSummaries = allListings.slice(0, 40).map((l) =>
      `[${l.id}] ${l.title} | ${l.category} | ${l.location_city || "?"} | $${l.price || "contact"} | ${l.description?.slice(0, 60)}`
    ).join("\n");
    const bizSummaries = allBiz.slice(0, 20).map((b) =>
      `[${b.id}] ${b.name} | ${b.category} | ${b.city} | ★${b.rating}`
    ).join("\n");
    const groupSummaries = allGroups.slice(0, 10).map((g) =>
      `[${g.id}] ${g.name} | ${g.city} | ${g.member_count} members`
    ).join("\n");

    const history = newMessages.slice(-6).map((m) =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    ).join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are NomadLink AI — a local discovery assistant for the Mongolian community in the USA.
Help users find: listings, jobs, housing, cars, businesses, groups, and events.
Understand Mongolian words: mashin/машин=car, bair/байр=housing, ajil/ажил=job.

Conversation:
${history}

User: "${userText}"

Listings (id | title | category | city | price | desc):
${listingSummaries}

Businesses:
${bizSummaries}

Groups:
${groupSummaries}

Rules:
- Write a SHORT 1-2 sentence summary (e.g. "Found 3 CDL opportunities near Chicago 🚛")
- Be specific with prices/locations
- Respond in friendly English, add 1 Mongolian phrase naturally
- Keep summary under 60 words
- Return up to 4 listing IDs, 2 business IDs, 1 group ID
- Return 3-4 short follow-up question strings (e.g. "CDL jobs paying $2000+")
- NEVER mention internal IDs or "mock" data in your summary text`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          listing_ids: { type: "array", items: { type: "string" } },
          business_ids: { type: "array", items: { type: "string" } },
          group_ids: { type: "array", items: { type: "string" } },
          followups: { type: "array", items: { type: "string" } },
        },
      },
    });

    const matchedListings = (result.listing_ids || []).map((id) => allListings.find((l) => l.id === id)).filter(Boolean).slice(0, 4);
    const matchedBiz = (result.business_ids || []).map((id) => allBiz.find((b) => b.id === id)).filter(Boolean).slice(0, 2);
    const matchedGroups = (result.group_ids || []).map((id) => allGroups.find((g) => g.id === id)).filter(Boolean).slice(0, 1);

    const assistantMsg = {
      role: "assistant",
      content: result.message || "Here's what I found!",
      listings: matchedListings,
      businesses: matchedBiz,
      groups: matchedGroups,
      followups: result.followups || [],
      // onFollowup is NOT stored — re-attached at render time via sendMessage ref
    };

    // Persist result type metadata
    const resultType = matchedListings.length ? "listing" : matchedBiz.length ? "business" : matchedGroups.length ? "group" : null;
    if (resultType) saveAIMeta({ resultType });

    setMessages((prev) => {
      const next = [...prev, assistantMsg];
      saveAIMessages(next);
      return next;
    });
    setLoading(false);
  }, [messages, input, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEmptyChat = messages.length === 0;

  return (
    <div
      className="flex flex-col bg-background"
      style={{
        // 100dvh shrinks with iOS keyboard so the input stays visible.
        // overflow:hidden on this container prevents scroll jumping.
        height: '100dvh',
        overflow: 'hidden',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* ── HEADER ── */}
      <div className="bg-card border-b border-border/20 px-4 flex items-center gap-3 shrink-0" style={{ height: '3.25rem' }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center active:scale-90 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[14px] font-bold leading-none">NomadLink AI</p>
          <p className="text-[10px] text-primary mt-0.5">Mongolian + English</p>
        </div>
      </div>

      {/* ── MESSAGES / DISCOVERY ── */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          {isEmptyChat ? (
            <motion.div key="discovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DiscoveryHome onSend={sendMessage} />
            </motion.div>
          ) : (
            <motion.div key="chat" className="px-4 py-3 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {messages.map((msg, i) => (
                <AIMessage key={i} msg={msg} onFollowup={sendMessage} />
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border/20 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── INPUT BAR ── */}
      <div className="shrink-0 bg-card border-t border-border/15 px-4 py-2.5" style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}>
        {/* Suggestion chips — only on empty chat */}
        {isEmptyChat && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-primary/8 border border-primary/15 text-[11px] font-medium text-primary active:bg-primary/15 shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="flex-1 bg-secondary/60 border border-border/20 rounded-2xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white flex items-center justify-center disabled:opacity-40 shrink-0 active:scale-95 transition-transform"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}