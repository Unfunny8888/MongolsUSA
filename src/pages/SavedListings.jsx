import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Trash2, MapPin, Bookmark, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import EmptyState from "../components/common/EmptyState";

function formatPrice(item) {
  if (!item.listing_price) return "Contact";
  return `$${item.listing_price.toLocaleString()}`;
}

export default function SavedListings() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { setLoading(false); return; }
      const me = await base44.auth.me();
      setUser(me);
      const items = await base44.entities.SavedListing.filter({ user_email: me.email }, "-created_date", 50);
      setSaved(items);
      setLoading(false);
    }
    load();
  }, []);

  const unsave = useCallback(async (id) => {
    await base44.entities.SavedListing.delete(id);
    setSaved(prev => prev.filter(s => s.id !== id));
  }, []);

  if (!user && !loading) {
    return (
      <EmptyState
        icon={User}
        title="Sign in to view saved listings"
        description="Save listings you love and find them here anytime."
        action={{ label: "Sign In", onClick: () => base44.auth.redirectToLogin() }}
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <div className="min-h-screen">


      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the heart on any listing to save it here for later."
          action={{ label: "Browse Listings", onClick: () => navigate("/explore") }}
          secondaryAction={{ label: "Explore communities", onClick: () => navigate("/groups") }}
          className="min-h-[60vh]"
        />
      ) : (
        <div className="px-4 py-4 space-y-3">
          <AnimatePresence>
            {saved.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden flex"
              >
                <Link to={`/listing/${item.listing_id}`} className="flex-1 flex gap-3 p-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                    {item.listing_image && (
                      <img src={item.listing_image} alt={item.listing_title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight line-clamp-2 mb-1">{item.listing_title}</p>
                    <p className="text-base font-bold text-primary">{formatPrice(item)}</p>
                    {item.listing_city && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />{item.listing_city}
                      </p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => unsave(item.id)}
                  className="px-4 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-smooth"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}