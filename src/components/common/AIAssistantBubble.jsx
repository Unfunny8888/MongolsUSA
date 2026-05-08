import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AIAssistantBubble() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
      className="fixed bottom-24 right-4 z-50"
    >
      <Link to="/ai-assistant">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-xl shadow-primary/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-background animate-pulse" />
        </div>
      </Link>
    </motion.div>
  );
}