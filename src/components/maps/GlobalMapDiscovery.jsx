/**
 * GlobalMapDiscovery — fully synchronized discovery map.
 *
 * Feed ↔ Map are ONE system:
 *   - pins come from the SAME filtered listings array as the feed
 *   - tapping a pin → highlights listing in feed (selectedListingId)
 *   - tapping a feed card → highlights its pin
 *   - moving map → "Search this area" triggers searchThisArea()
 *   - category-aware pin icons (emoji + price)
 *   - smooth fly-to on city change
 */
import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, List, X, ChevronRight, Search, Navigation2 } from 'lucide-react';
import { useDiscovery, CITY_COORDS } from '@/lib/DiscoveryContext';

// ─── Pin icon factory ─────────────────────────────────────────────────────────
const CATEGORY_EMOJI = {
  jobs:        '💼',
  housing:     '🏠',
  cars:        '🚗',
  events:      '🎉',
  services:    '🔧',
  electronics: '📱',
  community:   '🤝',
};

function createPinIcon(listing, isSelected) {
  const price = listing.price;
  const emoji = CATEGORY_EMOJI[listing.category] || '📍';
  const label = price != null
    ? (listing.price_type === 'free' ? 'Free' : `$${price >= 1000 ? `${Math.round(price / 1000)}k` : price.toLocaleString()}`)
    : emoji;

  const bg     = isSelected        ? '#0f172a' : listing.is_featured ? '#16a34a' : '#ffffff';
  const color  = isSelected || listing.is_featured ? '#ffffff' : '#0f172a';
  const border = isSelected        ? '#0f172a' : listing.is_featured ? '#15803d' : '#cbd5e1';
  const shadow = isSelected        ? '0 4px 16px rgba(15,23,42,0.35)' : '0 2px 8px rgba(0,0,0,0.15)';

  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg};color:${color};border:1.5px solid ${border};
      border-radius:20px;padding:3px 9px;font-size:11px;font-weight:700;
      font-family:Inter,system-ui,sans-serif;white-space:nowrap;
      box-shadow:${shadow};cursor:pointer;
      transform:scale(${isSelected ? 1.15 : 1});transition:transform 0.15s,box-shadow 0.15s;
    ">${label}</div>`,
    iconAnchor: [22, 14],
    iconSize:   [44, 28],
  });
}

// ─── Stable jitter so pins don't overlap on same city ────────────────────────
const jitterCache = new Map();
function getListingCoords(listing, index) {
  const cityCoords = CITY_COORDS[listing.location_city];
  if (!cityCoords) return null;
  const key = listing.id || index;
  if (!jitterCache.has(key)) {
    const seed = (String(key).split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 2654435761) >>> 0;
    jitterCache.set(key, {
      lat: ((seed % 1000) - 500) / 80000,
      lng: (((seed >> 10) % 1000) - 500) / 80000,
    });
  }
  const j = jitterCache.get(key);
  return { lat: cityCoords.lat + j.lat, lng: cityCoords.lng + j.lng };
}

// ─── Inner components ─────────────────────────────────────────────────────────
function ViewportTracker({ onMoved }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMoved({ lat: c.lat, lng: c.lng, zoom: e.target.getZoom() });
    },
  });
  return null;
}

function MapController({ center, zoom }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!center) return;
    if (prev.current?.lat === center.lat && prev.current?.lng === center.lng) return;
    prev.current = center;
    map.flyTo([center.lat, center.lng], zoom || 11, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

// Memoized marker to prevent full re-render on every state change
const ListingMarker = memo(function ListingMarker({ listing, coords, isSelected, onClick }) {
  const icon = createPinIcon(listing, isSelected);
  return (
    <Marker
      key={listing.id}
      position={[coords.lat, coords.lng]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    />
  );
});

// Preview card shown on pin tap
function PreviewCard({ listing, onSelect, onClose }) {
  return (
    <div className="bg-card rounded-2xl border border-border/15 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-secondary/40 shrink-0 flex items-center justify-center text-2xl">
            {CATEGORY_EMOJI[listing.category] || '📍'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground line-clamp-2 leading-snug">{listing.title}</p>
          {listing.location_city && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 shrink-0" />{listing.location_city}
            </p>
          )}
          {listing.price != null && (
            <p className="text-[15px] font-bold text-primary mt-1">
              {listing.price_type === 'free' ? 'Free' : `$${listing.price.toLocaleString()}`}
              {listing.price_type === 'hourly' && <span className="text-[11px] font-normal text-muted-foreground">/hr</span>}
              {listing.price_type === 'monthly' && <span className="text-[11px] font-normal text-muted-foreground">/mo</span>}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={onClose}
            className="w-7 h-7 rounded-full bg-secondary/70 flex items-center justify-center active:scale-90">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onSelect(listing)}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center active:scale-90">
            <ChevronRight className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GlobalMapDiscovery({ listings = [], onSelect, onBackToList, height }) {
  const {
    mapViewport, setMapViewport,
    city,
    selectedListingId, setSelectedListingId,
    searchThisArea,
  } = useDiscovery();

  const [pendingViewport, setPendingViewport] = useState(null);
  const initialMove = useRef(false);

  // Center: use city coords or last viewport
  const center = city
    ? (CITY_COORDS[city] || { lat: mapViewport.lat, lng: mapViewport.lng })
    : { lat: mapViewport.lat, lng: mapViewport.lng };

  // Pins: same data as feed, just need coords
  const pins = listings
    .map((l, i) => ({ listing: l, coords: getListingCoords(l, i) }))
    .filter(p => p.coords !== null);

  const selectedListing = listings.find(l => l.id === selectedListingId) || null;

  const handleViewportMove = useCallback((vp) => {
    if (!initialMove.current) { initialMove.current = true; return; } // skip first fire
    setPendingViewport(vp);
    setMapViewport(vp);
  }, [setMapViewport]);

  const handleSearchHere = useCallback(() => {
    if (pendingViewport) searchThisArea(pendingViewport);
    setPendingViewport(null);
  }, [pendingViewport, searchThisArea]);

  const handlePinClick = useCallback((listing) => {
    setSelectedListingId(prev => prev === listing.id ? null : listing.id);
  }, [setSelectedListingId]);

  const mapHeight = height || 'calc(100dvh - 158px)';

  return (
    <div className="relative" style={{ height: mapHeight }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={mapViewport.zoom || 11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
          maxZoom={19}
        />
        <MapController center={center} zoom={mapViewport.zoom} />
        <ViewportTracker onMoved={handleViewportMove} />

        {pins.map(({ listing, coords }) => (
          <ListingMarker
            key={listing.id}
            listing={listing}
            coords={coords}
            isSelected={selectedListingId === listing.id}
            onClick={() => handlePinClick(listing)}
          />
        ))}
      </MapContainer>

      {/* ── "Search this area" — appears after panning ── */}
      {pendingViewport && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500]">
          <button
            onClick={handleSearchHere}
            className="flex items-center gap-2 bg-card/97 backdrop-blur-md border border-border/20 rounded-full px-4 py-2.5 shadow-lg active:scale-[0.96] transition-all duration-150 text-[13px] font-semibold text-foreground"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            Search this area
          </button>
        </div>
      )}

      {/* ── Back to list ── */}
      {onBackToList && !pendingViewport && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500]">
          <button
            onClick={onBackToList}
            className="flex items-center gap-2 bg-card/97 backdrop-blur-md border border-border/20 rounded-full px-4 py-2.5 shadow-lg active:scale-[0.96] transition-all duration-150 text-[13px] font-semibold text-foreground"
          >
            <List className="w-3.5 h-3.5" /> List view
          </button>
        </div>
      )}

      {/* ── Pin count ── */}
      {pins.length > 0 && !selectedListing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <span className="text-[11px] text-muted-foreground bg-card/92 backdrop-blur-sm rounded-full py-1.5 px-4 shadow-sm">
            {pins.length} result{pins.length !== 1 ? 's' : ''} · tap a pin
          </span>
        </div>
      )}

      {/* ── Empty state ── */}
      {pins.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[400] pointer-events-none">
          <div className="bg-card/92 backdrop-blur-sm rounded-2xl px-6 py-5 text-center shadow-lg">
            <p className="text-3xl mb-2">🗺️</p>
            <p className="text-[13px] font-semibold text-foreground">No listings in this area</p>
            <p className="text-[11px] text-muted-foreground mt-1">Try broadening your filters or changing city</p>
          </div>
        </div>
      )}

      {/* ── Preview card on pin tap ── */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 z-[500]">
          <PreviewCard
            listing={selectedListing}
            onSelect={onSelect}
            onClose={() => setSelectedListingId(null)}
          />
        </div>
      )}
    </div>
  );
}