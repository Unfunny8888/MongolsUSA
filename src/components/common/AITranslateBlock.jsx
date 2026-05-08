import { useState } from "react";
import { Languages, Loader2, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Wraps any text block with a translate toggle.
 * Usage: <AITranslateBlock text={post.content} />
 */
export default function AITranslateBlock({ text, className = "" }) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState(null);

  if (!text) return null;

  async function translate() {
    if (translated) { setTranslated(null); setTargetLang(null); return; }
    setLoading(true);
    // Detect if Mongolian (contains Cyrillic) → translate to English, else to Mongolian
    const hasCyrillic = /[\u0400-\u04FF]/.test(text);
    const target = hasCyrillic ? "English" : "Mongolian";
    setTargetLang(target);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following text to ${target}. Return only the translation, nothing else.\n\nText: ${text}`,
    });
    setTranslated(result);
    setLoading(false);
  }

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground leading-relaxed">{translated || text}</p>
      <button
        onClick={translate}
        disabled={loading}
        className="mt-1.5 flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-smooth"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : translated ? (
          <RotateCcw className="w-3 h-3" />
        ) : (
          <Languages className="w-3 h-3" />
        )}
        {loading ? "Translating..." : translated ? "Show original" : `Translate to ${/[\u0400-\u04FF]/.test(text) ? "English" : "Mongolian"}`}
      </button>
    </div>
  );
}