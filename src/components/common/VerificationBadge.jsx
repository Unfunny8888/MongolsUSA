import { ShieldCheck, Phone, Mail, BadgeCheck } from "lucide-react";

const LEVELS = [
  { key: "phone_verified", icon: Phone, label: "Phone", color: "text-blue-500" },
  { key: "email_verified", icon: Mail, label: "Email", color: "text-emerald-500" },
  { key: "id_verified", icon: ShieldCheck, label: "ID", color: "text-amber-500" },
];

export default function VerificationBadge({ user, compact = false }) {
  if (!user) return null;
  const active = LEVELS.filter((l) => user[l.key]);
  if (active.length === 0) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5">
        {active.map((l) => (
          <l.icon key={l.key} className={`w-3 h-3 ${l.color}`} />
        ))}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {active.map((l) => (
        <span
          key={l.key}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary border border-border/50 ${l.color}`}
        >
          <l.icon className="w-3 h-3" />
          {l.label} Verified
        </span>
      ))}
      {user.trusted_seller && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-700">
          <BadgeCheck className="w-3 h-3" /> Trusted Seller
        </span>
      )}
    </div>
  );
}