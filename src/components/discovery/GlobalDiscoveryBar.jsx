/**
 * GlobalDiscoveryBar — integrated discovery header.
 * Feels like part of the content stream, not a floating widget.
 * Sticky during scroll, compresses smoothly.
 */
import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Map, List, SlidersHorizontal } from 'lucide-react';
import { useDiscovery } from '@/lib/DiscoveryContext';
import CitySheet from './CitySheet';

export default function GlobalDiscoveryBar({
  category,
  suggestions = [],
  showMapToggle = false,
  isMapMode = false,
  onMapToggle,
}) {
  const { city, setCity, recentCities, getFilter, setFilter, searchAreaViewport, clearSearchArea } = useDiscovery();
  const [showSheet, setShowSheet] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const scrollRef = useRef(null);

  const activeFilter = getFilter(category);
  const cityLabel = city ? city.split(',')[0] : 'Anywhere';
  const isAll = !city;

  // Listen to the main scroll container to compress on scroll
  useEffect(() => {
    const scroller = document.querySelector('main') || document.body;
    let lastY = 0;
    const onScroll = () => {
      const y = scroller.scrollTop ?? window.scrollY;
      setCompressed(y > 48 && y > lastY);
      lastY = y;
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Sticky wrapper — zero gap between bar and content */}
      <div
        ref={scrollRef}
        className={`sticky top-0 z-40 bg-background/98 backdrop-blur-md border-b border-border/8 transition-all duration-200 ${
          compressed ? 'shadow-sm' : ''
        }`}
      >
        {/* ROW 1 — city + map toggle */}
        <div className={`flex items-center justify-between px-4 transition-all duration-200 ${
          compressed ? 'pt-1.5 pb-1.5' : 'pt-3 pb-2'
        }`}>
          {/* City selector */}
          <button
            onClick={() => setShowSheet(true)}
            className="flex items-center gap-1.5 active:opacity-60 transition-opacity"
          >
            <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
              isAll ? 'bg-muted' : 'bg-primary/15'
            }`}>
              <MapPin className={`w-3 h-3 ${isAll ? 'text-muted-foreground' : 'text-primary'}`} />
            </div>
            <span className={`font-bold leading-none transition-all ${
              compressed ? 'text-[13px]' : 'text-[15px]'
            } ${isAll ? 'text-muted-foreground' : 'text-foreground'}`}>
              {cityLabel}
            </span>
            <ChevronDown className={`text-muted-foreground transition-all ${compressed ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
          </button>

          <div className="flex items-center gap-2">
            {/* "Search area active" badge */}
            {searchAreaViewport && (
              <button
                onClick={clearSearchArea}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1 active:opacity-70"
              >
                Area active ✕
              </button>
            )}

            {/* Map / List toggle */}
            {showMapToggle && onMapToggle && (
              <button
                onClick={onMapToggle}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold border transition-all duration-200 active:scale-[0.95] ${
                  isMapMode
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border/30 text-foreground bg-card'
                }`}
              >
                {isMapMode
                  ? <><List className="w-3.5 h-3.5" /> List</>
                  : <><Map className={`w-3.5 h-3.5 ${isMapMode ? '' : 'text-primary'}`} /> Map</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ROW 2 — filter chips (hide when compressed + no active filter) */}
        {suggestions.length > 0 && (!compressed || activeFilter) && (
          <div className={`flex gap-1.5 overflow-x-auto no-scrollbar px-4 transition-all duration-200 ${
            compressed ? 'pb-1.5' : 'pb-2.5'
          }`}>
            {suggestions.map(s => {
              const isActive = activeFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(category, s)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.94] border ${
                    isActive
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'border-border/25 text-muted-foreground bg-transparent hover:border-border/50'
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
          onSelect={(c) => { setCity(c); setShowSheet(false); }}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}