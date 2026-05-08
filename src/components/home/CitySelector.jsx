import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";

// Centralized city list for the entire app
export const AVAILABLE_CITIES = [
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

/**
 * CitySelector - Pure location filter component
 * 
 * Responsibilities:
 * - Display current selected city
 * - Allow switching between cities
 * - Trigger content filtering via onCityChange callback
 * 
 * Does NOT:
 * - Save to user profile
 * - Manage global state
 * - Handle onboarding
 * - Modify other components
 */
export default function CitySelector({ city, onCityChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectCity = (selectedCity) => {
    onCityChange(selectedCity);
    setIsOpen(false);
  };

  const displayCity = city || "All Cities";
  const isAllCities = !city || city === "All Cities";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth active:scale-95"
        aria-label="Select city for filtering"
      >
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">{displayCity}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/50 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {AVAILABLE_CITIES.map((cityName) => {
            const isSelected = isAllCities ? cityName === "All Cities" : city === cityName;
            return (
              <button
                key={cityName}
                onClick={() => handleSelectCity(cityName === "All Cities" ? null : cityName)}
                className={`w-full text-left px-4 py-3 text-sm transition-smooth ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-primary font-semibold border-l-4 border-primary"
                    : "text-foreground hover:bg-secondary/50"
                }`}
              >
                {cityName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}