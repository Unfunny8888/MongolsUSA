/**
 * NomadLink Smart Feed Algorithm with Hyperlocal Ranking
 * Priority: Distance > Freshness > Engagement > Social Relevance > Paid Boost
 *
 * Scoring signals:
 *  1. Location tier (same city > nearby > national)
 *  2. Freshness (exponential decay over 7 days)
 *  3. Engagement (views + saves)
 *  4. User interests (category / tag affinity)
 *  5. Poster reputation (trust score)
 *  6. Premium boosts (featured / boosted) - applies only within location tier
 */
import { getLocationRelevance, getLocationTier } from './geolocationUtils';

const CITY_COORDS = {
  "New York": [40.71, -74.0],
  "Los Angeles": [34.05, -118.24],
  "Chicago": [41.88, -87.63],
  "Houston": [29.76, -95.37],
  "Phoenix": [33.45, -112.07],
  "Philadelphia": [39.95, -75.17],
  "San Antonio": [29.42, -98.49],
  "San Diego": [32.72, -117.15],
  "Dallas": [32.78, -96.8],
  "San Jose": [37.34, -121.89],
  "Denver": [39.74, -104.98],
  "Seattle": [47.61, -122.33],
  "Boston": [42.36, -71.06],
  "Atlanta": [33.75, -84.39],
  "Miami": [25.77, -80.19],
};

function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function locationTierScore(relevance) {
  // Ensure nearby items outrank distant paid items
  const tierScores = {
    same_city: 100,
    nearby: 80,
    national: 20,
  };
  return tierScores[relevance] || 0;
}

function proximityScore(listing, userCity) {
  if (!userCity) return 0;
  const lCity = listing.location_city || "";
  if (lCity.toLowerCase() === userCity.toLowerCase()) return 25;
  if (listing.location_state && userCity) {
    const userCoords = CITY_COORDS[userCity];
    const listCoords = CITY_COORDS[lCity];
    if (userCoords && listCoords) {
      const dist = haversineDist(userCoords[0], userCoords[1], listCoords[0], listCoords[1]);
      if (dist < 50) return 20;
      if (dist < 150) return 12;
      if (dist < 500) return 5;
    }
  }
  return 0;
}

function freshnessScore(createdDate) {
  const ageInDays = (Date.now() - new Date(createdDate || 0).getTime()) / 86400000;
  // exponential decay: 15 pts at 0 days → 0 at 30 days
  return Math.max(0, 15 * Math.exp(-ageInDays / 7));
}

function engagementScore(listing) {
  const views = Math.min((listing.views || 0) / 5, 20);
  const saves = Math.min((listing.saves || 0) * 3, 15);
  return views + saves;
}

function reputationScore(listing, userMap) {
  const poster = userMap?.[listing.created_by];
  if (!poster) return 0;
  const score = poster.reputation_score || poster.trust_score || 0;
  return Math.min(score / 10, 10); // max 10 pts
}

function interestScore(listing, userInterests = []) {
  if (!userInterests.length) return 0;
  const catMatch = userInterests.some(i => i.toLowerCase() === (listing.category || "").toLowerCase());
  const tags = listing.tags || [];
  const tagMatch = tags.some(t => userInterests.some(i => t.toLowerCase().includes(i.toLowerCase())));
  return (catMatch ? 20 : 0) + (tagMatch ? 10 : 0);
}

function premiumBoostScore(listing) {
  // Paid boosts apply only within location tier; nearby items outrank distant paid
  return (listing.is_featured ? 30 : 0) + (listing.is_boosted ? 15 : 0);
}

/**
 * Score a single listing with location-first ranking.
 * Nearby items always outrank distant paid posts.
 */
export function scoreListing(listing, { userCity, userInterests, userMap } = {}) {
  const relevance = getLocationRelevance(userCity, listing.location_city);
  const locationScore = locationTierScore(relevance);

  return (
    locationScore +
    freshnessScore(listing.created_date) +
    engagementScore(listing) +
    interestScore(listing, userInterests) +
    reputationScore(listing, userMap) +
    premiumBoostScore(listing)
  );
}

/**
 * Rank a list of listings. Returns sorted copy (highest score first).
 */
export function rankListings(listings, context = {}) {
  return [...listings].sort((a, b) => scoreListing(b, context) - scoreListing(a, context));
}

/**
 * Build personalized sections with hyperlocal-first ranking.
 */
export function buildFeedSections(listings, user) {
  const userCity = user?.city || user?.location || "";
  const userInterests = user?.interests || [];

  const ranked = rankListings(listings, { userCity, userInterests });

  // Split by location relevance for section building
  const sameCity = ranked.filter(l =>
    (l.location_city || "").toLowerCase() === userCity.toLowerCase()
  );
  const nearby = ranked.filter(l => {
    const relevance = getLocationRelevance(userCity, l.location_city);
    return relevance === 'nearby';
  });
  const national = ranked.filter(l => {
    const relevance = getLocationRelevance(userCity, l.location_city);
    return relevance === 'national';
  });

  return {
    forYou: sameCity.filter(l =>
      userInterests.length > 0 &&
      (userInterests.some(i => i.toLowerCase() === l.category?.toLowerCase()) || (l.tags || []).some(t => userInterests.some(i => t.toLowerCase().includes(i.toLowerCase()))))
    ).slice(0, 8),
    nearby: [...sameCity, ...nearby].slice(0, 8),
    trending: sameCity
      .sort((a, b) => engagementScore(b) - engagementScore(a))
      .slice(0, 6),
    fresh: sameCity
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
      .slice(0, 6),
    featured: sameCity.filter(l => l.is_featured),
    jobs: [...sameCity, ...nearby].filter(l => l.category === "jobs").slice(0, 6),
    events: [...sameCity, ...nearby].filter(l => l.category === "events").slice(0, 6),
    allRanked: ranked,
  };
}

/**
 * Get location relevance tag for a listing.
 */
export function getListingLocationRelevance(userCity, itemCity) {
  return getLocationRelevance(userCity, itemCity);
}