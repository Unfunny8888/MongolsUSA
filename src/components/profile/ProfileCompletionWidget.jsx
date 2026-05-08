import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Zap, Award, Check, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TASKS = [
  { id: 'photo', label: 'Add profile photo', icon: '📷', points: 5, boost: 15 },
  { id: 'bio', label: 'Add bio', icon: '📝', points: 3, boost: 10 },
  { id: 'email_verified', label: 'Verify email', icon: '✉️', points: 10, boost: 5 },
  { id: 'interests', label: 'Select interests', icon: '⭐', points: 5, boost: 20 },
  { id: 'group_joined', label: 'Join a group', icon: '👥', points: 5, boost: 10 },
  { id: 'username', label: 'Set username', icon: '👤', points: 3, boost: 5 },
  { id: 'phone', label: 'Add phone number', icon: '☎️', points: 5, boost: 10 },
  { id: 'verified_badge', label: 'Get verified', icon: '✅', points: 15, boost: 50 },
];

export default function ProfileCompletionWidget({ user, onTaskComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshCompletion();
  }, [user]);

  const refreshCompletion = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("updateProfileCompletion", {
        completed_tasks: user?.profile_completion || {},
      });
      setCompletion(res.data);
      if (res.data.newly_completed?.length > 0 && onTaskComplete) {
        onTaskComplete(res.data);
      }
    } catch (err) {
      console.error("Failed to update completion:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!completion) return null;

  const percentage = completion.completion_percentage || 0;
  const completedTasks = Object.entries(completion.completion_status || {})
    .filter(([, completed]) => completed)
    .map(([key]) => key);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Complete Your Profile
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {percentage}% complete
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-emerald-500"
          />
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="p-4 space-y-2">
              {TASKS.map((task) => {
                const isCompleted = completedTasks.includes(task.id);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border/30"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-600"
                        : "bg-slate-500/10 text-muted-foreground"
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-xs">{task.icon}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${
                        isCompleted ? "text-emerald-600 line-through" : "text-foreground"
                      }`}>
                        {task.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        +{task.points} pts · +{task.boost} visibility
                      </p>
                    </div>

                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-emerald-500"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Rewards summary */}
            {completion.newly_completed?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4 pt-2 border-t border-border/30"
              >
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/30">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    +{completion.reputation_gained} reputation
                  </p>
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1">
                    +{completion.visibility_boost_gained} visibility boost
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}