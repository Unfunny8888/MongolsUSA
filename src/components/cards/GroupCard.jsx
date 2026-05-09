import { memo } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

function GroupCard({ group, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.22 }}
    >
      <Link to={`/group/${group.id}`} className="block">
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm active:scale-[0.985] active:shadow-none transition-all duration-200">
          {/* Cover */}
          <div className="relative h-24 bg-secondary overflow-hidden">
            {group.cover_image && (
              <img
                src={group.cover_image}
                alt={group.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>

          {/* Body */}
          <div className="px-4 pb-4">
            <div className="-mt-5 mb-3">
              {group.avatar ? (
                <img
                  src={group.avatar}
                  alt={group.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-card shadow-sm"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-card flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <h3 className="text-[14px] font-bold text-foreground truncate">{group.name}</h3>
              {group.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2} />}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <Users className="w-3 h-3" strokeWidth={2} />
              <span>{(group.member_count || 0).toLocaleString()} members</span>
              {group.city && <><span>·</span><span>{group.city}</span></>}
            </div>
            {group.description && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{group.description}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default memo(GroupCard);