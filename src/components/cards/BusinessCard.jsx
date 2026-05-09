import { memo } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ShieldCheck, Crown, Store } from "lucide-react";
import { motion } from "framer-motion";

function BusinessCard({ business, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/business/${business.id}`} className="block">
        <div className="bg-card rounded-2xl overflow-hidden border border-border/30 shadow-sm active:scale-[0.985] active:shadow-none transition-all duration-200 min-w-[240px]">
          <div className="relative h-32 overflow-hidden bg-secondary">
            <img
              src={business.banner}
              alt={business.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {business.is_premium && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-2 py-0.5 text-[10px] font-semibold">
                <Crown className="w-2.5 h-2.5" strokeWidth={2.5} /> Premium
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="p-3 -mt-5 relative">
            <div className="flex items-end gap-3">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-card shadow-sm"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-card flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" strokeWidth={2} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-foreground truncate">{business.name}</h3>
                  {business.is_verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {business.rating}
                  </span>
                  <span>({business.review_count})</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {business.city}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
              {business.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default memo(BusinessCard);