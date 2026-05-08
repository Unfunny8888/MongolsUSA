import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Home, Briefcase, Building2, MapPin, Users, Zap, Heart, Star, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const SUPER_APP_CATEGORIES = [
  { id: 'home', label: 'Home', icon: Home, path: '/', color: 'from-emerald-500 to-teal-500' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/explore?category=jobs', color: 'from-blue-500 to-cyan-500' },
  { id: 'housing', label: 'Housing', icon: Building2, path: '/explore?category=housing', color: 'from-purple-500 to-pink-500' },
  { id: 'services', label: 'Services', icon: Zap, path: '/services', color: 'from-orange-500 to-amber-500' },
  { id: 'travel', label: 'Travel', icon: MapPin, path: '/explore?type=travel', color: 'from-indigo-500 to-blue-500' },
  { id: 'rideshare', label: 'Rides', icon: MapPin, path: '/explore?type=ride_share', color: 'from-yellow-500 to-orange-500' },
  { id: 'events', label: 'Events', icon: Users, path: '/explore?category=events', color: 'from-rose-500 to-red-500' },
  { id: 'emergency', label: 'Emergency', icon: Heart, path: '/emergency', color: 'from-red-600 to-pink-600' },
  { id: 'recommendations', label: 'Recommendations', icon: Star, path: '/recommendations', color: 'from-yellow-400 to-orange-400' },
];

export default function SuperAppMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-40"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto z-50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Diaspora Hub</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {SUPER_APP_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={cat.path}
                onClick={onClose}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-gradient-to-br ${cat.color} p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <Icon className="w-6 h-6 text-white mb-2" />
                    <p className="text-sm font-bold text-white">{cat.label}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="bg-secondary/30 rounded-xl p-4 text-center text-sm text-muted-foreground">
          🌍 Your complete Mongolian diaspora platform
        </div>
      </motion.div>
    </motion.div>
  );
}