import { memo } from "react";
import { ShieldCheck, Users, Star, MapPin, Crown, Store, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function BusinessCard({ business, index = 0 }) {
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
            <img
              src={business.banner}
              alt={business.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Body */}
          <div className="p-3 -mt-5 relative">
            <div className="flex items-end gap-3">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-card shadow-sm"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                  {business.review_count > 0 && <span>({business.review_count})</span>}
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
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                {business.description}
              </p>
            )}

            {/* Community trust signals */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {business.is_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} /> Verified Local
                </span>
              )}
              {business.review_count > 5 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary/70 bg-primary/6 rounded-full px-2 py-0.5">
                  <Users className="w-2.5 h-2.5" strokeWidth={2.5} /> Community Favorite
                </span>
              )}
              {business.is_premium && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-full px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} /> Featured
                </span>
              )}
            </div>

            {/* Social proof footer */}
            {business.review_count > 0 && (
              <p className="text-[10px] text-muted-foreground/50 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                {business.review_count > 20 ? "Popular among local members" : `${business.review_count} community reviews`}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default memo(BusinessCard);