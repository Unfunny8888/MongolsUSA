import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';

/**
 * useNavigationStack - Tracks page hierarchy and enables reliable back navigation
 * 
 * Maintains a stack of pages and maps them to parent pages
 * Ensures users can always navigate back to a valid location
 */

const PAGE_HIERARCHY = {
  // Root pages
  '/': { parent: null, label: 'Home' },
  '/search': { parent: '/', label: 'Search' },
  '/groups': { parent: '/', label: 'Groups' },
  '/create': { parent: '/', label: 'Create' },
  '/profile': { parent: '/', label: 'Profile' },
  '/explore': { parent: '/', label: 'Explore' },
  
  // Detail pages
  '/listing/:id': { parent: '/explore', label: 'Listing' },
  '/group/:id': { parent: '/groups', label: 'Group' },
  '/business/:id': { parent: '/businesses', label: 'Business' },
  '/conversation/:id': { parent: '/inbox', label: 'Conversation' },
  
  // Profile pages
  '/edit-profile': { parent: '/profile', label: 'Edit Profile' },
  '/my-listings': { parent: '/profile', label: 'My Listings' },
  '/saved': { parent: '/profile', label: 'Saved' },
  
  // Feature pages
  '/inbox': { parent: '/profile', label: 'Inbox' },
  '/notifications': { parent: '/profile', label: 'Notifications' },
  '/saved-searches': { parent: '/profile', label: 'Saved Searches' },
  '/ai-assistant': { parent: '/profile', label: 'AI Assistant' },
  '/vip': { parent: '/profile', label: 'VIP Membership' },
  
  // Business pages
  '/business-dashboard': { parent: '/profile', label: 'Business' },
  '/businesses': { parent: '/', label: 'Businesses' },
  
  // Recruiter pages
  '/recruiter': { parent: '/profile', label: 'Recruiter' },
  
  // Super app pages
  '/services': { parent: '/', label: 'Services' },
  '/emergency': { parent: '/', label: 'Emergency Help' },
  '/recommendations': { parent: '/', label: 'Recommendations' },
  
  // Admin
  '/admin': { parent: '/', label: 'Admin' },
  '/onboarding': { parent: '/', label: 'Onboarding' },
};

export function useNavigationStack() {
  const location = useLocation();
  const navigate = useNavigate();
  const stackRef = useRef(['/']);

  // Match pathname to hierarchy pattern
  const getPageInfo = useCallback((pathname) => {
    // Exact match
    if (PAGE_HIERARCHY[pathname]) {
      return PAGE_HIERARCHY[pathname];
    }

    // Pattern match (e.g., /listing/:id -> /listing/123)
    for (const [pattern, info] of Object.entries(PAGE_HIERARCHY)) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(pathname)) {
        return info;
      }
    }

    return null;
  }, []);

  // Track navigation stack
  useEffect(() => {
    const pageInfo = getPageInfo(location.pathname);
    if (!pageInfo) return; // Unknown page, don't track

    // Add to stack if new
    if (stackRef.current[stackRef.current.length - 1] !== location.pathname) {
      stackRef.current.push(location.pathname);
      // Limit stack to last 50 pages to prevent memory leak
      if (stackRef.current.length > 50) {
        stackRef.current.shift();
      }
    }
  }, [location.pathname, getPageInfo]);

  // Smart back navigation
  const handleBack = useCallback(() => {
    const pageInfo = getPageInfo(location.pathname);
    
    // Remove current page from stack
    if (stackRef.current.length > 1) {
      stackRef.current.pop();
    }

    // If user clicked back, go to previous
    if (stackRef.current.length > 0) {
      navigate(stackRef.current[stackRef.current.length - 1], { replace: true });
    } else if (pageInfo?.parent) {
      // Fallback to defined parent
      navigate(pageInfo.parent, { replace: true });
    } else {
      // Last resort: go home
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate, getPageInfo]);

  const pageInfo = getPageInfo(location.pathname);
  const isRoot = !pageInfo?.parent || location.pathname === '/';

  return {
    pageInfo,
    isRoot,
    handleBack,
    currentPath: location.pathname,
  };
}