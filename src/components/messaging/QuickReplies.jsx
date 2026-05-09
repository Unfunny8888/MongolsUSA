/**
 * QuickReplies — preset inquiry chips for listing conversations.
 * Calm, practical, community-oriented.
 */
export default function QuickReplies({ listingTitle, onSelect }) {
  const chips = [
    "Is this still available?",
    "Can we meet this week?",
    "Do you have more photos?",
    "Where are you located?",
    "Is the price negotiable?",
    "Can you ship or deliver?",
  ];

  return (
    <div className="px-4 py-3 border-b border-border/20">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Quick questions</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => onSelect(chip)}
            className="text-[12px] font-medium text-foreground/80 bg-secondary/60 hover:bg-secondary active:bg-secondary/80 rounded-full px-3 py-1.5 transition-colors border border-border/20"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}