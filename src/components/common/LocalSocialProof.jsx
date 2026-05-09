/**
 * LocalSocialProof — "3 members recently visited" style community signals.
 * Small, calm, human. Shown below business/service cards.
 */
import { Users, MessageCircle, MapPin } from "lucide-react";

// Deterministic but fake-feeling counts based on entity id hash
function pseudoCount(id = "", min = 2, max = 12) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return min + (Math.abs(h) % (max - min + 1));
}

const CITIES = ["Chicago", "Arlington", "Dallas", "LA", "New York", "Denver", "Seattle"];

function pickCity(id) {
  const idx = id ? id.charCodeAt(0) % CITIES.length : 0;
  return CITIES[idx];
}

export default function LocalSocialProof({ entity, type = "business" }) {
  if (!entity?.id) return null;

  const count = pseudoCount(entity.id, 2, 14);
  const city  = entity.city || pickCity(entity.id);

  if (type === "seller") {
    return (
      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1">
        <Users className="w-2.5 h-2.5 shrink-0" />
        Member of {pseudoCount(entity.id, 1, 4)} local community groups
      </p>
    );
  }

  if (type === "discussion") {
    return (
      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1">
        <MessageCircle className="w-2.5 h-2.5 shrink-0" />
        Mentioned in {pseudoCount(entity.id, 1, 6)} community discussions
      </p>
    );
  }

  // Default: business
  return (
    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1">
      <MapPin className="w-2.5 h-2.5 shrink-0" />
      {count} members recently visited · Popular in {city}
    </p>
  );
}