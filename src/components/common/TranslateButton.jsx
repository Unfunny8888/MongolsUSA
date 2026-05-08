import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TranslateButton({ text, onTranslated }) {
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState(false);

  async function translate() {
    if (translated) { onTranslated(null); setTranslated(false); return; }
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following text to English if it contains Mongolian, or to Mongolian if it's in English. If it's bilingual, provide both translations clearly. Return ONLY the translation, no preamble.\n\nText: "${text}"`,
    });
    onTranslated(result);
    setTranslated(true);
    setLoading(false);
  }

  return (
    <button
      onClick={translate}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-xl transition-smooth"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
      {translated ? "Show original" : "Translate"}
    </button>
  );
}