import { useContext } from 'react';
import { TabNavigationContext } from '@/lib/TabNavigationContext';

export function useTabNavigation() {
  const context = useContext(TabNavigationContext);
  if (!context) throw new Error('useTabNavigation must be used within TabNavigationProvider');
  return context;
}