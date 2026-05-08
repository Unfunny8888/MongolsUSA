import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, Users, User, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import SuperAppMenu from './SuperAppMenu';

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/create", icon: PlusCircle, label: "Post" },
  { path: "/groups", icon: Users, label: "Groups" },
  { path: "/profile", icon: User, label: "Profile" },
];

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8);
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const lastClickedRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { navigateTab } = useTabNavigation();

  // Map routes to tab names
  const getTabName = (pathname) => {
    if (pathname === '/' || pathname.startsWith('/saved') || pathname.startsWith('/my-listings')) return 'home';
    if (pathname === '/search') return 'search';
    if (pathname.startsWith('/group')) return 'groups';
    if (pathname === '/create') return 'create';
    if (pathname === '/profile' || pathname === '/edit-profile') return 'profile';
    return null;
  };

  const handleNavClick = (path, tabName) => {
    const currentTab = getTabName(location.pathname);
    const isActiveTab = currentTab === tabName;

    if (isActiveTab && lastClickedRef.current === path) {
      // Double click on active tab - scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    lastClickedRef.current = path;
    
    if (location.pathname !== path) {
      navigateTab(tabName);
    }
  };

  return (
    <>
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 shadow-premium transition-all duration-300">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const isCreate = item.path === "/create";

            return (
              <button
                key={item.path}
                onClick={() => {
                  haptic();
                  const tabMap = { '/': 'home', '/search': 'search', '/groups': 'groups', '/create': 'create', '/profile': 'profile' };
                  handleNavClick(item.path, tabMap[item.path]);
                }}
                className="relative flex flex-col items-center gap-0.5 py-2 px-3 cursor-pointer touch-action-manipulation min-h-[44px] min-w-[44px]"
              >
                {isCreate ? (
                  <div className="relative -top-3 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-3 shadow-lg shadow-primary/30">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Icon
                        className={`w-5 h-5 transition-smooth ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 600, damping: 35 }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-smooth ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center h-12 text-muted-foreground hover:text-foreground transition-colors active:scale-95 min-h-[44px] min-w-[44px]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">Menu</span>
          </button>
        </div>
      </nav>
      <SuperAppMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}