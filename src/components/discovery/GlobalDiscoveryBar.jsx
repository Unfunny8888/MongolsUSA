/**
 * GlobalDiscoveryBar — ultra-minimal discovery strip.
 * Feels like part of the feed, not a separate widget.
 * City selection lives in PageHeader. This handles filter chips + map toggle only.
 */
import { useRef, useEffect, useState } from 'react';
import { Map, List } from 'lucide-react';
import { useDiscovery } from '@/lib/DiscoveryContext';

export default function GlobalDiscoveryBar({
  category,
  suggestions = [],
  showMapToggle = false,
  isMapMode = false,
  onMapToggle,
}) {
  const { getFilter, setFilter, searchAreaViewport, clearSearchArea } = useDiscovery();
  const activeFilter = getFilter(category);

  if (!suggestions.length && !showMapToggle && !searchAreaViewport) return null;

  return (
    <div className="sticky top-0 z-40 bg-background/98 backdrop-blur-md border-b border-border/10">
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        {/* Area active badge */}
        {searchAreaViewport && (
          <button
            onClick={clearSearchArea}
            className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 active:opacity-70"
          >
            📍 Area active ✕
          </button>
        )}

        {/* Filter chips */}
        {suggestions.map(s => {
          const isActive = activeFilter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(category, s)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.94] border ${
                isActive
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border/20 text-muted-foreground bg-transparent'
              }`}
            >
              {s}
            </button>
          );
        })}

        {/* Map toggle — pinned to right */}
        {showMapToggle && onMapToggle && (
          <button
            onClick={onMapToggle}
            className={`shrink-0 ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold border transition-all duration-200 active:scale-[0.95] ${
              isMapMode
                ? 'bg-foreground text-background border-foreground'
                : 'border-border/20 text-foreground bg-card'
            }`}
          >
            {isMapMode
              ? <><List className="w-3.5 h-3.5" /> List</>
              : <><Map className="w-3.5 h-3.5 text-primary" /> Map</>
            }
          </button>
        )}
      </div>
    </div>
  );
}