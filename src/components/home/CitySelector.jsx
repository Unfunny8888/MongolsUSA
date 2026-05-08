import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

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

  const handleSelectCity = async (selectedCity) => {
    onCityChange(selectedCity);
    setIsOpen(false);

    // Save to user profile if authenticated
    const authed = await base44.auth.isAuthenticated();
    if (authed && selectedCity !== "All Cities") {
      await base44.auth.updateMe({ preferred_city: selectedCity }).catch(() => {});
    }
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
              className={`w-full text-left px-4 py-2.5 text-sm transition-smooth ${
                city === c
                  ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
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