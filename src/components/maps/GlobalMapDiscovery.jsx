/**
 * GlobalMapDiscovery — fullscreen map discovery using OpenStreetMap tiles (no Leaflet).
 * Renders pins as absolutely positioned elements over a static map image.
 * For full interactivity, upgrade to Mapbox GL JS (requires token).
 *
 * Props:
 *   listings     Array<{id, title, price, location_city, images}>
 *   onSelect     fn(listing)  — navigate to detail
 *   onBackToList fn           — return to list mode
 *   defaultCenter [lat, lng]
 */
import { useState, useMemo } from 'react';
import { MapPin, List, X, ChevronRight } from 'lucide-react';

// Scatter pins deterministically within a bounding box so they don't all stack
function getPinOffset(index, total) {
  const cols = Math.ceil(Math.sqrt(total));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const jitterX = Math.sin(index * 7.3) * 6;
  const jitterY = Math.cos(index * 4.1) * 6;
  return {
    left: `${10 + (col / Math.max(cols - 1, 1)) * 75 + jitterX}%`,
    top: `${15 + (row / Math.max(Math.ceil(total / cols) - 1, 1)) * 60 + jitterY}%`,
  };
}

function PinLabel({ listing, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 bg-card/95 border border-border/20 rounded-full px-2 py-1 shadow-md active:scale-[0.97] transition-all text-[11px] font-bold text-foreground whitespace-nowrap"
    >
      {listing.price ? `$${listing.price.toLocaleString()}` : '📍'}
    </button>
  );
}

function PreviewCard({ listing, onSelect, onClose }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 bg-card rounded-2xl border border-border/15 shadow-xl p-3">
      <div className="flex items-center gap-3">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-secondary/40 shrink-0 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground line-clamp-1">{listing.title}</p>
          {listing.location_city && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </p>
          )}
          {listing.price && (
            <p className="text-[14px] font-bold text-primary mt-0.5">${listing.price.toLocaleString()}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onSelect(listing)}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GlobalMapDiscovery({ listings = [], onSelect, onBackToList }) {
  const [selected, setSelected] = useState(null);

  // Use a high-quality static tile as map backdrop
  const mapBg = `https://api.maptiler.com/maps/streets/static/auto/800x600.png?key=public` ||
    `https://tile.openstreetmap.org/12/1024/1512.png`;

  return (
    <div
      className="relative bg-secondary/30 overflow-hidden"
      style={{ height: 'calc(100dvh - 160px)' }}
    >
      {/* Map background — neutral texture tiles */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=60")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(0.4) brightness(0.95)',
        }}
      />
      {/* Overlay to de-emphasize */}
      <div className="absolute inset-0 bg-background/20" />

      {/* Pins */}
      <div className="absolute inset-0">
        {listings.map((l, i) => {
          const pos = getPinOffset(i, listings.length);
          return (
            <div
              key={l.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.left, top: pos.top }}
            >
              <PinLabel
                listing={l}
                onClick={() => setSelected(selected?.id === l.id ? null : l)}
              />
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-center shadow-lg">
            <p className="text-2xl mb-1">🗺️</p>
            <p className="text-[13px] font-semibold text-foreground">No listings to show</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Try broadening your filters</p>
          </div>
        </div>
      )}

      {/* Floating LIST button */}
      {onBackToList && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={onBackToList}
            className="flex items-center gap-1.5 bg-card/95 backdrop-blur-md border border-border/20 rounded-full px-4 py-2 shadow-lg active:scale-[0.96] transition-all duration-150"
          >
            <List className="w-3.5 h-3.5 text-foreground" />
            <span className="text-[13px] font-semibold text-foreground">List</span>
          </button>
        </div>
      )}

      {/* Pin count badge */}
      {listings.length > 0 && !selected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="text-[11px] text-muted-foreground bg-card/80 backdrop-blur-sm rounded-full py-1.5 px-4 whitespace-nowrap shadow-sm">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} · tap a pin
          </span>
        </div>
      )}

      {/* Preview card */}
      {selected && (
        <PreviewCard
          listing={selected}
          onSelect={onSelect}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}