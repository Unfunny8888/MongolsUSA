import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, Users, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

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

  const handleNavClick = (path) => {
    if (location.pathname === path && lastClickedRef.current === path) {
      // Double click on active tab - scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    lastClickedRef.current = path;
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
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
                handleNavClick(item.path);
              }}
              className="relative flex flex-col items-center gap-0.5 py-2 px-3 cursor-pointer touch-action-manipulation"
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
      </div>
    </nav>
  );
}