import { useState } from "react";
import { Send, BarChart2, Megaphone, X, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const TYPES = [
  { key: "post", label: "Post", icon: "💬" },
  { key: "poll", label: "Poll", icon: "📊" },
  { key: "announcement", label: "Announce", icon: "📢" },
];

export default function CreatePostModal({ onSubmit, posting }) {
  const [type, setType] = useState("post");
  const [content, setContent] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDays, setPollDays] = useState(3);

  function addOption() { if (pollOptions.length < 6) setPollOptions([...pollOptions, ""]); }
  function removeOption(i) { if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, j) => j !== i)); }
  function updateOption(i, val) { setPollOptions(pollOptions.map((o, j) => j === i ? val : o)); }

  function canSubmit() {
    if (type === "poll") return pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2;
    return content.trim().length > 0;
  }

  function handleSubmit() {
    if (!canSubmit() || posting) return;
    const ends = new Date();
    ends.setDate(ends.getDate() + pollDays);

    onSubmit({
      type,
      content: type === "poll" ? (content || pollQuestion) : content,
      poll_question: type === "poll" ? pollQuestion : undefined,
      poll_options: type === "poll" ? pollOptions.filter(o => o.trim()) : undefined,
      poll_votes: type === "poll" ? {} : undefined,
      poll_ends_at: type === "poll" ? ends.toISOString() : undefined,
    });
    setContent("");
    setPollQuestion("");
    setPollOptions(["", ""]);
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-3 space-y-3">
      {/* Type selector */}
      <div className="flex gap-1.5">
        {TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              type === t.key ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Poll form */}
      {type === "poll" && (
        <div className="space-y-2">
          <input
            value={pollQuestion}
            onChange={e => setPollQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-secondary/70 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          {pollOptions.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-secondary/70 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {pollOptions.length > 2 && (
                <button onClick={() => removeOption(i)} className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              )}
            </div>
          ))}
          {pollOptions.length < 6 && (
            <button onClick={addOption} className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ends in</span>
            {[1, 3, 7].map(d => (
              <button
                key={d}
                onClick={() => setPollDays(d)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${pollDays === d ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text input */}
      {type !== "poll" && (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={type === "announcement" ? "Write an announcement..." : "Share something with the community..."}
          rows={3}
          className="w-full bg-secondary/70 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit() || posting}
        size="sm"
        className="w-full rounded-xl gap-1.5"
      >
        <Send className="w-3.5 h-3.5" />
        {posting ? "Posting..." : type === "announcement" ? "Post Announcement" : type === "poll" ? "Start Poll" : "Post"}
      </Button>
    </div>
  );
}