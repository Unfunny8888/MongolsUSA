import { Phone, Mail, BadgeCheck, Building2, Briefcase } from "lucide-react";

const LEVELS = [
  {
    key: "email_verified",
    icon: Mail,
    label: "Email Verified",
    shortLabel: "Email",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    key: "phone_verified",
    icon: Phone,
    label: "Phone Verified",
    shortLabel: "Phone",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    key: "trusted_seller",
    icon: BadgeCheck,
    label: "Trusted Seller",
    shortLabel: "Trusted",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    key: "verified_business",
    icon: Building2,
    label: "Verified Business",
    shortLabel: "Business",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
  {
    key: "recruiter_verified",
    icon: Briefcase,
    label: "Recruiter Verified",
    shortLabel: "Recruiter",
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
  },
];

export default function VerificationBadge({ user, compact = false }) {
  if (!user) return null;
  const active = LEVELS.filter((l) => user[l.key]);
  if (active.length === 0) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5">
        {active.map((l) => (
          <l.icon key={l.key} className={`w-3 h-3 ${l.color}`} title={l.label} />
        ))}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {active.map((l) => (
        <span
          key={l.key}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${l.bg} ${l.color}`}
        >
          <l.icon className="w-3 h-3" />
          {l.label}
        </span>
      ))}
    </div>
  );
}