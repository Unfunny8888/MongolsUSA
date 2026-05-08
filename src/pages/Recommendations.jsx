import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const REC_CATEGORIES = [
  'restaurant', 'doctor', 'lawyer', 'school', 'mechanic', 'realtor', 'accountant', 'entertainment', 'other'
];

export default function Recommendations() {
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    async function loadRecs() {
      try {
        const data = selectedCategory
          ? await base44.entities.LocalRecommendation.filter({ category: selectedCategory })
          : await base44.entities.LocalRecommendation.list('-rating', 50);
        setRecs(data);
      } catch (err) {
        console.error('Error loading recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, [selectedCategory]);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border/40 p-4 safe-area">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Local Recommendations</h1>
          <button
            onClick={() => navigate('/create?type=recommendation')}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-foreground hover:bg-secondary'
            }`}
          >
            All
          </button>
          {REC_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : recs.length > 0 ? (
          recs.map(rec => (
            <div
              key={rec.id}
              onClick={() => navigate(`/recommendation/${rec.id}`)}
              className="bg-card rounded-xl border border-border/40 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{rec.business_name}</p>
                  {rec.description && (
                    <p className="text-sm text-foreground/70 line-clamp-2 mt-2">{rec.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {rec.rating && (
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        ⭐ {rec.rating}/5
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      📍 {rec.location_city}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      👍 {rec.helpful_count}
                    </span>
                  </div>
                </div>
                {rec.image_url && (
                  <img
                    src={rec.image_url}
                    alt={rec.title}
                    className="w-12 h-12 rounded-lg object-cover ml-3"
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No recommendations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}