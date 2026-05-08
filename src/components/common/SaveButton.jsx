import { Heart } from 'lucide-react';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';

/**
 * SaveButton - Heart icon with optimistic save/unsave
 * Toggles instantly on tap, syncs with backend
 */
export default function SaveButton({ listingId, initialSaved = false }) {
  const [isSaved, setIsSaved] = useState(initialSaved);

  const { value: saved, toggle } = useOptimisticUpdate(isSaved, async (newState) => {
    if (newState) {
      await base44.entities.SavedListing.create({
        listing_id: listingId,
        listing_title: '',
        listing_image: '',
        listing_price: 0,
        listing_category: '',
        listing_city: '',
      });
    } else {
      const saves = await base44.entities.SavedListing.filter({ listing_id: listingId });
      if (saves[0]) {
        await base44.entities.SavedListing.delete(saves[0].id);
      }
    }
    setIsSaved(newState);
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      className="p-2 rounded-full hover:bg-secondary transition-smooth"
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          saved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        }`}
      />
    </button>
  );
}