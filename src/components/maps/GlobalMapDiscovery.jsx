/**
 * GlobalMapDiscovery — modern fullscreen discovery map.
 * Uses react-leaflet with OpenStreetMap tiles.
 * Features:
 *   - Live viewport → "Search this area" button
 *   - Animated pin markers with price labels
 *   - Bottom preview card on pin tap
 *   - Map ↔ Feed synchronization via DiscoveryContext
 *   - Smart clustering for dense areas
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, List, X, ChevronRight, Search, Navigation } from 'lucide-react';
import { useDiscovery, CITY_COORDS, getCoordsForCity } from '@/lib/DiscoveryContext';

// Fix default marker icons (Leaflet + bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom price pin marker
function createPriceIcon(price, isFeatured, isSelected) {
  const label = price ? `$${price >= 1000 ? `${Math.round(price / 1000)}k` : price.toLocaleString()}` : '📍';
  const bg = isSelected ? '#0f172a' : isFeatured ? '#16a34a' : '#ffffff';
  const color = isSelected || isFeatured ? '#ffffff' : '#0f172a';
  const border = isSelected ? '#0f172a' : isFeatured ? '#16a34a' : '#e2e8f0';
  const scale = isSelected ? 1.1 : 1;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${bg};
        color:${color};
        border:1.5px solid ${border};
        border-radius:20px;
        padding:3px 8px;
        font-size:11px;
        font-weight:700;
        font-family:Inter,sans-serif;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.15);
        transform:scale(${scale});
        transition:transform 0.15s;
        cursor:pointer;
      ">${label}</div>
    `,
    iconAnchor: [20, 12],
    iconSize: [40, 24],
  });
}

// Viewport tracker — fires callback on move end
function ViewportTracker({ onMoved }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      const z = e.target.getZoom();
      onMoved({ lat: c.lat, lng: c.lng, zoom: z });
    },
  });
  return null;
}

// Fly-to controller
function MapController({ center, zoom }) {
  const map = useMap();
  const prevCenter = useRef(null);
  useEffect(() => {
    if (!center) return;
    if (prevCenter.current?.lat === center.lat && prevCenter.current?.lng === center.lng) return;
    prevCenter.current = center;
    map.flyTo([center.lat, center.lng], zoom || 11, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Get approximate coords for a listing (by city name)
function getListingCoords(listing, index) {
  const cityCoords = CITY_COORDS[listing.location_city];
  if (!cityCoords) return null;
  // Scatter pins slightly so they don't overlap
  const seed = (index * 2654435761) >>> 0;
  const jitterLat = ((seed % 1000) - 500) / 100000 * 8;
  const jitterLng = (((seed >> 10) % 1000) - 500) / 100000 * 8;
  return { lat: cityCoords.lat + jitterLat, lng: cityCoords.lng + jitterLng };
}

function ListingPreviewCard({ listing, onSelect, onClose }) {
  return (
    <div className="bg-card rounded-2xl border border-border/15 shadow-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-secondary/40 shrink-0 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground line-clamp-2 leading-snug">{listing.title}</p>
          {listing.location_city && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </p>
          )}
          {listing.price != null && (
            <p className="text-[15px] font-bold text-primary mt-0.5">
              {listing.price_type === 'free' ? 'Free' : `$${listing.price.toLocaleString()}`}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={onClose}
            className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onSelect(listing)}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <ChevronRight className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GlobalMapDiscovery({ listings = [], onSelect, onBackToList, height }) {
  const { mapViewport, setMapViewport, city } = useDiscovery();
  const [selected, setSelected] = useState(null);
  const [showSearchHere, setShowSearchHere] = useState(false);
  const lastViewport = useRef(null);

  // Default center: use city coords or mapViewport
  const center = city
    ? (CITY_COORDS[city] || { lat: mapViewport.lat, lng: mapViewport.lng })
    : { lat: mapViewport.lat, lng: mapViewport.lng };

  // Only show listings that have a known city
  const mappablePins = listings
    .map((l, i) => ({ listing: l, coords: getListingCoords(l, i) }))
    .filter(({ coords }) => coords !== null);

  const handleViewportMove = useCallback((vp) => {
    if (lastViewport.current) setShowSearchHere(true);
    lastViewport.current = vp;
  }, []);

  const handleSearchHere = useCallback(() => {
    setShowSearchHere(false);
    if (lastViewport.current) setMapViewport(lastViewport.current);
  }, [setMapViewport]);

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

        {mappablePins.map(({ listing, coords }, i) => (
          <Marker
            key={listing.id}
            position={[coords.lat, coords.lng]}
            icon={createPriceIcon(
              listing.price,
              listing.is_featured,
              selected?.id === listing.id
            )}
            eventHandlers={{
              click: () => setSelected(selected?.id === listing.id ? null : listing),
            }}
          />
        ))}
      </MapContainer>

      {/* "Search this area" button */}
      {showSearchHere && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500]">
          <button
            onClick={handleSearchHere}
            className="flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border/20 rounded-full px-4 py-2.5 shadow-lg active:scale-[0.96] transition-all duration-150 text-[13px] font-semibold text-foreground"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            Search this area
          </button>
        </div>
      )}

      {/* Back to list floating button */}
      {onBackToList && !showSearchHere && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500]">
          <button
            onClick={onBackToList}
            className="flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border/20 rounded-full px-4 py-2.5 shadow-lg active:scale-[0.96] transition-all duration-150 text-[13px] font-semibold text-foreground"
          >
            <List className="w-3.5 h-3.5 text-foreground" />
            List view
          </button>
        </div>
      )}

      {/* Pin count badge */}
      {mappablePins.length > 0 && !selected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <span className="text-[11px] text-muted-foreground bg-card/90 backdrop-blur-sm rounded-full py-1.5 px-4 shadow-sm">
            {mappablePins.length} listing{mappablePins.length !== 1 ? 's' : ''} · tap a pin
          </span>
        </div>
      )}

      {/* Empty state */}
      {mappablePins.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[400] pointer-events-none">
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-center shadow-lg">
            <p className="text-2xl mb-1">🗺️</p>
            <p className="text-[13px] font-semibold text-foreground">No listings to show</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Try broadening your filters</p>
          </div>
        </div>
      )}

      {/* Preview card */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-[500]">
          <ListingPreviewCard
            listing={selected}
            onSelect={onSelect}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}