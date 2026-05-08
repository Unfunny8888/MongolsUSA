import { useState } from "react";
import { Sparkles, Loader2, X, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIListingHelper({ category, onApply }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are helping a Mongolian user in the USA create a marketplace listing. 
Category: ${category || "general"}
User described: "${prompt}"

Generate a professional listing for them. Be specific and persuasive. Mix English with a little Mongolian where natural.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          suggested_price: { type: "number" },
          tags: { type: "array", items: { type: "string" } },
        }
      }
    });
    setSuggestions(result);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full p-3.5 rounded-2xl bg-gradient-to-r from-primary/5 to-emerald-50 border border-primary/15 hover:border-primary/30 transition-smooth"
      >
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-bold text-primary">AI Writing Assistant</p>
          <p className="text-[10px] text-muted-foreground">Let AI write your listing for you</p>
        </div>
        <ChevronRight className="w-4 h-4 text-primary" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/15 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-primary">AI Writing Assistant</p>
        </div>
        <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>

      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={`Describe what you're listing... e.g. "2019 Toyota Prius маш сайн байдалтай зарна"`}
        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border/50"
        onKeyDown={e => e.key === "Enter" && generate()}
      />

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {loading ? "Generating..." : "Generate Listing"}
      </button>

      {suggestions && (
        <div className="bg-white rounded-xl p-3 border border-border/50 space-y-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">AI Suggestion</p>
          <p className="text-xs font-bold">{suggestions.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{suggestions.description}</p>
          {suggestions.suggested_price > 0 && (
            <p className="text-xs text-primary font-bold">Suggested price: ${suggestions.suggested_price.toLocaleString()}</p>
          )}
          <button
            onClick={() => { onApply(suggestions); setOpen(false); }}
            className="w-full py-2 rounded-xl bg-primary text-white text-xs font-bold"
          >
            Use This Listing ✓
          </button>
        </div>
      )}
    </div>
  );
}