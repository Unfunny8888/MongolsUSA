import { createContext, useReducer, useCallback, useMemo } from 'react';

export const TabNavigationContext = createContext(null);

// Centralized route registry — single source of truth for tab + label mapping
export const ROUTE_MAP = [
  { match: (p) => p === '/',                         tab: 'home',          label: 'Home',               isRoot: true  },
  { match: (p) => p === '/explore',                  tab: 'marketplace',   label: 'Marketplace',        isRoot: true  },
  { match: (p) => p === '/groups',                   tab: 'community',     label: 'Community',          isRoot: true  },
  { match: (p) => p === '/notifications',            tab: 'notifications', label: 'Notifications',      isRoot: true  },
  { match: (p) => p === '/profile',                  tab: 'profile',       label: 'Profile',            isRoot: true  },
  { match: (p) => p.startsWith('/listing/'),         tab: 'marketplace',   label: 'Listing Detail',     isRoot: false },
  { match: (p) => p.startsWith('/business/'),        tab: 'marketplace',   label: 'Business',           isRoot: false },
  { match: (p) => p === '/services',                 tab: 'marketplace',   label: 'Services',           isRoot: false },
  { match: (p) => p.startsWith('/group/'),           tab: 'community',     label: 'Group',              isRoot: false },
  { match: (p) => p === '/emergency',                tab: 'community',     label: 'Emergency Help',     isRoot: false },
  { match: (p) => p === '/recommendations',          tab: 'community',     label: 'Recommendations',    isRoot: false },
  { match: (p) => p.startsWith('/conversation/'),    tab: 'profile',       label: 'Chat',               isRoot: false },
  { match: (p) => p === '/inbox',                    tab: 'profile',       label: 'Messages',           isRoot: false },
  { match: (p) => p === '/edit-profile',             tab: 'profile',       label: 'Edit Profile',       isRoot: false },
  { match: (p) => p === '/my-listings',              tab: 'profile',       label: 'My Listings',        isRoot: false },
  { match: (p) => p === '/saved',                    tab: 'profile',       label: 'Saved Items',        isRoot: false },
  { match: (p) => p === '/saved-searches',           tab: 'profile',       label: 'Saved Searches',     isRoot: false },
  { match: (p) => p === '/vip',                      tab: 'profile',       label: 'VIP Membership',     isRoot: false },
  { match: (p) => p === '/business-dashboard',       tab: 'profile',       label: 'Business Dashboard', isRoot: false },
  { match: (p) => p === '/recruiter',                tab: 'profile',       label: 'Recruiter',          isRoot: false },
  { match: (p) => p === '/admin',                    tab: 'profile',       label: 'Admin',              isRoot: false },
  { match: (p) => p === '/ai-assistant',             tab: 'home',          label: 'AI Assistant',       isRoot: false },
  { match: (p) => p === '/create',                   tab: 'home',          label: 'Create Listing',     isRoot: false },
  { match: (p) => p === '/search',                   tab: 'home',          label: 'Search',             isRoot: false },
  { match: (p) => p === '/businesses',               tab: 'marketplace',   label: 'Businesses',         isRoot: false },
];

export const TAB_ROOTS = {
  home:          '/',
  marketplace:   '/explore',
  community:     '/groups',
  notifications: '/notifications',
  profile:       '/profile',
};

export function resolveRoute(pathname) {
  for (const entry of ROUTE_MAP) {
    if (entry.match(pathname)) return entry;
  }
  // Fallback: treat as home child
  return { tab: 'home', label: '', isRoot: false };
}

const makeRootEntry = (tab) => ({
  path: TAB_ROOTS[tab],
  label: tab.charAt(0).toUpperCase() + tab.slice(1),
  tab,
});

const initialState = {
  activeTab: 'home',
  stacks: {
    home:          [{ path: '/',              label: 'Home',          tab: 'home'          }],
    marketplace:   [{ path: '/explore',       label: 'Marketplace',   tab: 'marketplace'   }],
    community:     [{ path: '/groups',        label: 'Community',     tab: 'community'     }],
    notifications: [{ path: '/notifications', label: 'Notifications', tab: 'notifications' }],
    profile:       [{ path: '/profile',       label: 'Profile',       tab: 'profile'       }],
  },
  // Per-tab scroll positions (not per-route to keep it simple)
  scrollPositions: {
    home: 0, marketplace: 0, community: 0, notifications: 0, profile: 0,
  },
};

function navigationReducer(state, action) {
  switch (action.type) {

    // Unified navigate: atomically sets activeTab + updates correct stack
    case 'NAVIGATE': {
      const { path, tab, label, isRoot } = action.payload;
      const stack = state.stacks[tab];

      if (isRoot) {
        // Tab root — reset that tab's stack to just the root
        return {
          ...state,
          activeTab: tab,
          stacks: {
            ...state.stacks,
            [tab]: [{ path, label, tab }],
          },
        };
      }

      // Child page within a tab
      // If we're switching tabs, reset destination tab first then push
      const baseStack = state.activeTab !== tab
        ? [makeRootEntry(tab)]
        : stack;

      // Already at this path — no-op (prevents duplicate pushes)
      if (baseStack[baseStack.length - 1]?.path === path) {
        return { ...state, activeTab: tab };
      }

      // If path already exists earlier in the stack, pop back to it
      const existingIndex = baseStack.findIndex(r => r.path === path);
      if (existingIndex !== -1) {
        return {
          ...state,
          activeTab: tab,
          stacks: {
            ...state.stacks,
            [tab]: baseStack.slice(0, existingIndex + 1),
          },
        };
      }

      // Push new route onto the stack
      return {
        ...state,
        activeTab: tab,
        stacks: {
          ...state.stacks,
          [tab]: [...baseStack, { path, label, tab }],
        },
      };
    }

    // Pop top of active tab's stack
    case 'POP': {
      const tab = state.activeTab;
      const stack = state.stacks[tab];
      if (stack.length <= 1) return state; // Never pop root
      return {
        ...state,
        stacks: {
          ...state.stacks,
          [tab]: stack.slice(0, -1),
        },
      };
    }

    case 'SAVE_SCROLL': {
      const { tab, position } = action.payload;
      return {
        ...state,
        scrollPositions: { ...state.scrollPositions, [tab]: position },
      };
    }

    default:
      return state;
  }
}

export function TabNavigationProvider({ children }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  // Main navigation action — call this whenever a route changes
  const contextNavigate = useCallback((pathname) => {
    const resolved = resolveRoute(pathname);
    dispatch({
      type: 'NAVIGATE',
      payload: { path: pathname, ...resolved },
    });
  }, []);

  // Go back within current tab stack — returns path to navigate to
  const goBack = useCallback(() => {
    const stack = state.stacks[state.activeTab];
    if (stack.length <= 1) return null;
    // Compute target before popping
    const target = stack[stack.length - 2];
    dispatch({ type: 'POP' });
    return target;
  }, [state.stacks, state.activeTab]);

  const getCurrentRoute = useCallback(() => {
    const stack = state.stacks[state.activeTab];
    return stack[stack.length - 1] ?? null;
  }, [state.stacks, state.activeTab]);

  const getStackDepth = useCallback(() => {
    return state.stacks[state.activeTab].length;
  }, [state.stacks, state.activeTab]);

  const saveScrollPosition = useCallback((position) => {
    dispatch({ type: 'SAVE_SCROLL', payload: { tab: state.activeTab, position } });
  }, [state.activeTab]);

  const getScrollPosition = useCallback((tab) => {
    return state.scrollPositions[tab ?? state.activeTab] ?? 0;
  }, [state.scrollPositions, state.activeTab]);

  const value = useMemo(() => ({
    state,
    contextNavigate,
    goBack,
    getCurrentRoute,
    getStackDepth,
    saveScrollPosition,
    getScrollPosition,
  }), [state, contextNavigate, goBack, getCurrentRoute, getStackDepth, saveScrollPosition, getScrollPosition]);

  return (
    <TabNavigationContext.Provider value={value}>
      {children}
    </TabNavigationContext.Provider>
  );
}