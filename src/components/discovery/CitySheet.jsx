/**
 * CitySheet — modern Airbnb-style city picker.
 * Features: geolocation, recent cities, popular cities, live search.
 */
import { useState, useEffect } from 'react';
import { MapPin, Search, X, Navigation, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { CITY_COORDS } from '@/lib/DiscoveryContext';

const ALL_CITIES = Object.keys(CITY_COORDS);

const POPULAR_CITIES = [
  'Chicago, IL',
  'New York, NY',
  'Los Angeles, CA',
  'Dallas, TX',
  'Atlanta, GA',
  'Minneapolis, MN',
  'Houston, TX',
  'Seattle, WA',
];

export default function CitySheet({ currentCity, recentCities = [], onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);

  const filtered = query.trim()
    ? ALL_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : null;

  function pick(val) {
    onSelect(val);
    onClose();
  }

  function detectLocation() {
    setDetecting(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        // Find closest city
        const { latitude: lat, longitude: lng } = pos.coords;
        let closest = null;
        let minDist = Infinity;
        for (const [name, coords] of Object.entries(CITY_COORDS)) {
          const d = Math.hypot(lat - coords.lat, lng - coords.lng);
          if (d < minDist) { minDist = d; closest = name; }
        }
        setDetecting(false);
        if (closest) pick(closest);
      },
      () => setDetecting(false)
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div
        className="bg-card rounded-t-3xl flex flex-col"
        style={{ maxHeight: '80vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border/40" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[17px] font-bold text-foreground">Where are you?</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2.5 bg-secondary/70 rounded-2xl px-4 py-3 mb-3 border border-border/10">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search any city…"
              className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Use my location */}
          <button
            onClick={detectLocation}
            disabled={detecting}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/8 border border-primary/15 active:scale-[0.98] transition-all duration-150 mb-1"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Navigation className={`w-4 h-4 text-primary ${detecting ? 'animate-spin' : ''}`} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-primary">{detecting ? 'Detecting…' : 'Use my location'}</p>
              <p className="text-[11px] text-muted-foreground">Auto-detect your city</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary ml-auto" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-10 flex-1">
          {/* Search results */}
          {filtered && (
            <div className="space-y-0.5">
              {filtered.length === 0 && (
                <p className="text-[13px] text-muted-foreground text-center py-6">No cities found</p>
              )}
              {filtered.map(c => (
                <CityRow key={c} city={c} active={currentCity === c} onPick={pick} />
              ))}
            </div>
          )}

          {!filtered && (
            <>
              {/* All Cities */}
              <button
                onClick={() => pick(null)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-2 transition-all duration-150 ${
                  !currentCity ? 'bg-primary/10' : 'active:bg-secondary/60'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-[16px]">🌐</span>
                </div>
                <div className="text-left flex-1">
                  <p className={`text-[14px] font-bold ${!currentCity ? 'text-primary' : 'text-foreground'}`}>All Cities</p>
                  <p className="text-[11px] text-muted-foreground">Show everything nearby</p>
                </div>
                {!currentCity && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>}
              </button>

              {/* Recent */}
              {recentCities.length > 0 && (
                <>
                  <SectionHeader icon={<Clock className="w-3.5 h-3.5" />} label="Recent" />
                  <div className="space-y-0.5 mb-3">
                    {recentCities.map(c => (
                      <CityRow key={c} city={c} active={currentCity === c} onPick={pick} />
                    ))}
                  </div>
                </>
              )}

              {/* Popular */}
              <SectionHeader icon={<TrendingUp className="w-3.5 h-3.5" />} label="Popular cities" />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {POPULAR_CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => pick(c)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border transition-all duration-150 active:scale-[0.97] ${
                      currentCity === c
                        ? 'bg-primary/10 border-primary/30'
                        : 'border-border/15 bg-card active:bg-secondary/50'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 shrink-0 ${currentCity === c ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-[12px] font-semibold leading-tight line-clamp-1 ${currentCity === c ? 'text-primary' : 'text-foreground'}`}>
                      {c.split(',')[0]}
                      <span className="text-muted-foreground font-normal">, {c.split(', ')[1]}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* All cities list */}
              <SectionHeader icon={<MapPin className="w-3.5 h-3.5" />} label="All cities" />
              <div className="space-y-0.5">
                {ALL_CITIES.map(c => (
                  <CityRow key={c} city={c} active={currentCity === c} onPick={pick} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 mt-1">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
    </div>
  );
}

function CityRow({ city, active, onPick }) {
  return (
    <button
      onClick={() => onPick(city)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98] ${
        active ? 'bg-primary/10' : 'active:bg-secondary/50'
      }`}
    >
      <MapPin className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`text-[13px] font-medium flex-1 text-left ${active ? 'text-primary font-semibold' : 'text-foreground'}`}>
        {city}
      </span>
      {active && <span className="text-[10px] font-bold text-primary">✓</span>}
    </button>
  );
}