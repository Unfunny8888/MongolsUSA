/**
 * CategoryPageLayout — the ONE shared shell for ALL category pages.
 * Every category page (Jobs, Housing, Services, Events, Vehicles, etc.)
 * uses this exact same layout system.
 */

/** Location bar — sticky, standardized */
export function LocationBar({ location, onChangeClick }) {
  return (
    <div className="px-4 py-2.5 border-b border-border/15 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Location</p>
          <p className="text-[13px] font-bold text-foreground">{location}</p>
        </div>
        {onChangeClick && (
          <button onClick={onChangeClick} className="text-[12px] font-semibold text-primary">
            Change
          </button>
        )}
      </div>
    </div>
  );
}

/** Filter chips — standardized horizontal scroll row */
export function FilterBar({ filters, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5 border-b border-border/10">
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
            active === f
              ? "bg-foreground text-background"
              : "bg-secondary/60 text-muted-foreground"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

/** Sub-tabs — standardized tab row */
export function SubTabs({ tabs, active, onSelect }) {
  return (
    <div className="flex border-b border-border/20 px-4 bg-card">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`py-3 mr-5 text-[13px] font-semibold border-b-2 transition-colors shrink-0 ${
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

/** Section label — standardized uppercase section header */
export function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

/** Empty state — standardized */
export function EmptyState({ emoji, title, subtitle }) {
  return (
    <div className="text-center py-16">
      <p className="text-3xl mb-2">{emoji}</p>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

/** Row card — used by jobs, services, vehicles in list view */
export function RowCard({ left, title, subtitle, meta, right, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 bg-card border border-border/20 rounded-2xl px-3 py-3 active:scale-[0.99] cursor-pointer transition-transform ${className}`}
    >
      {left}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold text-foreground leading-snug line-clamp-1">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        {meta && <div className="flex items-center gap-2 mt-1 flex-wrap">{meta}</div>}
      </div>
      {right}
    </div>
  );
}

/** Image card — housing-style card with big image */
export function ImageCard({ imageSrc, imageAlt, imageFallback, priceOverlay, title, meta, topRight, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border/20 rounded-2xl overflow-hidden active:scale-[0.99] cursor-pointer transition-transform"
    >
      <div className="relative">
        {imageSrc ? (
          <img src={imageSrc} alt={imageAlt} className="w-full h-44 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-44 bg-secondary/30 flex items-center justify-center">
            {imageFallback}
          </div>
        )}
        {topRight && <div className="absolute top-3 right-3">{topRight}</div>}
        {priceOverlay && (
          <div className="absolute bottom-3 left-3 bg-foreground/80 backdrop-blur text-background text-[13px] font-bold px-2.5 py-1 rounded-xl">
            {priceOverlay}
          </div>
        )}
      </div>
      <div className="px-3 py-3">
        <p className="text-[13.5px] font-bold text-foreground leading-snug line-clamp-1">{title}</p>
        {meta && <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">{meta}</div>}
      </div>
    </div>
  );
}