/**
 * CategoryPageLayout — unified design system for ALL category pages.
 *
 * DESIGN TOKENS (apply everywhere):
 *   Card:        bg-card rounded-2xl border border-border/15
 *   Section hdr: text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest
 *   Body text:   text-[13px] text-foreground leading-snug
 *   Meta text:   text-[11px] text-muted-foreground
 *   Price:       text-[14px] font-bold text-primary
 *   Pill active: bg-foreground text-background text-[12px] font-semibold px-3.5 py-1.5 rounded-full
 *   Pill idle:   bg-secondary/50 text-muted-foreground text-[12px] font-semibold px-3.5 py-1.5 rounded-full
 *   Tap state:   active:scale-[0.98] transition-all duration-150
 *   Shadow:      shadow-[0_1px_3px_rgba(0,0,0,0.06)]
 */

import { useState } from "react";
import { MapPin, ChevronDown, List, Map, Search, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// ─── CITY SELECTOR SHEET ─────────────────────────────────────────────────────
const SUGGESTED_CITIES = [
  { label: "Near Me", value: null, icon: "📍" },
  { label: "Chicago, IL", value: "Chicago, IL", icon: null },
  { label: "New York, NY", value: "New York, NY", icon: null },
  { label: "Los Angeles, CA", value: "Los Angeles, CA", icon: null },
  { label: "Houston, TX", value: "Houston, TX", icon: null },
  { label: "Miami, FL", value: "Miami, FL", icon: null },
  { label: "Dallas, TX", value: "Dallas, TX", icon: null },
  { label: "Atlanta, GA", value: "Atlanta, GA", icon: null },
  { label: "San Francisco, CA", value: "San Francisco, CA", icon: null },
];

function CitySheet({ currentCity, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const filtered = query.trim()
    ? SUGGESTED_CITIES.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTED_CITIES;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      {/* Sheet */}
      <div
        className="bg-card rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border/50" />
        </div>
        <div className="px-4 pb-2 pt-1">
          <p className="text-[15px] font-bold text-foreground mb-3">Choose a city</p>
          {/* Search */}
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 mb-3">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cities…"
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          {/* All Cities option */}
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors ${
              !currentCity ? "bg-primary/10 text-primary" : "hover:bg-secondary/50 text-muted-foreground"
            }`}
          >
            <span className="text-[16px]">🌐</span>
            <span className="text-[13px] font-semibold">All Cities</span>
            {!currentCity && <span className="ml-auto text-[10px] font-bold text-primary">Active</span>}
          </button>
        </div>
        {/* City list */}
        <div className="overflow-y-auto px-4 pb-8 space-y-0.5">
          {filtered.filter(c => c.value !== null).map(c => (
            <button
              key={c.label}
              onClick={() => { onSelect(c.value); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                currentCity === c.value ? "bg-primary/10 text-primary" : "hover:bg-secondary/50 text-foreground"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[13px] font-medium">{c.label}</span>
              {currentCity === c.value && <span className="ml-auto text-[10px] font-bold text-primary">Active</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DISCOVERY BAR ──────────────────────────────────────────────────────────
/**
 * TWO-ROW discovery area:
 *   Row 1: [ All Cities / City ▼ ]          [ 🗺 Check on map ]
 *   Row 2: scrollable suggestion pills
 *
 * props:
 *   city          string | null   null = "All Cities" (soft rank), string = hard filter
 *   onCityChange  fn(city | null)
 *   suggestions   string[]        e.g. ["Nearby", "Top Rated", "Open Now"]
 *   activeSug     string
 *   onSuggest     fn(sug)
 *   viewMode      "list" | "map"
 *   onToggleView  fn
 */
export function DiscoveryBar({ city, onCityChange, suggestions, activeSug, onSuggest, viewMode, onToggleView,
  // legacy compat aliases
  filters, activeFilter, onFilter, onCityClick,
}) {
  const [showCitySheet, setShowCitySheet] = useState(false);

  // Support legacy prop names
  const chips = suggestions || filters || [];
  const activeChip = activeSug ?? activeFilter;
  const handleChip = onSuggest || onFilter || (() => {});
  const handleCityChange = onCityChange || (() => {});

  const cityLabel = city || "All Cities";
  const isAllCities = !city;

  return (
    <>
      <div className="sticky top-0 z-20 bg-background/97 backdrop-blur-xl border-b border-border/10">
        {/* ROW 1 — location + map toggle */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-2">
          <button
            onClick={() => setShowCitySheet(true)}
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isAllCities ? "text-muted-foreground" : "text-primary"}`} />
            <span className={`text-[14px] font-semibold ${isAllCities ? "text-muted-foreground" : "text-foreground"}`}>
              {cityLabel}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {onToggleView && viewMode !== "map" && (
            <button
              onClick={onToggleView}
              className="flex items-center gap-1.5 bg-card border border-border/25 rounded-full px-3 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-[0.96] transition-all duration-150"
            >
              <Map className="w-3 h-3 text-primary" />
              <span className="text-[12px] font-semibold text-foreground">Check on map</span>
            </button>
          )}
        </div>

        {/* ROW 2 — suggestion pills */}
        {chips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2.5">
            {chips.map(f => (
              <button
                key={f}
                onClick={() => handleChip(f)}
                className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.96] ${
                  activeChip === f
                    ? "bg-foreground text-background"
                    : "text-muted-foreground border border-border/20 bg-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {showCitySheet && (
        <CitySheet
          currentCity={city}
          onSelect={handleCityChange}
          onClose={() => setShowCitySheet(false)}
        />
      )}
    </>
  );
}

// ─── SUB-TABS ────────────────────────────────────────────────────────────────
export function SubTabs({ tabs, active, onSelect }) {
  return (
    <div className="flex border-b border-border/15 px-4 bg-card/60">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`py-2.5 mr-6 text-[13px] font-semibold border-b-2 transition-all duration-150 shrink-0 ${
            active === id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────
export function SectionLabel({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
        {children}
      </p>
      {action}
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ emoji, title, subtitle }) {
  return (
    <div className="text-center py-16 px-8">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="text-[14px] font-semibold text-foreground">{title}</p>
      {subtitle && <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// ─── ROW CARD ────────────────────────────────────────────────────────────────
export function RowCard({ left, title, subtitle, meta, right, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 bg-card border border-border/15 rounded-2xl px-3 py-3 active:scale-[0.98] cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      {left}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground leading-snug line-clamp-1">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        {meta && <div className="flex items-center gap-2 mt-1.5 flex-wrap">{meta}</div>}
      </div>
      {right}
    </div>
  );
}

// ─── IMAGE CARD ──────────────────────────────────────────────────────────────
export function ImageCard({ imageSrc, imageAlt, imageFallback, priceOverlay, title, meta, topRight, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border/15 rounded-2xl overflow-hidden active:scale-[0.98] cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <div className="relative">
        {imageSrc ? (
          <img src={imageSrc} alt={imageAlt} className="w-full h-44 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-44 bg-secondary/25 flex items-center justify-center">
            {imageFallback}
          </div>
        )}
        {topRight && <div className="absolute top-3 right-3">{topRight}</div>}
        {priceOverlay && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[13px] font-bold px-2.5 py-1 rounded-xl">
            {priceOverlay}
          </div>
        )}
      </div>
      <div className="px-3 py-3">
        <p className="text-[13px] font-bold text-foreground leading-snug line-clamp-1">{title}</p>
        {meta && <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">{meta}</div>}
      </div>
    </div>
  );
}

// ─── MAP VIEW ────────────────────────────────────────────────────────────────
/**
 * MapDiscovery — full map mode with floating List button + pin preview card.
 * listings: array of { id, title, price, location_city, images, lat?, lng? }
 * onSelect: fn(listing)   — navigate to detail
 * onBackToList: fn        — return to list mode
 */
export function MapDiscovery({ listings, onSelect, onBackToList, defaultCenter = [41.8781, -87.6298] }) {
  const [selected, setSelected] = useState(null);

  function pinPosition(listing, i) {
    if (listing.lat && listing.lng) return [listing.lat, listing.lng];
    return [
      defaultCenter[0] + (Math.sin(i * 2.3) * 0.04),
      defaultCenter[1] + (Math.cos(i * 1.7) * 0.06),
    ];
  }

  return (
    <div className="relative" style={{ height: "calc(100dvh - 160px)" }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />
        {listings.map((l, i) => {
          const pos = pinPosition(l, i);
          return (
            <Marker
              key={l.id}
              position={pos}
              eventHandlers={{ click: () => setSelected(l) }}
            >
              <Popup>
                <div className="text-[12px] font-semibold">{l.title}</div>
                {l.price && <div className="font-bold">${l.price.toLocaleString()}</div>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating LIST button — top center */}
      {onBackToList && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={onBackToList}
            className="flex items-center gap-1.5 bg-card/95 backdrop-blur-md border border-border/20 rounded-full px-4 py-2 shadow-lg active:scale-[0.96] transition-all duration-150"
          >
            <List className="w-3.5 h-3.5 text-foreground" />
            <span className="text-[13px] font-semibold text-foreground">List</span>
          </button>
        </div>
      )}

      {/* Floating preview card — bottom */}
      {selected ? (
        <div
          className="absolute bottom-4 left-4 right-4 bg-card rounded-2xl border border-border/15 shadow-xl p-3 cursor-pointer active:scale-[0.99] transition-all z-[1000]"
          onClick={() => onSelect(selected)}
        >
          <div className="flex items-center gap-3">
            {selected.images?.[0] ? (
              <img src={selected.images[0]} alt={selected.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-secondary/30 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground line-clamp-1">{selected.title}</p>
              {selected.location_city && (
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />{selected.location_city}
                </p>
              )}
              {selected.price && (
                <p className="text-[14px] font-bold text-primary mt-0.5">${selected.price.toLocaleString()}</p>
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); setSelected(null); }}
              className="shrink-0 w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <p className="text-[11px] text-muted-foreground/70 bg-card/80 backdrop-blur-sm rounded-full py-1.5 px-4 whitespace-nowrap shadow-sm">
            Tap a pin to preview
          </p>
        </div>
      )}
    </div>
  );
}

// ─── KEPT FOR BACKWARD COMPAT (deprecated) ───────────────────────────────────
/** @deprecated Use DiscoveryBar instead */
export function LocationBar({ location, onChangeClick }) {
  return (
    <div className="px-4 py-2 border-b border-border/10 bg-card/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-primary" />
          <p className="text-[13px] font-semibold text-foreground">{location}</p>
        </div>
        {onChangeClick && (
          <button onClick={onChangeClick} className="text-[11px] font-semibold text-primary">Change</button>
        )}
      </div>
    </div>
  );
}

/** @deprecated Use DiscoveryBar instead */
export function FilterBar({ filters, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5 border-b border-border/10">
      {filters.map(f => (
        <button key={f} onClick={() => onSelect(f)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
            active === f ? "bg-foreground text-background" : "bg-secondary/50 text-muted-foreground"
          }`}>{f}</button>
      ))}
    </div>
  );
}