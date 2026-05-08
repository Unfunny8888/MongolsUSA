import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Stack management for each tab
const tabStacks = {
  home: ['/'],
  search: ['/search'],
  groups: ['/groups'],
  create: ['/create'],
  profile: ['/profile'],
};

/**
 * useTabNavigation - Preserves navigation stack per bottom tab
 * Prevents losing sub-page state when switching tabs
 */
export function useTabNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const stacksRef = useRef(tabStacks);

  // Update stack when location changes
  useEffect(() => {
    const pathname = location.pathname;
    
    // Determine which tab we're in
    let currentTab = null;
    if (pathname === '/' || pathname.startsWith('/saved') || pathname.startsWith('/my-listings')) currentTab = 'home';
    else if (pathname === '/search') currentTab = 'search';
    else if (pathname.startsWith('/group')) currentTab = 'groups';
    else if (pathname === '/create') currentTab = 'create';
    else if (pathname === '/profile' || pathname === '/edit-profile') currentTab = 'profile';

    // Add to stack if new route
    if (currentTab && !stacksRef.current[currentTab].includes(pathname)) {
      stacksRef.current[currentTab].push(pathname);
    }
  }, [location.pathname]);

  return {
    navigateTab: (tabName) => {
      const stack = stacksRef.current[tabName];
      if (stack?.length > 0) {
        navigate(stack[stack.length - 1]);
      }
    },
    goBack: () => {
      const pathname = location.pathname;
      let currentTab = null;
      
      if (pathname === '/' || pathname.startsWith('/saved') || pathname.startsWith('/my-listings')) currentTab = 'home';
      else if (pathname === '/search') currentTab = 'search';
      else if (pathname.startsWith('/group')) currentTab = 'groups';
      else if (pathname === '/create') currentTab = 'create';
      else if (pathname === '/profile' || pathname === '/edit-profile') currentTab = 'profile';

      if (currentTab && stacksRef.current[currentTab].length > 1) {
        stacksRef.current[currentTab].pop();
        navigate(stacksRef.current[currentTab][stacksRef.current[currentTab].length - 1]);
      }
    },
  };
}