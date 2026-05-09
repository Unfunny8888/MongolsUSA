import { memo } from "react";
import { Star, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CommunityTrustBadge from "../common/CommunityTrustBadge";
import LocalSocialProof from "../common/LocalSocialProof";

function BusinessCard({ business, index = 0 }) {
  // Derive which trust badges to show — calm, not overwhelming (max 2)
  const badges = [];
  if (business.is_verified)           badges.push("verified_business");
  else if (business.is_premium)       badges.push("verified_local");
  if ((business.review_count || 0) > 5) badges.push("community_pick");
  else if ((business.review_count || 0) > 0) badges.push("top_rated");
  const visibleBadges = badges.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/business/${business.id}`} className="block">
        <div className="bg-card rounded-2xl overflow-hidden border border-border/20 active:scale-[0.985] active:opacity-90 transition-all duration-200 min-w-[240px]">
          {/* Banner */}
          <div className="relative h-28 overflow-hidden bg-secondary">
            {business.banner && (
              <img
                src={business.banner}
                alt={business.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Body */}
          <div className="p-3 -mt-5 relative">
            <div className="flex items-end gap-3 mb-2">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-card shadow-sm"
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-primary/10 border-2 border-card flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate">{business.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  {business.rating && (
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {business.rating}
                    </span>
                  )}
                  {business.city && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />{business.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {business.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                {business.description}
              </p>
            )}

            {/* Trust badges — calm, max 2 */}
            {visibleBadges.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {visibleBadges.map(v => (
                  <CommunityTrustBadge key={v} variant={v} />
                ))}
              </div>
            )}

            {/* Community social proof */}
            <LocalSocialProof entity={business} type="business" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default memo(BusinessCard);