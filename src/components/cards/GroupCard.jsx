import { Link } from "react-router-dom";
import { Users, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function GroupCard({ group, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/group/${group.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-smooth">
          <div className="relative h-28 overflow-hidden">
            <img
              src={group.cover_image}
              alt={group.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{group.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-sm">{group.name}</h3>
                    {group.is_verified && (
                      <Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-white/70 text-[11px]">
                    <Users className="w-3 h-3" />
                    <span>{group.member_count.toLocaleString()} members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {group.description}
            </p>
            <div className="flex items-center justify-between mt-2.5">
              <Badge variant="secondary" className="text-[10px]">{group.category}</Badge>
              {group.city && (
                <span className="text-[10px] text-muted-foreground">{group.city}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}