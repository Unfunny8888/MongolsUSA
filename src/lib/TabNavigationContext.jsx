import { createContext, useReducer, useCallback, useMemo } from 'react';

export const TabNavigationContext = createContext(null);

// Single source of truth for all route → tab mappings
export const ROUTE_MAP = [
  // ── Tab roots ──
  { match: (p) => p === '/',           tab: 'home',     label: 'Home',             isRoot: true  },
  { match: (p) => p === '/jobs',       tab: 'jobs',     label: 'Jobs',             isRoot: true  },
  { match: (p) => p === '/housing',    tab: 'housing',  label: 'Housing',          isRoot: true  },
  { match: (p) => p === '/services',   tab: 'services', label: 'Services',         isRoot: true  },
  { match: (p) => p === '/more',       tab: 'more',     label: 'More',             isRoot: true  },

  // ── Category ecosystems (live under "more" tab) ──
  { match: (p) => p === '/events',     tab: 'more',     label: 'Events',           isRoot: false },
  { match: (p) => p === '/vehicles',   tab: 'more',     label: 'Vehicles',         isRoot: false },
  { match: (p) => p === '/marketplace',tab: 'more',     label: 'Marketplace',      isRoot: false },
  { match: (p) => p === '/rideshare',  tab: 'more',     label: 'Ride Share',       isRoot: false },
  { match: (p) => p === '/community',  tab: 'community', label: 'Community',       isRoot: true  },

  // ── Detail pages ──
  { match: (p) => p.startsWith('/listing/'),      tab: 'home',     label: 'Listing Detail',     isRoot: false },
  { match: (p) => p.startsWith('/business/'),     tab: 'services', label: 'Business',           isRoot: false },
  { match: (p) => p === '/emergency',             tab: 'more',     label: 'Emergency Help',     isRoot: false },
  { match: (p) => p === '/create',                tab: 'home',     label: 'Create Listing',     isRoot: false },

  // ── User pages ──
  { match: (p) => p === '/profile',               tab: 'home',     label: 'Profile',            isRoot: false },
  { match: (p) => p === '/edit-profile',          tab: 'home',     label: 'Edit Profile',       isRoot: false },
  { match: (p) => p === '/my-listings',           tab: 'home',     label: 'My Listings',        isRoot: false },
  { match: (p) => p === '/saved',                 tab: 'home',     label: 'Saved Items',        isRoot: false },
  { match: (p) => p === '/notifications',         tab: 'home',     label: 'Notifications',      isRoot: false },
  { match: (p) => p === '/search',                tab: 'home',     label: 'Search',             isRoot: false },
  { match: (p) => p === '/inbox',                 tab: 'home',     label: 'Messages',           isRoot: false },
  { match: (p) => p.startsWith('/conversation/'), tab: 'home',     label: 'Chat',               isRoot: false },

  // ── Tools / premium ──
  { match: (p) => p === '/ai-assistant',          tab: 'home',     label: 'AI Assistant',       isRoot: false },
  { match: (p) => p === '/vip',                   tab: 'home',     label: 'VIP Membership',     isRoot: false },
  { match: (p) => p === '/business-dashboard',    tab: 'services', label: 'Business Dashboard', isRoot: false },
  { match: (p) => p === '/recruiter',             tab: 'jobs',     label: 'Recruiter',          isRoot: false },
  { match: (p) => p === '/admin',                 tab: 'home',     label: 'Admin',              isRoot: false },
];

export const TAB_ROOTS = {
  home:      '/',
  jobs:      '/jobs',
  housing:   '/housing',
  services:  '/services',
  community: '/community',
  more:      '/more',
};

export function resolveRoute(pathname) {
  for (const entry of ROUTE_MAP) {
    if (entry.match(pathname)) return entry;
  }
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
    home:      [{ path: '/',          label: 'Home',      tab: 'home'      }],
    jobs:      [{ path: '/jobs',      label: 'Jobs',      tab: 'jobs'      }],
    housing:   [{ path: '/housing',   label: 'Housing',   tab: 'housing'   }],
    services:  [{ path: '/services',  label: 'Services',  tab: 'services'  }],
    community: [{ path: '/community', label: 'Community', tab: 'community' }],
    more:      [{ path: '/more',      label: 'More',      tab: 'more'      }],
  },
  scrollPositions: { home: 0, jobs: 0, housing: 0, services: 0, community: 0, more: 0 },
};

function navigationReducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE': {
      const { path, tab, label, isRoot } = action.payload;
      const currentStack = state.stacks[tab] ?? [];

      if (state.activeTab === tab && currentStack.slice(-1)[0]?.path === path) return state;

      if (isRoot) {
        return {
          ...state,
          activeTab: tab,
          stacks: { ...state.stacks, [tab]: [{ path, label, tab }] },
        };
      }

      const baseStack = state.activeTab !== tab ? [makeRootEntry(tab)] : currentStack;
      const existingIndex = baseStack.findIndex(r => r.path === path);
      if (existingIndex !== -1) {
        return {
          ...state,
          activeTab: tab,
          stacks: { ...state.stacks, [tab]: baseStack.slice(0, existingIndex + 1) },
        };
      }

      return {
        ...state,
        activeTab: tab,
        stacks: { ...state.stacks, [tab]: [...baseStack, { path, label, tab }] },
      };
    }

    case 'POP': {
      const tab = state.activeTab;
      const stack = state.stacks[tab];
      if (stack.length <= 1) return state;
      return { ...state, stacks: { ...state.stacks, [tab]: stack.slice(0, -1) } };
    }

    case 'SAVE_SCROLL': {
      const { tab, position } = action.payload;
      return { ...state, scrollPositions: { ...state.scrollPositions, [tab]: position } };
    }

    default:
      return state;
  }
}

export function TabNavigationProvider({ children }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  const contextNavigate = useCallback((pathname) => {
    const resolved = resolveRoute(pathname);
    dispatch({ type: 'NAVIGATE', payload: { path: pathname, ...resolved } });
  }, []);

  const goBack = useCallback(() => {
    const stack = state.stacks[state.activeTab];
    if (stack.length <= 1) return null;
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