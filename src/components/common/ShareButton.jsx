import { Share2, Check } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ title, url, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button onClick={share} className={`transition-smooth ${className}`}>
      {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5 text-foreground" />}
    </button>
  );
}