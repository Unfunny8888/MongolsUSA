import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const ROOT_ROUTES = ['/', '/search', '/groups', '/create', '/profile'];

/**
 * MobileHeader - Unified header for all screens
 * Shows logo on root screens, back button + title on child screens
 */
export default function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ROOT_ROUTES.includes(location.pathname);

  const getTitleFromPath = (pathname) => {
    const titles = {
      '/groups': 'Groups',
      '/group': 'Group',
      '/profile': 'Profile',
      '/edit-profile': 'Edit Profile',
      '/saved': 'Saved',
      '/my-listings': 'My Listings',
      '/inbox': 'Inbox',
      '/notifications': 'Notifications',
      '/business-dashboard': 'Business',
      '/recruiter': 'Recruiter',
      '/ai-assistant': 'AI Assistant',
    };

    for (const [path, title] of Object.entries(titles)) {
      if (pathname.startsWith(path)) return title;
    }
    return '';
  };

  const isVisible = useScrollDirection();

  return (
    <div
      data-header
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 shadow-sm"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
      }}
    >
      <div className="px-4 pt-4 pb-3 space-y-3 max-w-lg mx-auto" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      {isRoot ? (
        // Root screen header with logo
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">
            <span className="text-primary">Nomad</span><span className="text-foreground">Link</span>
          </h1>
          <button className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-smooth">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      ) : (
        // Child screen header with back button
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-secondary transition-smooth"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {getTitleFromPath(location.pathname)}
          </h2>
        </div>
      )}
      </div>
    </div>
  );
}