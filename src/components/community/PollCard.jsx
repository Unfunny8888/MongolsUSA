import { useState } from "react";
import { BarChart2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PollCard({ post, userEmail, onUpdate }) {
  const options = post.poll_options || [];
  const votes = post.poll_votes || {};
  const totalVotes = Object.values(votes).reduce((s, arr) => s + (arr?.length || 0), 0);
  const userVote = options.findIndex(opt => (votes[opt] || []).includes(userEmail));
  const hasVoted = userVote >= 0;
  const ended = post.poll_ends_at && new Date(post.poll_ends_at) < new Date();

  async function vote(option) {
    if (hasVoted || ended || !userEmail) return;
    const updated = { ...votes, [option]: [...(votes[option] || []), userEmail] };
    await base44.entities.Post.update(post.id, { poll_votes: updated });
    onUpdate?.({ ...post, poll_votes: updated });
  }

  const daysLeft = post.poll_ends_at
    ? Math.max(0, Math.ceil((new Date(post.poll_ends_at) - new Date()) / 86400000))
    : null;

  return (
    <div className="mt-2 bg-secondary/40 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <BarChart2 className="w-4 h-4 text-primary" />
        <p className="text-xs font-bold">{post.poll_question}</p>
      </div>

      <div className="space-y-1.5">
        {options.map((opt, i) => {
          const count = (votes[opt] || []).length;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isUserChoice = (votes[opt] || []).includes(userEmail);

          return (
            <button
              key={i}
              onClick={() => vote(opt)}
              disabled={hasVoted || ended || !userEmail}
              className={`w-full relative rounded-xl overflow-hidden text-left transition-all ${
                hasVoted || ended ? "cursor-default" : "hover:ring-2 hover:ring-primary/30 cursor-pointer"
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-xl transition-all ${
                  isUserChoice ? "bg-primary/20" : "bg-border/40"
                }`}
                style={{ width: hasVoted || ended ? `${pct}%` : "0%" }}
              />
              <div className="relative px-3 py-2 flex items-center justify-between">
                <span className={`text-xs font-medium ${isUserChoice ? "text-primary font-semibold" : ""}`}>{opt}</span>
                {(hasVoted || ended) && (
                  <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
        <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
        {daysLeft !== null && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {ended ? "Ended" : `${daysLeft}d left`}
          </span>
        )}
      </div>
    </div>
  );
}