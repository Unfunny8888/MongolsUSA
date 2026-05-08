import { useEffect } from 'react';
import { guestDataManager } from '../lib/guestDataManager';
import { base44 } from '@/api/base44Client';

export function useGuestDataMigration(isLoggedIn) {
  useEffect(() => {
    // Migrate guest data to user account when they log in
    if (isLoggedIn) {
      const migrateData = async () => {
        try {
          const guestData = guestDataManager.getAllGuestData();
          
          // Only migrate if there's data to migrate
          if (
            guestData.viewed_listings?.length === 0 &&
            guestData.saved_searches?.length === 0 &&
            guestData.search_history?.length === 0
          ) {
            return;
          }

          // Call migration function
          const response = await base44.functions.invoke('migrateGuestData', guestData);

          if (response.data?.success) {
            console.log('Guest data migrated successfully:', response.data.migrated);
            // Clear guest data after successful migration
            guestDataManager.clearAllGuestData();
          }
        } catch (err) {
          console.error('Failed to migrate guest data:', err);
          // Don't clear data on failure — user can retry
        }
      };

      // Delay migration slightly to avoid race conditions
      const timer = setTimeout(migrateData, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);
}