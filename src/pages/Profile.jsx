import { useNavigate } from 'react-router-dom';
import { Edit, LogOut, Settings, Heart, FileText, BarChart3, ShoppingBag, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChildPageLayout from '../components/layout/ChildPageLayout';
import { base44 } from '@/api/base44Client';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listing, setListing] = useState(null);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const res = await base44.entities.Listing.filter({ created_by: me.email }, '-created_date', 1);
      setListing(res[0]);
    }
    load();
  }, []);

  const menuItems = [
    { icon: Edit, label: 'Edit Profile', action: () => navigate('/edit-profile') },
    { icon: ShoppingBag, label: 'My Listings', action: () => navigate('/my-listings') },
    { icon: Heart, label: 'Saved Listings', action: () => navigate('/saved') },
    { icon: FileText, label: 'Saved Searches', action: () => navigate('/saved-searches') },
    { icon: BarChart3, label: 'Business Dashboard', action: () => navigate('/business-dashboard') },
    { icon: Settings, label: 'Settings', action: () => {} },
    { icon: LogOut, label: 'Logout', action: async () => {
      await base44.auth.logout();
    }},
  ];

  if (!user) {
    return (
      <ChildPageLayout className="flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </ChildPageLayout>
    );
  }

  return (
    <ChildPageLayout>
      <div className="px-4 pb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl p-6 mb-6 border border-border/40">
          <div className="flex items-center gap-4">
            <img
              src={`https://i.pravatar.cc/120?u=${user.email}`}
              alt={user.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-border"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{user.full_name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-primary font-semibold mt-1">
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
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

        {/* Menu Items */}
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

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
          <p>v1.0.0 • Made with ❤️ for diaspora</p>
        </div>
      </div>
    </ChildPageLayout>
  );
}