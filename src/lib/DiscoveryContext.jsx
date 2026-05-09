/**
 * DiscoveryContext — single source of truth for location + discovery state.
 * Shared across Home, Jobs, Housing, Services, Events, Vehicles, RideShare, Marketplace.
 *
 * City:    null = "All Cities" (soft proximity ranking)
 *          string = hard city filter applied to all pages
 *
 * Filter memory per category is also tracked so each tab remembers the last chip.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const DiscoveryContext = createContext(null);

export function DiscoveryProvider({ children }) {
  const [city, setCity] = useState(null);          // null = All Cities
  const [filterMemory, setFilterMemory] = useState({
    home:        'Nearby',
    jobs:        'Nearby',
    housing:     'Nearby',
    services:    'Nearby',
    events:      'Nearby',
    vehicles:    'Nearby',
    marketplace: 'Nearby',
    rideshare:   'Nearby',
  });

  const setCategory = useCallback((category, filter) => {
    setFilterMemory(prev => ({ ...prev, [category]: filter }));
  }, []);

  const value = {
    city,
    setCity,
    filterMemory,
    setCategory,
  };

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error('useDiscovery must be used inside DiscoveryProvider');
  return ctx;
}