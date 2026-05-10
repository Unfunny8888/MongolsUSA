/**
 * GlobalDiscoveryBar — rebuilt as native discovery engine.
 *
 * ROW 1: [ City selector ▼ ]              [ 🗺 Map ]
 * ROW 2: lightweight smart filter chips (reactive, animated)
 */
import { useState } from 'react';
import { MapPin, ChevronDown, Map, List } from 'lucide-react';
import { useDiscovery } from '@/lib/DiscoveryContext';
import CitySheet from './CitySheet';

export default function GlobalDiscoveryBar({
  category,
  suggestions = [],
  showMapToggle = false,
  isMapMode = false,
  onMapToggle,
}) {
  const { city, setCity, recentCities, getFilter, setFilter } = useDiscovery();
  const [showSheet, setShowSheet] = useState(false);

  const activeFilter = getFilter(category);
  const cityLabel = city ? city.split(',')[0] : 'All Cities';
  const isAll = !city;

  return (
    <>
      <div className="bg-background/95 backdrop-blur-sm border-b border-border/10 sticky top-0 z-40">
        {/* ROW 1 */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-2">
          <button
            onClick={() => setShowSheet(true)}
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity py-1"
          >
            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${isAll ? 'bg-secondary' : 'bg-primary/15'}`}>
              <MapPin className={`w-3 h-3 ${isAll ? 'text-muted-foreground' : 'text-primary'}`} />
            </div>
            <span className={`text-[14px] font-bold leading-none ${isAll ? 'text-muted-foreground' : 'text-foreground'}`}>
              {cityLabel}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {showMapToggle && onMapToggle && (
            <button
              onClick={onMapToggle}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200 active:scale-[0.95] text-[12px] font-bold border ${
                isMapMode
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border/25 text-foreground'
              }`}
            >
              {isMapMode
                ? <><List className="w-3.5 h-3.5" /> List</>
                : <><Map className="w-3.5 h-3.5 text-primary" /> Map</>
              }
            </button>
          )}
        </div>

        {/* ROW 2 — filter chips */}
        {suggestions.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-2.5">
            {suggestions.map(s => {
              const isActive = activeFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(category, s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.95] border ${
                    isActive
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'border-border/20 text-muted-foreground bg-card/50'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showSheet && (
        <CitySheet
          currentCity={city}
          recentCities={recentCities}
          onSelect={setCity}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}