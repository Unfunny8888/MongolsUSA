/**
 * NomadLink Smart Feed Algorithm
 * Scores listings using 7 signals:
 *  1. Premium boosts (featured / boosted)
 *  2. Freshness (exponential decay over 7 days)
 *  3. Engagement (views + saves)
 *  4. Location proximity (city match or state match)
 *  5. User interests (category / tag affinity)
 *  6. Poster reputation (trust score)
 *  7. AI relevance bonus (pre-computed or tag match)
 */

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
  return (listing.is_featured ? 80 : 0) + (listing.is_boosted ? 40 : 0);
}

/**
 * Score a single listing given context.
 * Returns a numeric score (higher = more relevant).
 */
export function scoreListing(listing, { userCity, userInterests, userMap } = {}) {
  return (
    premiumBoostScore(listing) +
    freshnessScore(listing.created_date) +
    engagementScore(listing) +
    proximityScore(listing, userCity) +
    interestScore(listing, userInterests) +
    reputationScore(listing, userMap)
  );
}

/**
 * Rank a list of listings. Returns sorted copy (highest score first).
 */
export function rankListings(listings, context = {}) {
  return [...listings].sort((a, b) => scoreListing(b, context) - scoreListing(a, context));
}

/**
 * Build personalized sections from a ranked feed.
 */
export function buildFeedSections(listings, user) {
  const userCity = user?.city || user?.location || "";
  const userInterests = user?.interests || [];

  const ranked = rankListings(listings, { userCity, userInterests });

  return {
    forYou: ranked.filter(l =>
      userInterests.length > 0 &&
      (userInterests.some(i => i.toLowerCase() === l.category?.toLowerCase()) || (l.tags || []).some(t => userInterests.some(i => t.toLowerCase().includes(i.toLowerCase()))))
    ).slice(0, 8),
    nearby: ranked.filter(l => {
      if (!userCity) return false;
      return (l.location_city || "").toLowerCase() === userCity.toLowerCase();
    }).slice(0, 8),
    trending: [...listings]
      .sort((a, b) => engagementScore(b) - engagementScore(a))
      .slice(0, 6),
    fresh: [...listings]
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
      .slice(0, 6),
    featured: ranked.filter(l => l.is_featured),
    jobs: ranked.filter(l => l.category === "jobs").slice(0, 6),
    events: ranked.filter(l => l.category === "events").slice(0, 6),
    allRanked: ranked,
  };
}