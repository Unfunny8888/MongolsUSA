/**
 * CitySheet — bottom-sheet city picker. Shared singleton across the app.
 * Used by GlobalDiscoveryBar only.
 */
import { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';

const CITIES = [
  'Chicago, IL',
  'New York, NY',
  'Los Angeles, CA',
  'Houston, TX',
  'Miami, FL',
  'Dallas, TX',
  'Atlanta, GA',
  'San Francisco, CA',
  'Detroit, MI',
  'Minneapolis, MN',
  'Denver, CO',
  'Seattle, WA',
  'Boston, MA',
  'Phoenix, AZ',
  'Washington, DC',
];

export default function CitySheet({ currentCity, onSelect, onClose }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : CITIES;

  function pick(val) {
    onSelect(val);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      <div
        className="bg-card rounded-t-3xl max-h-[72vh] flex flex-col"
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-border/40" />
        </div>

        <div className="px-4 pt-2 pb-2 shrink-0">
          <p className="text-[15px] font-bold text-foreground mb-3">Choose a city</p>

          {/* Search */}
          <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 mb-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cities…"
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="shrink-0">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* All Cities */}
          <button
            onClick={() => pick(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors ${
              !currentCity ? 'bg-primary/10' : 'hover:bg-secondary/50'
            }`}
          >
            <span className="text-[15px]">🌐</span>
            <span className={`text-[13px] font-semibold ${!currentCity ? 'text-primary' : 'text-foreground'}`}>
              All Cities
            </span>
            {!currentCity && <span className="ml-auto text-[10px] font-bold text-primary">Active</span>}
          </button>
        </div>

        {/* City list */}
        <div className="overflow-y-auto px-4 pb-10 space-y-0.5">
          {filtered.map(c => (
            <button
              key={c}
              onClick={() => pick(c)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                currentCity === c ? 'bg-primary/10' : 'hover:bg-secondary/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className={`text-[13px] font-medium ${currentCity === c ? 'text-primary' : 'text-foreground'}`}>
                {c}
              </span>
              {currentCity === c && <span className="ml-auto text-[10px] font-bold text-primary">Active</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}