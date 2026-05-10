/**
 * GlobalDiscoveryBar — universal top discovery strip.
 *
 * ROW 1: [ City selector ▼ ]              [ 🗺 Map ]
 * ROW 2: [ chip ] [ chip ] [ chip ] …
 *
 * City state lives in DiscoveryContext (global).
 * Map toggle is opt-in per page via onMapToggle prop.
 */
import { useState } from 'react';
import { MapPin, ChevronDown, Map } from 'lucide-react';
import { useDiscovery } from '@/lib/DiscoveryContext';
import CitySheet from './CitySheet';

export default function GlobalDiscoveryBar({
  suggestions = [],
  activeSug,
  onSuggest,
  showMapToggle = false,
  onMapToggle,
}) {
  const { city, setCity } = useDiscovery();
  const [showSheet, setShowSheet] = useState(false);

  const cityLabel = city || 'All Cities';
  const isAll = !city;

  return (
    <>
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
              <span className="text-[12px] font-semibold text-foreground">Map</span>
            </button>
          )}
        </div>

        {/* ROW 2 — suggestion chips */}
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

      {showSheet && (
        <CitySheet
          currentCity={city}
          onSelect={setCity}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}