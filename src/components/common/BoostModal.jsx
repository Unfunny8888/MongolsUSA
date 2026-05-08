import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Star, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const PLANS = [
  {
    id: "boost",
    icon: Zap,
    label: "Boost",
    labelMn: "Дэмжих",
    price: 4.99,
    duration: "7 days",
    color: "from-primary to-emerald-600",
    perks: ["2× more views", "Priority in search", "Highlighted listing"],
  },
  {
    id: "featured",
    icon: Star,
    label: "Featured",
    labelMn: "Онцлох",
    price: 9.99,
    duration: "14 days",
    color: "from-amber-500 to-orange-500",
    perks: ["Featured badge", "Homepage placement", "5× more views", "Email to subscribers"],
    popular: true,
  },
  {
    id: "premium",
    icon: Crown,
    label: "Premium Spot",
    labelMn: "Прэмиум",
    price: 19.99,
    duration: "30 days",
    color: "from-purple-600 to-pink-600",
    perks: ["Top of all searches", "Featured + Boosted", "Analytics dashboard", "Social media share"],
  },
];

export default function BoostModal({ listingId, listingTitle, onClose }) {
  const [selected, setSelected] = useState("featured");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleBoost() {
    setProcessing(true);
    // Simulate payment & update listing
    await new Promise(r => setTimeout(r, 1500));
    const plan = PLANS.find(p => p.id === selected);
    const update = {};
    if (plan.id === "boost" || plan.id === "premium") update.is_boosted = true;
    if (plan.id === "featured" || plan.id === "premium") update.is_featured = true;
    if (listingId && !listingId.startsWith("mock-")) {
      await base44.entities.Listing.update(listingId, update);
    }
    setSuccess(true);
    setProcessing(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">Boost Your Listing</h2>
            <p className="text-xs text-muted-foreground truncate max-w-[220px]">{listingTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-lg font-bold text-primary mb-2">Listing Boosted!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your listing is now getting more visibility.</p>
            <Button onClick={onClose} className="bg-primary text-white rounded-xl px-8">Done</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {PLANS.map(plan => {
                const Icon = plan.icon;
                const active = selected === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelected(plan.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-smooth relative ${active ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{plan.label}</p>
                        <p className="text-[10px] text-muted-foreground">{plan.duration}</p>
                      </div>
                      <p className="text-lg font-extrabold text-primary">${plan.price}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.perks.map(perk => (
                        <span key={perk} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Check className="w-3 h-3 text-primary" /> {perk}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              onClick={handleBoost}
              disabled={processing}
              className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl py-6 text-base font-bold shadow-lg shadow-primary/20"
            >
              {processing ? "Processing..." : `Boost for $${PLANS.find(p => p.id === selected)?.price}`}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground mt-3">Secure payment • Cancel anytime</p>
          </>
        )}
      </motion.div>
    </div>
  );
}