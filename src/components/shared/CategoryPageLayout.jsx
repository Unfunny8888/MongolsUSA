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
import { MapPin, ChevronDown, List, Map } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// ─── DISCOVERY BAR ──────────────────────────────────────────────────────────
/**
 * DiscoveryBar — replaces old LocationBar + FilterBar.
 * A single compact row: [City ▼] [filter chips...] [Map toggle]
 *
 * props:
 *   city          string          e.g. "Chicago, IL"
 *   onCityClick   fn
 *   filters       string[]
 *   activeFilter  string
 *   onFilter      fn(filter)
 *   viewMode      "list" | "map"
 *   onToggleView  fn
 */
export function DiscoveryBar({ city, onCityClick, filters, activeFilter, onFilter, viewMode, onToggleView }) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/10">
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">

        {/* City pill */}
        <button
          onClick={onCityClick}
          className="shrink-0 flex items-center gap-1 bg-card border border-border/25 rounded-full px-3 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-[0.97] transition-all duration-150"
        >
          <MapPin className="w-3 h-3 text-primary" />
          <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">{city}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {/* Divider */}
        <div className="shrink-0 w-px h-4 bg-border/30" />

        {/* Filter chips */}
        {(filters || []).map(f => (
          <button
            key={f}
            onClick={() => onFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.96] ${
              activeFilter === f
                ? "bg-foreground text-background shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}

        {/* Map / List toggle — pinned right */}
        {onToggleView && (
          <>
            <div className="shrink-0 w-px h-4 bg-border/30" />
            <button
              onClick={onToggleView}
              className="shrink-0 flex items-center gap-1 bg-card border border-border/25 rounded-full px-3 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-[0.97] transition-all duration-150"
            >
              {viewMode === "map"
                ? <><List className="w-3 h-3 text-primary" /><span className="text-[12px] font-semibold text-foreground">List</span></>
                : <><Map className="w-3 h-3 text-primary" /><span className="text-[12px] font-semibold text-foreground">Map</span></>
              }
            </button>
          </>
        )}
      </div>
    </div>
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
 * MapDiscovery — Leaflet map with pins + floating bottom card strip.
 * listings: array of { id, title, price, location_city, images, lat?, lng? }
 * onSelect: fn(listing)
 */
export function MapDiscovery({ listings, onSelect, defaultCenter = [41.8781, -87.6298] }) {
  const [selected, setSelected] = useState(null);

  // Scatter pins around center for items without real coordinates
  function pinPosition(listing, i) {
    if (listing.lat && listing.lng) return [listing.lat, listing.lng];
    const seed = i * 0.008;
    return [
      defaultCenter[0] + (Math.sin(i * 2.3) * 0.04),
      defaultCenter[1] + (Math.cos(i * 1.7) * 0.06),
    ];
  }

  return (
    <div className="relative flex-1" style={{ height: "calc(100dvh - 180px)" }}>
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
                {l.price && <div className="text-primary font-bold">${l.price.toLocaleString()}</div>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating card strip at bottom */}
      {selected && (
        <div
          className="absolute bottom-4 left-4 right-4 bg-card rounded-2xl border border-border/20 shadow-lg p-3 cursor-pointer active:scale-[0.99] transition-all z-[1000]"
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
              className="text-[11px] text-muted-foreground shrink-0 px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tap anywhere on map to dismiss */}
      {!selected && listings.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <p className="text-center text-[11px] text-muted-foreground/60 bg-card/80 backdrop-blur-sm rounded-full py-1.5 px-4 w-fit mx-auto">
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