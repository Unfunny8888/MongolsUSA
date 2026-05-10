/**
 * DiscoveryContext — single source of truth for global discovery state.
 *
 * city:         null = "All Cities" (soft proximity ranking)
 *               string = hard city filter across ALL pages
 *
 * viewMode:     "list" | "map" — persisted per category
 * filterMemory: last-selected chip per category tab
 */
import { createContext, useContext, useState, useCallback } from 'react';

const DiscoveryContext = createContext(null);

const CATEGORIES = ['home', 'jobs', 'housing', 'services', 'events', 'vehicles', 'marketplace', 'rideshare'];

export function DiscoveryProvider({ children }) {
  const [city, setCity] = useState(null);

  const [filterMemory, setFilterMemory] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c, 'Nearby']))
  );

  const [viewModes, setViewModes] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c, 'list']))
  );

  const setFilter = useCallback((category, filter) => {
    setFilterMemory(prev => ({ ...prev, [category]: filter }));
  }, []);

  const setViewMode = useCallback((category, mode) => {
    setViewModes(prev => ({ ...prev, [category]: mode }));
  }, []);

  const getFilter = useCallback((category) => filterMemory[category] ?? 'Nearby', [filterMemory]);
  const getViewMode = useCallback((category) => viewModes[category] ?? 'list', [viewModes]);

  return (
    <DiscoveryContext.Provider value={{ city, setCity, filterMemory, setFilter, getFilter, viewModes, setViewMode, getViewMode }}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error('useDiscovery must be used inside DiscoveryProvider');
  return ctx;
}