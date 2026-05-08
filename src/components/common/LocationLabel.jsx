export default function LocationLabel({ relevance, distance }) {
  const labels = {
    same_city: { text: '📍 Nearby', color: 'bg-emerald/20 text-emerald' },
    nearby: { text: '🏘️ Same City', color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' },
    trending_nearby: { text: '🔥 Trending Nearby', color: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400' },
    national: { text: '🌎 National', color: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400' },
  };

  const label = labels[relevance] || labels.national;

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${label.color}`}>
      {label.text}
      {distance !== undefined && distance < 50 && <span className="ml-1">({Math.round(distance)}mi)</span>}
    </span>
  );
}