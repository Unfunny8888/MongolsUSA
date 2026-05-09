import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function SectionHeader({ title, subtitle, linkTo, linkLabel = "See all", icon: Icon }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary" strokeWidth={2} />}
        <div>
          <h2 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary/80 transition-smooth">
          {linkLabel} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}