// Get user's approximate city from IP geolocation
export async function getUserCityFromIP() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      city: data.city,
      state: data.region_code,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return null;
  }
}

// Calculate distance between two lat/long points in miles
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Classify location relevance
export function getLocationRelevance(userCity, itemCity) {
  if (!userCity || !itemCity) return 'national';
  const normalizedUserCity = userCity.toLowerCase().trim();
  const normalizedItemCity = itemCity.toLowerCase().trim();

  if (normalizedUserCity === normalizedItemCity) return 'same_city';
  if (normalizedItemCity.includes(normalizedUserCity) || normalizedUserCity.includes(normalizedItemCity)) return 'nearby';
  return 'national';
}

// Get location tier for sorting
export function getLocationTier(relevance) {
  const tiers = {
    same_city: 0,
    nearby: 1,
    national: 2,
  };
  return tiers[relevance] || 2;
}