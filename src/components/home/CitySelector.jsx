import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";

const CITIES = [
  "All Cities",
  "Chicago",
  "New York",
  "Los Angeles",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Denver",
  "Seattle",
  "Boston",
  "Miami",
  "Portland",
  "Atlanta",
];

export default function CitySelector({ city, onCityChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectCity = (selectedCity) => {
    onCityChange(selectedCity);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth active:scale-95"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{city}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/50 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => handleSelectCity(c)}
              className={`w-full text-left px-4 py-3 text-sm transition-smooth ${
              city === c || (city === null && c === "All Cities")
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-primary font-semibold border-l-4 border-primary"
              : "text-foreground hover:bg-secondary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}