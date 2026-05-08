import { Shield, Star, Crown, Gem } from "lucide-react";

const RANKS = {
  bronze: { label: "Bronze", icon: Shield, color: "text-amber-700 bg-amber-100" },
  silver: { label: "Silver", icon: Star, color: "text-slate-500 bg-slate-100" },
  gold: { label: "Gold", icon: Crown, color: "text-yellow-600 bg-yellow-100" },
  elite: { label: "Elite", icon: Gem, color: "text-purple-600 bg-purple-100" },
};

const TIERS = {
  free: null,
  vip: { label: "VIP", color: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" },
  super_vip: { label: "SUPER VIP", color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white" },
  business_pro: { label: "BIZ PRO", color: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" },
  ai_pro: { label: "AI PRO", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  recruiter_pro: { label: "RECRUITER", color: "bg-gradient-to-r from-rose-500 to-red-500 text-white" },
};

export default function ReputationBadge({ rank = "bronze", tier = "free", score = 0, compact = false }) {
  const rankInfo = RANKS[rank] || RANKS.bronze;
  const tierInfo = TIERS[tier];
  const Icon = rankInfo.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${rankInfo.color}`}>
          <Icon className="w-3 h-3" />
          {rankInfo.label}
        </div>
        {tierInfo && (
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tierInfo.color}`}>
            {tierInfo.label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${rankInfo.color}`}>
        <Icon className="w-4 h-4" />
        {rankInfo.label} · {score} pts
      </div>
      {tierInfo && (
        <div className={`px-3 py-1 rounded-xl text-xs font-bold ${tierInfo.color}`}>
          {tierInfo.label}
        </div>
      )}
    </div>
  );
}