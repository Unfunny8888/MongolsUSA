/**
 * DiscoveryContext — THE global discovery engine.
 *
 * city:        null = "All Cities" (soft proximity ranking via coords)
 *              string = hard city filter
 * coords:      { lat, lng } | null — device/IP approximate location
 * radius:      discovery radius in miles (default 50)
 * filters:     per-category active filter chips
 * viewModes:   "list" | "map" per category
 * mapViewport: last known map center/zoom (synced across pages)
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const DiscoveryContext = createContext(null);

const CATEGORIES = ['home', 'jobs', 'housing', 'services', 'events', 'vehicles', 'marketplace', 'rideshare'];

// Approximate coords for Mongolian community hubs
const CITY_COORDS = {
  'Chicago, IL':       { lat: 41.8781, lng: -87.6298 },
  'New York, NY':      { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, CA':   { lat: 34.0522, lng: -118.2437 },
  'Houston, TX':       { lat: 29.7604, lng: -95.3698 },
  'Miami, FL':         { lat: 25.7617, lng: -80.1918 },
  'Dallas, TX':        { lat: 32.7767, lng: -96.7970 },
  'Atlanta, GA':       { lat: 33.7490, lng: -84.3880 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Detroit, MI':       { lat: 42.3314, lng: -83.0458 },
  'Minneapolis, MN':   { lat: 44.9778, lng: -93.2650 },
  'Denver, CO':        { lat: 39.7392, lng: -104.9903 },
  'Seattle, WA':       { lat: 47.6062, lng: -122.3321 },
  'Boston, MA':        { lat: 42.3601, lng: -71.0589 },
  'Phoenix, AZ':       { lat: 33.4484, lng: -112.0740 },
  'Washington, DC':    { lat: 38.9072, lng: -77.0369 },
};

// Haversine distance in miles
export function distanceMiles(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lat2) return 9999;
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geographic ranking score for a listing (0–100, higher = show first)
export function rankListing(listing, userCoords, activeFilter) {
  let score = 50;

  // Recency boost (0–20 pts)
  const ageHours = listing.created_date
    ? (Date.now() - new Date(listing.created_date)) / 3600000
    : 720;
  score += Math.max(0, 20 - ageHours / 24);

  // Engagement boost (0–15 pts)
  score += Math.min(15, (listing.views || 0) * 0.05 + (listing.saves || 0) * 0.5);

  // Featured / boosted (10 pts)
  if (listing.is_featured) score += 10;
  if (listing.is_boosted) score += 6;

  // Geographic proximity (0–30 pts) — only when we have coords
  if (userCoords && listing.location_city) {
    const cityC = CITY_COORDS[listing.location_city] || CITY_COORDS[`${listing.location_city}`];
    if (cityC) {
      const miles = distanceMiles(userCoords.lat, userCoords.lng, cityC.lat, cityC.lng);
      score += Math.max(0, 30 - miles * 0.3);
    }
  }

  // Verified poster boost
  if (listing.poster_verified) score += 5;

  return score;
}

export function getCoordsForCity(city) {
  return CITY_COORDS[city] || null;
}

export { CITY_COORDS };

export function DiscoveryProvider({ children }) {
  const [city, _setCity] = useState(() => {
    try { return localStorage.getItem('disco_city') || null; } catch { return null; }
  });
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(50);
  const [recentCities, setRecentCities] = useState(() => {
    try { return JSON.parse(localStorage.getItem('disco_recent') || '[]'); } catch { return []; }
  });
  const [mapViewport, setMapViewport] = useState({ lat: 41.8781, lng: -87.6298, zoom: 10 });

  const [filterMemory, setFilterMemory] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c, null]))
  );
  const [viewModes, setViewModes] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c, 'list']))
  );

  // Attempt geolocation on mount (non-blocking)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setMapViewport(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        },
        () => {} // silent fail — use default
      );
    }
  }, []);

  const setCity = useCallback((val) => {
    _setCity(val);
    try { 
      if (val) localStorage.setItem('disco_city', val);
      else localStorage.removeItem('disco_city');
    } catch {}

    // Update map viewport when city changes
    if (val && CITY_COORDS[val]) {
      setMapViewport({ lat: CITY_COORDS[val].lat, lng: CITY_COORDS[val].lng, zoom: 11 });
    }

    // Track recent cities
    if (val) {
      setRecentCities(prev => {
        const next = [val, ...prev.filter(c => c !== val)].slice(0, 5);
        try { localStorage.setItem('disco_recent', JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }, []);

  const setFilter = useCallback((category, filter) => {
    setFilterMemory(prev => ({ ...prev, [category]: prev[category] === filter ? null : filter }));
  }, []);

  const setViewMode = useCallback((category, mode) => {
    setViewModes(prev => ({ ...prev, [category]: mode }));
  }, []);

  const getFilter = useCallback((category) => filterMemory[category], [filterMemory]);
  const getViewMode = useCallback((category) => viewModes[category] ?? 'list', [viewModes]);

  // Apply location + filter to a listings array → ranked result
  const applyDiscovery = useCallback((listings, category, activeFilter) => {
    if (!listings?.length) return [];
    let result = [...listings];

    // Hard city filter
    if (city) {
      result = result.filter(l =>
        !l.location_city || l.location_city === city || l.location_city.includes(city.split(',')[0])
      );
    }

    const filter = activeFilter ?? filterMemory[category];

    // Filter chip logic
    if (filter === 'Nearby') {
      if (city) {
        // already hard-filtered, no-op
      } else if (coords) {
        result = result.filter(l => {
          const c = CITY_COORDS[l.location_city];
          if (!c) return true;
          return distanceMiles(coords.lat, coords.lng, c.lat, c.lng) <= radius;
        });
      }
    } else if (filter === 'Free') {
      result = result.filter(l => l.price_type === 'free' || l.price === 0);
    } else if (filter === 'Verified') {
      result = result.filter(l => l.poster_verified || l.is_featured);
    } else if (filter === 'Top Rated') {
      result = result.sort((a, b) => (b.saves || 0) - (a.saves || 0));
    } else if (filter === 'Recently Posted') {
      result = result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (filter === 'Remote') {
      result = result.filter(l =>
        l.tags?.some(t => t.toLowerCase().includes('remote')) ||
        l.description?.toLowerCase().includes('remote') ||
        l.title?.toLowerCase().includes('remote')
      );
    } else if (filter === 'Full-time') {
      result = result.filter(l => l.job_type === 'full-time');
    } else if (filter === 'Part-time') {
      result = result.filter(l => l.job_type === 'part-time');
    } else if (filter === 'Open Now') {
      // Approximate — in future connect to hours data
      result = result.filter(l => l.status === 'active');
    }

    // Geographic ranking sort (when no hard sort applied)
    if (!['Top Rated', 'Recently Posted'].includes(filter)) {
      result = result.sort((a, b) => rankListing(b, coords, filter) - rankListing(a, coords, filter));
    }

    return result;
  }, [city, coords, radius, filterMemory]);

  return (
    <DiscoveryContext.Provider value={{
      city, setCity,
      coords, setCoords,
      radius, setRadius,
      recentCities,
      mapViewport, setMapViewport,
      filterMemory, setFilter, getFilter,
      viewModes, setViewMode, getViewMode,
      applyDiscovery,
      CITY_COORDS,
    }}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error('useDiscovery must be used inside DiscoveryProvider');
  return ctx;
}