import { useState } from "react";
import { Sparkles, Loader2, X, ChevronDown, Camera, Tag, DollarSign, Search, Hash } from "lucide-react";
import { base44 } from "@/api/base44Client";

function ResultSection({ icon: Icon, label, children }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function AIListingHelper({ category, images = [], onApply }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function generate() {
    if (!prompt.trim() && images.length === 0) return;
    setLoading(true);
    setSuggestions(null);

    const hasImages = images.length > 0;
    if (hasImages) setAnalyzing(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert marketplace listing assistant for NomadLink, a Mongolian diaspora community platform in the USA.

Category: ${category || "general"}
${prompt.trim() ? `User description: "${prompt}"` : ""}
${hasImages ? `The user has uploaded ${images.length} image(s). Analyze the image(s) to detect: product type, brand/model, condition, color, estimated market value, and any other relevant details.` : ""}

Generate a complete, professional marketplace listing. Be specific, persuasive, and SEO-optimized. 
For cars: detect make, model, year if visible, condition, and estimate market value range.
Mix English naturally with Mongolian where it feels authentic for this diaspora community.

Return a JSON with these fields:
- title: compelling listing title (max 80 chars)
- description: detailed 3-4 paragraph description highlighting key features and benefits
- category: best category from [cars, jobs, housing, services, electronics, community, events]
- suggested_price: number (estimated market price in USD, 0 if not applicable)
- price_min: number (low end of price range)
- price_max: number (high end of price range)
- price_reasoning: string (brief explanation of price estimate)
- tags: array of 5-8 descriptive tags
- hashtags: array of 5-8 social hashtags without the hash symbol
- seo_keywords: array of 5-6 SEO search keywords
- detected_details: object with auto-detected info (for cars: make, model, year, condition, color; for other: brand, type, condition)
- confidence: high or medium or low`,
      file_urls: hasImages ? images.slice(0, 4) : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          suggested_price: { type: "number" },
          price_min: { type: "number" },
          price_max: { type: "number" },
          price_reasoning: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          hashtags: { type: "array", items: { type: "string" } },
          seo_keywords: { type: "array", items: { type: "string" } },
          detected_details: { type: "object" },
          confidence: { type: "string" },
        }
      }
    });

    setSuggestions(result);
    setLoading(false);
    setAnalyzing(false);
  }

  const hasContent = images.length > 0 || prompt.trim();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full p-3.5 rounded-2xl bg-gradient-to-r from-violet-50 to-emerald-50 border border-primary/20 hover:border-primary/40 transition-smooth"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-bold text-primary">AI Posting Assistant</p>
          <p className="text-[10px] text-muted-foreground">Auto-fill title, price, tags — even from photos</p>
        </div>
        <ChevronDown className="w-4 h-4 text-primary" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50/80 to-emerald-50/80 border border-primary/20 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary">AI Posting Assistant</p>
            {images.length > 0 && (
              <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                <Camera className="w-2.5 h-2.5" /> {images.length} photo{images.length > 1 ? "s" : ""} ready for analysis
              </p>
            )}
          </div>
        </div>
        <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>

      {/* Image analysis notice */}
      {images.length > 0 && !suggestions && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-100 border border-emerald-200">
          <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px] text-emerald-700 font-medium">
            AI will analyze your {images.length} uploaded photo{images.length > 1 ? "s" : ""} to detect details automatically
          </p>
        </div>
      )}

      {/* Prompt input */}
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={images.length > 0 ? "Add extra details (optional) — or just generate from photos!" : `Describe what you're listing... e.g. "2019 Toyota Prius сайн байдалтай"`}
        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border/50"
        onKeyDown={e => e.key === "Enter" && generate()}
      />

      <button
        onClick={generate}
        disabled={loading || !hasContent}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {analyzing ? "Analyzing photos..." : "Generating..."}
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            {images.length > 0 ? "Analyze Photos + Generate" : "Generate Listing"}
          </>
        )}
      </button>

      {/* Results */}
      {suggestions && (
        <div className="bg-white rounded-xl border border-border/50 divide-y divide-border/40 overflow-hidden">

          {/* Detected details */}
          {suggestions.detected_details && Object.keys(suggestions.detected_details).filter(k => suggestions.detected_details[k]).length > 0 && (
            <div className="p-3 bg-amber-50">
              <div className="flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Detected from photos
                  {suggestions.confidence && (
                    <span className="ml-1.5 normal-case font-medium opacity-70">({suggestions.confidence} confidence)</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(suggestions.detected_details).map(([k, v]) => v ? (
                  <span key={k} className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-semibold capitalize">
                    {k.replace(/_/g, " ")}: {String(v)}
                  </span>
                ) : null)}
              </div>
            </div>
          )}

          {/* Title + Description */}
          <div className="p-3 space-y-2">
            <p className="text-xs font-bold text-foreground leading-snug">{suggestions.title}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-5">{suggestions.description}</p>
          </div>

          {/* Price */}
          {(suggestions.suggested_price > 0 || suggestions.price_min > 0) && (
            <div className="p-3">
              <ResultSection icon={DollarSign} label="Price Suggestion">
                <p className="text-base font-extrabold text-primary">
                  {suggestions.price_min > 0 && suggestions.price_max > 0
                    ? `$${suggestions.price_min.toLocaleString()} – $${suggestions.price_max.toLocaleString()}`
                    : `$${suggestions.suggested_price.toLocaleString()}`}
                </p>
                {suggestions.price_reasoning && (
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{suggestions.price_reasoning}</p>
                )}
              </ResultSection>
            </div>
          )}

          {/* Tags */}
          {suggestions.tags?.length > 0 && (
            <div className="p-3">
              <ResultSection icon={Tag} label="Tags">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {suggestions.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-lg bg-secondary text-foreground text-[10px] font-medium">{t}</span>
                  ))}
                </div>
              </ResultSection>
            </div>
          )}

          {/* Hashtags */}
          {suggestions.hashtags?.length > 0 && (
            <div className="p-3">
              <ResultSection icon={Hash} label="Hashtags">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {suggestions.hashtags.map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded-lg bg-violet-50 text-violet-700 text-[10px] font-medium">#{h}</span>
                  ))}
                </div>
              </ResultSection>
            </div>
          )}

          {/* SEO Keywords */}
          {suggestions.seo_keywords?.length > 0 && (
            <div className="p-3">
              <ResultSection icon={Search} label="SEO Keywords">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {suggestions.seo_keywords.map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-medium">{k}</span>
                  ))}
                </div>
              </ResultSection>
            </div>
          )}

          {/* Apply */}
          <div className="p-3">
            <button
              onClick={() => { onApply(suggestions); setOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply All to Listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}