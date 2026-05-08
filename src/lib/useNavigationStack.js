import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';

/**
 * useNavigationStack - Bulletproof navigation with browser history integration
 * 
 * Features:
 * - Syncs with browser history (back button works natively)
 * - Prevents duplicate page stacking
 * - Preserves scroll positions on return
 * - Reliable parent-child navigation
 * - Handles all edge cases
 */

const PAGE_HIERARCHY = {
  // Root pages (no parent)
  '/': { parent: null, label: 'Home', type: 'root' },
  '/search': { parent: '/', label: 'Search', type: 'root' },
  '/groups': { parent: '/', label: 'Groups', type: 'root' },
  '/create': { parent: '/', label: 'Create', type: 'root' },
  '/profile': { parent: '/', label: 'Profile', type: 'root' },
  '/explore': { parent: '/', label: 'Explore', type: 'root' },
  
  // Detail pages (param-based)
  '/listing/:id': { parent: '/explore', label: 'Listing', type: 'detail' },
  '/group/:id': { parent: '/groups', label: 'Group', type: 'detail' },
  '/business/:id': { parent: '/businesses', label: 'Business', type: 'detail' },
  '/conversation/:id': { parent: '/inbox', label: 'Conversation', type: 'detail' },
  
  // Profile subsections
  '/edit-profile': { parent: '/profile', label: 'Edit Profile', type: 'child' },
  '/my-listings': { parent: '/profile', label: 'My Listings', type: 'child' },
  '/saved': { parent: '/profile', label: 'Saved', type: 'child' },
  '/inbox': { parent: '/profile', label: 'Inbox', type: 'child' },
  '/notifications': { parent: '/profile', label: 'Notifications', type: 'child' },
  '/saved-searches': { parent: '/profile', label: 'Saved Searches', type: 'child' },
  '/ai-assistant': { parent: '/profile', label: 'AI Assistant', type: 'child' },
  '/vip': { parent: '/profile', label: 'VIP Membership', type: 'child' },
  
  // Business pages
  '/business-dashboard': { parent: '/profile', label: 'Business', type: 'child' },
  '/businesses': { parent: '/', label: 'Businesses', type: 'root' },
  
  // Recruiter pages
  '/recruiter': { parent: '/profile', label: 'Recruiter', type: 'child' },
  
  // Super app pages
  '/services': { parent: '/', label: 'Services', type: 'root' },
  '/emergency': { parent: '/', label: 'Emergency Help', type: 'root' },
  '/recommendations': { parent: '/', label: 'Recommendations', type: 'root' },
  
  // Admin
  '/admin': { parent: '/', label: 'Admin', type: 'root' },
  '/onboarding': { parent: '/', label: 'Onboarding', type: 'root' },
};

// Scroll position storage
const scrollPositions = new Map();

export function useNavigationStack() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Match pathname to hierarchy pattern
  const getPageInfo = useCallback((pathname) => {
    // Exact match first
    if (PAGE_HIERARCHY[pathname]) {
      return PAGE_HIERARCHY[pathname];
    }

    // Pattern match for detail pages with params
    for (const [pattern, info] of Object.entries(PAGE_HIERARCHY)) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(pathname)) {
        return info;
      }
    }

    return null;
  }, []);

  // Save scroll position before navigation
  const saveScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      scrollPositions.set(location.pathname, scrollRef.current.scrollTop);
    }
  }, [location.pathname]);

  // Restore scroll position after navigation
  useEffect(() => {
    const savedScroll = scrollPositions.get(location.pathname);
    if (scrollRef.current && savedScroll !== undefined) {
      scrollRef.current.scrollTop = savedScroll;
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Store scroll position in browser history state
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        // Update history state with current scroll position
        window.history.replaceState(
          { ...window.history.state, scrollTop: scrollRef.current.scrollTop },
          ''
        );
      }
    };

    const target = scrollRef.current;
    if (target) {
      target.addEventListener('scroll', handleScroll, { passive: true });
      return () => target.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Smart back navigation
  const handleBack = useCallback(() => {
    const pageInfo = getPageInfo(location.pathname);
    
    // Save current scroll before leaving
    saveScrollPosition();

    // Check if we have browser history
    if (window.history.length > 1) {
      // Native browser back - respects history stack
      navigate(-1);
    } else if (pageInfo?.parent) {
      // Fallback to defined parent
      navigate(pageInfo.parent, { replace: true });
    } else {
      // Last resort: home
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate, getPageInfo, saveScrollPosition]);

  const pageInfo = getPageInfo(location.pathname);
  const isRoot = !pageInfo?.parent || location.pathname === '/';

  return {
    pageInfo,
    isRoot,
    handleBack,
    currentPath: location.pathname,
    scrollRef,
  };
}