import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMERGENCY_CATEGORIES = [
  'medical', 'legal', 'shelter', 'food', 'transportation', 'childcare', 'other'
];

export default function Emergency() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('open');

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await base44.entities.EmergencyHelp.filter(
          { status: filterStatus },
          '-created_date',
          50
        );
        setRequests(data);
      } catch (err) {
        console.error('Error loading requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [filterStatus]);

  const urgencyColor = {
    immediate: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    urgent: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    moderate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border/40 p-4 safe-area">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground">Emergency Help</h1>
          </div>
          <button
            onClick={() => navigate('/create?type=emergency')}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {['open', 'in_progress', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-red-500 text-white'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : requests.length > 0 ? (
          requests.map(req => (
            <div
              key={req.id}
              onClick={() => navigate(`/emergency/${req.id}`)}
              className="bg-card rounded-xl border border-border/40 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{req.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{req.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded ${urgencyColor[req.urgency]}`}>
                      {req.urgency}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      📍 {req.location_city}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      👥 {req.helpers?.length || 0} helping
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No emergency requests</p>
          </div>
        )}
      </div>
    </div>
  );
}