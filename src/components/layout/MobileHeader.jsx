import { forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Search } from 'lucide-react';

const ROOT_ROUTES = ['/', '/search', '/groups', '/create', '/profile'];

/**
 * MobileHeader - Unified header for all screens
 * Shows logo on root screens, back button + title on child screens
 */
const MobileHeader = forwardRef(function MobileHeader(_, ref) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ROOT_ROUTES.includes(location.pathname);

  if (location.pathname === '/search') return null;

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

  return (
    <div
      ref={ref}
      data-header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/20 shadow-sm"
      style={{
        transform: 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease-out',
        willChange: 'transform',
      }}
    >
      <div className="px-4 max-w-lg mx-auto" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        {isRoot ? (
          // Root: Logo + Notifications + Search indicators
          <div className="flex items-center justify-between h-16">
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-primary">nomad</span><span className="text-foreground">link</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5">MARKETPLACE</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/search')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-all duration-200 flex items-center justify-center active:scale-95"
                title="Search"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>
              <button 
                onClick={() => navigate('/notifications')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-all duration-200 flex items-center justify-center active:scale-95 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        ) : (
          // Child: Back button + Title + Action button
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-secondary/40 hover:bg-secondary/60 transition-all duration-200 flex items-center justify-center active:scale-95 flex-shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-base font-semibold text-foreground flex-1 ml-3 truncate">
              {getTitleFromPath(location.pathname)}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
});

export default MobileHeader;