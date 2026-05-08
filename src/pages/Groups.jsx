import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GroupCard from "../components/cards/GroupCard";
import { MOCK_GROUPS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const dbGroups = await base44.entities.Group.list("-member_count", 20);
      if (dbGroups.length > 0) setGroups(dbGroups);
    }
    load();
  }, []);

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 border-b border-border/30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold flex-1">Communities</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-secondary/70 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.map((g, i) => (
          <GroupCard key={g.id} group={g} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm font-medium">No communities found</p>
          </div>
        )}
      </div>
    </div>
  );
}