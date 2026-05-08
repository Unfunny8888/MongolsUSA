import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeaturedBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="px-4 mb-2"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 shadow-xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">AI-Powered</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5 leading-tight">
            Find anything in the<br />Mongolian community
          </h2>
          <p className="text-sm text-emerald-200/80 mb-4 leading-relaxed">
            Search in Mongolian or English. Our AI understands both.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-smooth"
          >
            Try AI Search <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}