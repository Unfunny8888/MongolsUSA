import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Loader2, Bot, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { MOCK_LISTINGS, MOCK_GROUPS, MOCK_BUSINESSES } from "../lib/mockData";

const SUGGESTIONS = [
  "Find CDL trucking jobs near Chicago",
  "Cheap apartments under $1500",
  "Mongolian restaurants nearby",
  "Toyota Prius under $8,000",
  "Cash jobs available today",
  "2-bedroom furnished housing",
];

const _SUGGESTIONS_OLD = [
  "Find me a cheap apartment in Chicago",
  "Trucking jobs near me",
  "Best Mongolian restaurant",
  "Prius under $8,000",
  "Part-time jobs for students",
];  // end legacy

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-primary text-white rounded-br-sm"
          : "bg-card border border-border/50 rounded-bl-sm text-foreground"
      }`}>
        {msg.content}
        {msg.listings?.length > 0 && (
          <div className="mt-3 space-y-2">
            {msg.listings.map((l) => (
              <a
                key={l.id}
                href={`/listing/${l.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth border border-border/50"
              >
                <img
                  src={l.images?.[0] || "https://images.unsplash.com/photo-1557683316-973673baf926?w=100"}
                  alt={l.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{l.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {l.price ? `$${l.price.toLocaleString()}` : "Contact"} {l.location_city ? `- ${l.location_city}` : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
        {msg.groups?.length > 0 && (
          <div className="mt-3 space-y-2">
            {msg.groups.map((g) => (
              <a
                key={g.id}
                href={`/group/${g.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth border border-border/50"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-xl shrink-0">👥</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{g.name}</p>
                  <p className="text-[10px] text-muted-foreground">{g.city} · {g.member_count} members</p>
                </div>
              </a>
            ))}
          </div>
        )}
        {msg.businesses?.length > 0 && (
          <div className="mt-3 space-y-2">
            {msg.businesses.map((b) => (
              <a
                key={b.id}
                href={`/business/${b.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth border border-border/50"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">
                  🏪
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.category} - {b.city}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Sain baina uu! I'm your NomadLink AI. I can help you find apartments, jobs, cars, restaurants, and more. What are you looking for?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    // Fetch real listings from DB + merge with mock
    let allListings = [...MOCK_LISTINGS];
    let allGroups = [...MOCK_GROUPS];
    let allBiz = [...MOCK_BUSINESSES];
    const [dbL, dbG, dbB] = await Promise.allSettled([
      base44.entities.Listing.list("-created_date", 30),
      base44.entities.Group.list("-member_count", 10),
      base44.entities.Business.list("-rating", 10),
    ]);
    if (dbL.status === "fulfilled" && dbL.value.length > 0) allListings = [...dbL.value, ...allListings];
    if (dbG.status === "fulfilled" && dbG.value.length > 0) allGroups = [...dbG.value, ...allGroups];
    if (dbB.status === "fulfilled" && dbB.value.length > 0) allBiz = [...dbB.value, ...allBiz];

    const listingSummaries = allListings.slice(0, 40).map((l) =>
      `[LISTING:${l.id}] ${l.title} | ${l.category} | ${l.location_city || "?"} | $${l.price || "contact"} | ${l.description?.slice(0, 60)}`
    ).join("\n");
    const businessSummaries = allBiz.slice(0, 20).map((b) =>
      `[BUSINESS:${b.id}] ${b.name} | ${b.category} | ${b.city} | Rating: ${b.rating}`
    ).join("\n");
    const groupSummaries = allGroups.slice(0, 10).map((g) =>
      `[GROUP:${g.id}] ${g.name} | ${g.city} | ${g.member_count} members`
    ).join("\n");

    const history = messages
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are NomadLink AI — a smart, friendly assistant for the Mongolian diaspora in the USA.
You help users find: listings, jobs, housing, cars, businesses, groups, and events.
Understand English, Mongolian Cyrillic, and transliterated Mongolian:
- mashin / машин = car
- bair / байр = apartment/housing
- ajil / ажил = job
- jaahan / жааан = a little / small
- ukhaan / ухаан = smart

Conversation history:
${history}

User's latest message: "${userText}"

Available listings (ID | title | category | city | price | description):
${listingSummaries}

Available businesses:
${businessSummaries}

Available groups:
${groupSummaries}

Instructions:
- Detect user intent (find job, find car, find housing, find restaurant, find group, etc.)
- Match relevant items from the data above
- Respond in friendly English. Add 1-2 Mongolian words/phrases naturally.
- Be specific: mention prices, locations, key details
- Keep response under 140 words
- Return IDs of best matches (max 4 listings, 2 businesses, 1 group)`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          listing_ids: { type: "array", items: { type: "string" } },
          business_ids: { type: "array", items: { type: "string" } },
          group_ids: { type: "array", items: { type: "string" } },
        },
      },
    });

    const matchedListings = (result.listing_ids || [])
      .map((id) => allListings.find((l) => l.id === id))
      .filter(Boolean)
      .slice(0, 4);

    const matchedBusinesses = (result.business_ids || [])
      .map((id) => allBiz.find((b) => b.id === id))
      .filter(Boolean)
      .slice(0, 2);

    const matchedGroups = (result.group_ids || [])
      .map((id) => allGroups.find((g) => g.id === id))
      .filter(Boolean)
      .slice(0, 1);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result.message || "Let me help you with that!",
        listings: matchedListings,
        businesses: matchedBusinesses,
        groups: matchedGroups,
      },
    ]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">NomadLink AI</p>
          <p className="text-[10px] text-primary">Mongolian + English</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 pb-4 overflow-y-auto overscroll-contain">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="whitespace-nowrap px-3 py-2 rounded-xl bg-primary/5 border border-primary/15 text-xs font-medium text-primary hover:bg-primary/10 transition-smooth shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass border-t border-border/30 px-4 py-3 flex gap-3 items-center pb-[env(safe-area-inset-bottom)] shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask in Mongolian or English..."
          className="flex-1 bg-secondary/70 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white flex items-center justify-center disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}