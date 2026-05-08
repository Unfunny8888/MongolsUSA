import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BusinessCard from "../components/cards/BusinessCard";
import { MOCK_BUSINESSES } from "../lib/mockData";
import { base44 } from "@/api/base44Client";

export default function Businesses() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const db = await base44.entities.Business.list("-rating", 20);
      if (db.length > 0) setBusinesses(db);
    }
    load();
  }, []);

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-40 border-b border-border/30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold flex-1">Businesses</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses..."
              className="w-full bg-secondary/70 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
            />
          </div>
        </div>
      </div>
      <div className="px-4 py-4 space-y-3">
        {filtered.map((b, i) => (
          <BusinessCard key={b.id} business={b} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-sm font-medium">No businesses found</p>
          </div>
        )}
      </div>
    </div>
  );
}