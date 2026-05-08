import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Loader2, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { MOCK_LISTINGS, MOCK_GROUPS, MOCK_BUSINESSES } from "../lib/mockData";

const SUGGESTIONS = [
  "Find me a cheap apartment in Chicago",
  "Trucking jobs near me",
  "Best Mongolian restaurant",
  "Prius under $8,000",
  "Part-time jobs for students",
  "2-bedroom furnished housing",
];

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

    const listingSummaries = MOCK_LISTINGS.map((l) =>
      `[LISTING:${l.id}] ${l.title} - ${l.category} - ${l.location_city} - $${l.price || "contact"} - ${l.description?.slice(0, 80)}`
    ).join("\n");
    const businessSummaries = MOCK_BUSINESSES.map((b) =>
      `[BUSINESS:${b.id}] ${b.name} - ${b.category} - ${b.city} - Rating: ${b.rating}`
    ).join("\n");

    const history = messages
      .slice(-6)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are NomadLink's AI for the Mongolian diaspora in the USA.
Help find listings, jobs, housing, cars, businesses, groups.
Understand English, Mongolian Cyrillic, and transliterated Mongolian (mashin=car, bair=housing, ajil=job).

History:
${history}
User: ${userText}

Available listings:
${listingSummaries}

Available businesses:
${businessSummaries}

Respond helpfully in English with occasional Mongolian phrases. Be friendly and specific. Keep under 120 words.
List IDs of relevant items.`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          listing_ids: { type: "array", items: { type: "string" } },
          business_ids: { type: "array", items: { type: "string" } },
        },
      },
    });

    const matchedListings = (result.listing_ids || [])
      .map((id) => MOCK_LISTINGS.find((l) => l.id === id))
      .filter(Boolean)
      .slice(0, 3);

    const matchedBusinesses = (result.business_ids || [])
      .map((id) => MOCK_BUSINESSES.find((b) => b.id === id))
      .filter(Boolean)
      .slice(0, 2);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result.message || "Let me help you with that!",
        listings: matchedListings,
        businesses: matchedBusinesses,
      },
    ]);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
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

      <div className="flex-1 px-4 py-4 space-y-4 pb-36 overflow-y-auto">
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

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 px-4 py-3 flex gap-3 items-center pb-[env(safe-area-inset-bottom)]">
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