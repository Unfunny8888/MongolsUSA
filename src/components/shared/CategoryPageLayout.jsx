/**
 * CategoryPageLayout — shared UI primitives for all category pages.
 *
 * DESIGN TOKENS:
 *   Card:        bg-card rounded-2xl border border-border/15
 *   Section hdr: text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest
 *   Body text:   text-[13px] text-foreground leading-snug
 *   Meta text:   text-[11px] text-muted-foreground
 *   Price:       text-[14px] font-bold text-primary
 *   Tap state:   active:scale-[0.98] transition-all duration-150
 */

// ─── SUB-TABS ────────────────────────────────────────────────────────────────
export function SubTabs({ tabs, active, onSelect }) {
  return (
    <div className="flex border-b border-border/10 px-4 bg-background">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`py-2.5 mr-6 text-[13px] font-semibold border-b-2 transition-all duration-150 shrink-0 ${
            active === id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
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
      {subtitle && (
        <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

// ─── ROW CARD ────────────────────────────────────────────────────────────────
export function RowCard({ left, title, subtitle, meta, right, onClick, className = '' }) {
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
        {meta && (
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}