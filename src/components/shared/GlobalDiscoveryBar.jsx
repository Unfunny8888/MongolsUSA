/**
 * GlobalDiscoveryBar — ONE embedded discovery component used by all category pages.
 *
 * Reads/writes global city from DiscoveryContext.
 * Each page passes its own suggestion chips + the active chip key.
 *
 * Design: NOT a floating overlay. Sits flush in the normal page flow,
 * same background as content, no shadow or blur heavy styling.
 *
 * Structure:
 *   ROW 1: [ All Cities ▼ ]        [ 🗺 Check on map ]
 *   ROW 2: [ Nearby ] [ Top Rated ] [ Open Now ] …
 */
import { useState } from 'react';
import { MapPin, ChevronDown, Map, Search, X } from 'lucide-react';
import { useDiscovery } from '@/lib/DiscoveryContext';

const POPULAR_CITIES = [
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
];

function CitySheet({ onClose }) {
  const { city, setCity } = useDiscovery();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? POPULAR_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : POPULAR_CITIES;

  function pick(val) {
    setCity(val);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" onClick={onClose}>
      <div className="flex-1 bg-black/25" />
      <div
        className="bg-card rounded-t-3xl max-h-[72vh] flex flex-col"
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-border/40" />
        </div>

        <div className="px-4 pt-1 pb-2 shrink-0">
          <p className="text-[15px] font-bold text-foreground mb-3">Choose a city</p>
          {/* Search input */}
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
              !city ? 'bg-primary/10' : 'hover:bg-secondary/50'
            }`}
          >
            <span className="text-[15px]">🌐</span>
            <span className={`text-[13px] font-semibold ${!city ? 'text-primary' : 'text-foreground'}`}>
              All Cities
            </span>
            {!city && <span className="ml-auto text-[10px] font-bold text-primary">Active</span>}
          </button>
        </div>

        {/* City list */}
        <div className="overflow-y-auto px-4 pb-10 space-y-0.5">
          {filtered.map(c => (
            <button
              key={c}
              onClick={() => pick(c)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                city === c ? 'bg-primary/10' : 'hover:bg-secondary/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className={`text-[13px] font-medium ${city === c ? 'text-primary' : 'text-foreground'}`}>
                {c}
              </span>
              {city === c && <span className="ml-auto text-[10px] font-bold text-primary">Active</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * props:
 *   suggestions   string[]         chips for this category
 *   activeSug     string           currently active chip
 *   onSuggest     fn(chip)
 *   showMapToggle bool             whether to show the map button
 *   onMapToggle   fn               called when map button tapped
 */
export default function GlobalDiscoveryBar({ suggestions = [], activeSug, onSuggest, showMapToggle, onMapToggle }) {
  const { city } = useDiscovery();
  const [showSheet, setShowSheet] = useState(false);

  const cityLabel = city || 'All Cities';
  const isAll = !city;

  return (
    <>
      {/* Embedded — no sticky, no glass, no shadow. Sits in normal flow. */}
      <div className="bg-background border-b border-border/10 pt-2 pb-0">
        {/* ROW 1 */}
        <div className="flex items-center justify-between px-4 pb-2">
          <button
            onClick={() => setShowSheet(true)}
            className="flex items-center gap-1.5 active:opacity-60 transition-opacity"
          >
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isAll ? 'text-muted-foreground' : 'text-primary'}`} />
            <span className={`text-[14px] font-semibold leading-none ${isAll ? 'text-muted-foreground' : 'text-foreground'}`}>
              {cityLabel}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {showMapToggle && onMapToggle && (
            <button
              onClick={onMapToggle}
              className="flex items-center gap-1.5 border border-border/25 rounded-full px-3 py-1.5 active:scale-[0.96] transition-all duration-150"
            >
              <Map className="w-3 h-3 text-primary" />
              <span className="text-[12px] font-semibold text-foreground">Check on map</span>
            </button>
          )}
        </div>

        {/* ROW 2 — chips */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2.5">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => onSuggest?.(s)}
                className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.96] border ${
                  activeSug === s
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border/20 text-muted-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {showSheet && <CitySheet onClose={() => setShowSheet(false)} />}
    </>
  );
}