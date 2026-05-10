import { useNavigate } from 'react-router-dom';
import { Edit, LogOut, Settings, Heart, FileText, BarChart3, ShoppingBag, MessageCircle, Zap, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChildPageLayout from '../components/layout/ChildPageLayout';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';

// ── Guest hub shown when user is not signed in ──────────────────────────────
function GuestProfile({ onLogin }) {
  const benefits = [
    { icon: MessageCircle, label: 'Message sellers & employers' },
    { icon: Heart,         label: 'Save favorite listings' },
    { icon: ShoppingBag,   label: 'Post jobs, housing & services' },
    { icon: Users,         label: 'Join community discussions' },
    { icon: Zap,           label: 'Get notified on new listings' },
  ];

  return (
    <ChildPageLayout>
      <div className="px-4 pb-8">
        {/* Hero */}
        <div className="text-center py-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-primary/25"
          >
            <span className="text-4xl">🐎</span>
          </motion.div>
          <h1 className="text-2xl font-black text-foreground mb-2">Join NomadLink</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Connect with Mongolians across the US — find jobs, housing, and community.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={onLogin}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-[15px] active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
          >
            Sign in
          </button>
          <button
            onClick={onLogin}
            className="w-full h-14 rounded-2xl border border-border/50 bg-card text-foreground font-semibold text-[15px] active:scale-[0.98] transition-all"
          >
            Create account
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-2xl border border-border/30 p-4">
          <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">
            Member benefits
          </p>
          <div className="space-y-3">
            {benefits.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[13px] text-foreground font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChildPageLayout>
  );
}

// ── Authenticated profile ───────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout, login } = useAuth();
  const [listing, setListing] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    setLoadingData(true);
    base44.entities.Listing.filter({ created_by: authUser.email }, '-created_date', 1)
      .then(res => setListing(res[0] || null))
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [authUser]);

  // Guest mode — no redirect, clean hub
  if (!authUser) {
    return <GuestProfile onLogin={login} />;
  }

  const menuItems = [
    { icon: Edit,         label: 'Edit Profile',         action: () => navigate('/edit-profile') },
    { icon: ShoppingBag,  label: 'My Listings',          action: () => navigate('/my-listings') },
    { icon: Heart,        label: 'Saved Listings',       action: () => navigate('/saved') },
    { icon: BarChart3,    label: 'Business Dashboard',   action: () => navigate('/business-dashboard') },
    { icon: Settings,     label: 'Settings',             action: () => {} },
    { icon: LogOut,       label: 'Logout',               action: logout },
  ];

  return (
    <ChildPageLayout>
      <div className="px-4 pb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl p-6 mb-6 border border-border/40">
          <div className="flex items-center gap-4">
            <img
              src={authUser.avatar || `https://i.pravatar.cc/120?u=${authUser.email}`}
              alt={authUser.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-border"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{authUser.full_name}</h1>
              <p className="text-sm text-muted-foreground">{authUser.email}</p>
              <p className="text-xs text-primary font-semibold mt-1">
                {authUser.role ? authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1) : 'Member'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {listing && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-card rounded-2xl p-4 border border-border/40 text-center">
              <p className="text-2xl font-bold text-primary">1</p>
              <p className="text-xs text-muted-foreground mt-1">Active Listing</p>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border/40 text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-1">Messages</p>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border/40 hover:bg-secondary/50 transition-all active:scale-95"
              >
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1 text-left">{item.label}</span>
                <span className="text-xs text-muted-foreground">›</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
          <p>v1.0.0 • Made with ❤️ for diaspora</p>
        </div>
      </div>
    </ChildPageLayout>
  );
}