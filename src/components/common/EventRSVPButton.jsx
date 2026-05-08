import { useState, useEffect } from "react";
import { Calendar, Check, Loader2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EventRSVPButton({ eventId, eventTitle }) {
  const [status, setStatus] = useState(null);
  const [rsvpId, setRsvpId] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [all, authed] = await Promise.all([
        base44.entities.EventRSVP.filter({ event_id: eventId, status: "going" }, "-created_date", 100),
        base44.auth.isAuthenticated(),
      ]);
      setRsvpCount(all.length);
      if (authed) {
        const me = await base44.auth.me();
        const mine = all.find(r => r.user_email === me.email);
        if (mine) { setStatus(mine.status); setRsvpId(mine.id); }
      }
    }
    load();
  }, [eventId]);

  async function rsvp(newStatus) {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { base44.auth.redirectToLogin(); return; }
    setLoading(true);
    const me = await base44.auth.me();
    if (rsvpId) {
      await base44.entities.EventRSVP.update(rsvpId, { status: newStatus });
    } else {
      const r = await base44.entities.EventRSVP.create({
        event_id: eventId,
        event_title: eventTitle,
        user_email: me.email,
        user_name: me.full_name,
        status: newStatus,
      });
      setRsvpId(r.id);
    }
    setStatus(newStatus);
    setRsvpCount(c => newStatus === "going" ? c + 1 : Math.max(0, c - 1));
    setLoading(false);
  }

  return (
    <div className="mt-4 p-4 rounded-2xl bg-pink-50 border border-pink-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-pink-600" />
          <p className="text-sm font-bold text-pink-800">RSVP to this Event</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-pink-600">
          <Users className="w-3.5 h-3.5" />
          <span>{rsvpCount} going</span>
        </div>
      </div>
      <div className="flex gap-2">
        {["going", "maybe", "not_going"].map(s => {
          const labels = { going: "✅ Going", maybe: "🤔 Maybe", not_going: "❌ Can't go" };
          return (
            <button
              key={s}
              onClick={() => rsvp(s)}
              disabled={loading}
              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-smooth ${
                status === s ? "bg-pink-600 text-white shadow-md" : "bg-white text-pink-700 border border-pink-200 hover:bg-pink-50"
              }`}
            >
              {loading && status === s ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : labels[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}