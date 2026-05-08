import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SERVICE_CATEGORIES = [
  'cleaning', 'tutoring', 'handyman', 'moving', 'translation',
  'photography', 'catering', 'beauty', 'repair', 'consulting', 'other'
];

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = selectedCategory
          ? await base44.entities.ServiceMarketplace.filter({ category: selectedCategory })
          : await base44.entities.ServiceMarketplace.list('-created_date', 50);
        setServices(data);
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [selectedCategory]);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border/40 p-4 safe-area">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <button
            onClick={() => navigate('/create?type=service')}
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
          {SERVICE_CATEGORIES.map(cat => (
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
        ) : services.length > 0 ? (
          services.map(service => (
            <div
              key={service.id}
              onClick={() => navigate(`/service/${service.id}`)}
              className="bg-card rounded-xl border border-border/40 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex gap-3">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground line-clamp-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-primary">
                      {service.price_type === 'hourly' ? `$${service.price}/hr` : `$${service.price}`}
                    </span>
                    {service.rating && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">
                        ⭐ {service.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No services found</p>
          </div>
        )}
      </div>
    </div>
  );
}