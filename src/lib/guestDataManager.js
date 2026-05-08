const STORAGE_KEYS = {
  VIEWED_LISTINGS: 'nomadlink_guest_viewed',
  SAVED_SEARCHES: 'nomadlink_guest_searches',
  SEARCH_HISTORY: 'nomadlink_guest_search_history',
};

export const guestDataManager = {
  // Viewed listings
  addViewedListing(listingId, listing) {
    try {
      const viewed = this.getViewedListings();
      const existing = viewed.find(l => l.id === listingId);
      
      if (existing) {
        existing.viewed_at = new Date().toISOString();
      } else {
        viewed.push({
          id: listingId,
          title: listing.title,
          image: listing.images?.[0],
          category: listing.category,
          price: listing.price,
          location_city: listing.location_city,
          viewed_at: new Date().toISOString(),
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.VIEWED_LISTINGS, JSON.stringify(viewed.slice(-50)));
    } catch (err) {
      console.error('Failed to save viewed listing:', err);
    }
  },

  getViewedListings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWED_LISTINGS) || '[]');
    } catch {
      return [];
    }
  },

  clearViewedListings() {
    localStorage.removeItem(STORAGE_KEYS.VIEWED_LISTINGS);
  },

  // Saved searches
  addSavedSearch(query, filters = {}) {
    try {
      const searches = this.getSavedSearches();
      searches.push({
        query,
        filters,
        saved_at: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(searches.slice(-50)));
    } catch (err) {
      console.error('Failed to save search:', err);
    }
  },

  getSavedSearches() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES) || '[]');
    } catch {
      return [];
    }
  },

  clearSavedSearches() {
    localStorage.removeItem(STORAGE_KEYS.SAVED_SEARCHES);
  },

  // Search history
  addSearchHistory(query) {
    try {
      const history = this.getSearchHistory();
      const existing = history.find(h => h.query === query);
      
      if (existing) {
        existing.count = (existing.count || 1) + 1;
        existing.last_searched = new Date().toISOString();
      } else {
        history.push({
          query,
          count: 1,
          last_searched: new Date().toISOString(),
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history.slice(-100)));
    } catch (err) {
      console.error('Failed to add search history:', err);
    }
  },

  getSearchHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]');
    } catch {
      return [];
    }
  },

  clearSearchHistory() {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  },

  // Bulk operations
  getAllGuestData() {
    return {
      viewed_listings: this.getViewedListings(),
      saved_searches: this.getSavedSearches(),
      search_history: this.getSearchHistory(),
    };
  },

  clearAllGuestData() {
    this.clearViewedListings();
    this.clearSavedSearches();
    this.clearSearchHistory();
  },
};