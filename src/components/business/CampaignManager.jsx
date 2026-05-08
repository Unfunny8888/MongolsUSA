import { useState } from "react";
import { Megaphone, Plus, TrendingUp, Pause, Play, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CampaignManager({ campaigns, onCreateCampaign }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    onCreateCampaign({ name: name.trim(), budget: Number(budget) || 0 });
    setName("");
    setBudget("");
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">Ad Campaigns</span>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="rounded-xl gap-1 text-xs h-8">
          <Plus className="w-3.5 h-3.5" /> New
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/50 rounded-xl p-3 space-y-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Campaign name" className="rounded-xl text-sm h-9" />
          <Input value={budget} onChange={e => setBudget(e.target.value)} placeholder="Budget ($)" type="number" className="rounded-xl text-sm h-9" />
          <Button onClick={handleCreate} disabled={!name.trim()} size="sm" className="w-full rounded-xl h-9 text-xs">Create Campaign</Button>
        </motion.div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-8">
          <Megaphone className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No campaigns yet. Create one to boost your visibility.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border/50 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{c.name}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  c.status === "active" ? "bg-emerald-50 text-emerald-600" :
                  c.status === "paused" ? "bg-amber-50 text-amber-600" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {c.status === "active" ? <Play className="w-3 h-3 inline mr-0.5" /> : <Pause className="w-3 h-3 inline mr-0.5" />}
                  {c.status || "draft"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs font-bold">${c.budget || 0}</p>
                  <p className="text-[9px] text-muted-foreground">Budget</p>
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center justify-center gap-0.5"><Eye className="w-3 h-3" />{c.impressions || 0}</p>
                  <p className="text-[9px] text-muted-foreground">Impressions</p>
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center justify-center gap-0.5"><TrendingUp className="w-3 h-3" />{c.clicks || 0}</p>
                  <p className="text-[9px] text-muted-foreground">Clicks</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}