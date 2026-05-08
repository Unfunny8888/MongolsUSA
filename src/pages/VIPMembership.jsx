import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Zap, Crown, Star, Shield, Sparkles, Users, TrendingUp, Building } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  {
    id: "vip",
    icon: Star,
    label: "VIP",
    labelMn: "VIP гишүүн",
    price: 9.99,
    period: "/month",
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    perks: [
      "5 free boosted listings/month",
      "Verified member badge",
      "Priority search placement",
      "Contact info always visible",
      "Unlimited listings",
      "Remove ads",
    ],
  },
  {
    id: "super_vip",
    icon: Crown,
    label: "Super VIP",
    labelMn: "Супер VIP",
    price: 19.99,
    period: "/month",
    color: "from-amber-500 to-orange-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    popular: true,
    perks: [
      "Everything in VIP",
      "15 featured listings/month",
      "Homepage banner placement",
      "Analytics dashboard",
      "Mongolian phone support",
      "First access to new features",
    ],
  },
  {
    id: "business_pro",
    icon: Building,
    label: "Business Pro",
    labelMn: "Бизнес про",
    price: 49.99,
    period: "/month",
    color: "from-blue-500 to-indigo-600",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    perks: [
      "Everything in Super VIP",
      "Premium business profile",
      "Unlimited job postings",
      "Applicant tracking system",
      "Review management tools",
      "Dedicated account manager",
    ],
  },
  {
    id: "recruiter_pro",
    icon: Users,
    label: "Recruiter Pro",
    labelMn: "Рекрутер про",
    price: 39.99,
    period: "/month",
    color: "from-rose-500 to-red-600",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200",
    perks: [
      "Unlimited job listings",
      "Candidate search & filters",
      "Direct message all users",
      "Resume database access",
      "Hiring analytics",
      "CDL driver pool access",
    ],
  },
];

export default function VIPMembership() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("super_vip");
  const [billing, setBilling] = useState("monthly");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const plan = PLANS.find(p => p.id === selected);
  const price = billing === "annual" ? (plan.price * 10).toFixed(2) : plan.price;

  async function handleSubscribe() {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setSuccess(true);
    setProcessing(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center bg-gradient-to-br from-primary via-emerald-700 to-teal-800">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-8xl mb-6">🎉</motion.div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Welcome to {plan.label}!</h1>
        <p className="text-emerald-100 mb-8">Your membership is now active. Enjoy all the premium benefits.</p>
        <button onClick={() => navigate("/")} className="bg-white text-primary rounded-2xl px-10 py-4 font-bold text-base">
          Start Exploring
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-emerald-700 to-teal-800 px-6 py-8 text-center text-white">
        <div className="text-5xl mb-3">👑</div>
        <h2 className="text-2xl font-extrabold mb-2">Upgrade Your Experience</h2>
        <p className="text-emerald-100 text-sm">Join thousands of Mongolians who get more with NomadLink Premium</p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="flex bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${billing === "monthly" ? "bg-white text-primary" : "text-white/70"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${billing === "annual" ? "bg-white text-primary" : "text-white/70"}`}
            >
              Annual <span className="text-amber-300">-17%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 py-4 space-y-3">
        {PLANS.map((p, i) => {
          const Icon = p.icon;
          const active = selected === p.id;
          const displayPrice = billing === "annual" ? (p.price * 10).toFixed(2) : p.price;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(p.id)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-smooth relative ${active ? `border-2 ${p.bgColor}` : "border-border/50 bg-card hover:border-border"}`}
            >
              {p.popular && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.labelMn}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-extrabold ${active ? p.textColor : "text-foreground"}`}>${displayPrice}</p>
                  <p className="text-[10px] text-muted-foreground">{billing === "annual" ? "/year" : "/month"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {p.perks.map(perk => (
                  <div key={perk} className="flex items-center gap-1.5">
                    <Check className={`w-3 h-3 flex-shrink-0 ${active ? p.textColor : "text-primary"}`} />
                    <span className="text-[11px] text-muted-foreground">{perk}</span>
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Subscribe Button */}
      <div className="px-4 pb-8">
        <button
          onClick={handleSubscribe}
          disabled={processing}
          className={`w-full py-5 rounded-2xl text-white font-bold text-base bg-gradient-to-r ${plan.color} shadow-xl disabled:opacity-70`}
        >
          {processing ? "Processing..." : `Subscribe to ${plan.label} · $${price}${billing === "annual" ? "/yr" : "/mo"}`}
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-3">
          Cancel anytime · Secure payment · 7-day free trial
        </p>
      </div>
    </div>
  );
}