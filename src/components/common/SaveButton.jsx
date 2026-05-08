import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SaveButton({ listing, className = "" }) {
  const [saved, setSaved] = useState(false);
  const [saveId, setSaveId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const me = await base44.auth.me();
      const existing = await base44.entities.SavedListing.filter({ user_email: me.email, listing_id: listing.id }, "-created_date", 1);
      if (existing.length > 0) { setSaved(true); setSaveId(existing[0].id); }
    }
    check();
  }, [listing.id]);

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { base44.auth.redirectToLogin(); return; }
    setLoading(true);
    if (saved) {
      await base44.entities.SavedListing.delete(saveId);
      setSaved(false);
      setSaveId(null);
    } else {
      const me = await base44.auth.me();
      const item = await base44.entities.SavedListing.create({
        user_email: me.email,
        listing_id: listing.id,
        listing_title: listing.title,
        listing_image: listing.images?.[0],
        listing_price: listing.price,
        listing_category: listing.category,
        listing_city: listing.location_city,
      });
      setSaved(true);
      setSaveId(item.id);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`transition-smooth ${className}`}
    >
      <Heart className={`w-5 h-5 transition-smooth ${saved ? "fill-red-500 text-red-500" : "text-foreground"}`} />
    </button>
  );
}