import { createContext, useReducer, useCallback } from 'react';

export const TabNavigationContext = createContext(null);

const TAB_ROOTS = {
  home: '/',
  marketplace: '/explore',
  community: '/groups',
  notifications: '/notifications',
  profile: '/profile',
};

const initialState = {
  activeTab: 'home',
  stacks: {
    home: [{ path: '/', label: 'Home', tab: 'home' }],
    marketplace: [{ path: '/explore', label: 'Marketplace', tab: 'marketplace' }],
    community: [{ path: '/groups', label: 'Community', tab: 'community' }],
    notifications: [{ path: '/notifications', label: 'Notifications', tab: 'notifications' }],
    profile: [{ path: '/profile', label: 'Profile', tab: 'profile' }],
  },
  scrollPositions: {
    home: 0,
    marketplace: 0,
    community: 0,
    notifications: 0,
    profile: 0,
  },
};

function navigationReducer(state, action) {
  switch (action.type) {
    case 'SWITCH_TAB': {
      const tab = action.payload;
      return {
        ...state,
        activeTab: tab,
      };
    }

    case 'PUSH_ROUTE': {
      const { tab, path, label } = action.payload;
      const currentTab = state.activeTab;

      // Only push if on the active tab
      if (tab !== currentTab) return state;

      // Prevent duplicate routes
      const stack = state.stacks[currentTab];
      if (stack[stack.length - 1]?.path === path) return state;

      return {
        ...state,
        stacks: {
          ...state.stacks,
          [currentTab]: [...stack, { path, label, tab: currentTab }],
        },
      };
    }

    case 'POP_ROUTE': {
      const currentTab = state.activeTab;
      const stack = state.stacks[currentTab];

      // Never pop the root
      if (stack.length <= 1) return state;

      return {
        ...state,
        stacks: {
          ...state.stacks,
          [currentTab]: stack.slice(0, -1),
        },
      };
    }

    case 'RESET_TAB': {
      const tab = action.payload;
      return {
        ...state,
        stacks: {
          ...state.stacks,
          [tab]: [{ path: TAB_ROOTS[tab], label: tab.charAt(0).toUpperCase() + tab.slice(1), tab }],
        },
      };
    }

    case 'SAVE_SCROLL': {
      const { tab, position } = action.payload;
      return {
        ...state,
        scrollPositions: {
          ...state.scrollPositions,
          [tab]: position,
        },
      };
    }

    case 'GO_TO_PATH': {
      const { path, label } = action.payload;
      const currentTab = state.activeTab;

      // Check if path already exists in stack
      const stack = state.stacks[currentTab];
      const existingIndex = stack.findIndex(r => r.path === path);

      if (existingIndex !== -1) {
        // Path exists, pop back to it
        return {
          ...state,
          stacks: {
            ...state.stacks,
            [currentTab]: stack.slice(0, existingIndex + 1),
          },
        };
      }

      // New path, add to stack
      return {
        ...state,
        stacks: {
          ...state.stacks,
          [currentTab]: [...stack, { path, label, tab: currentTab }],
        },
      };
    }

    default:
      return state;
  }
}

export function TabNavigationProvider({ children }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  const switchTab = useCallback((tab) => {
    dispatch({ type: 'SWITCH_TAB', payload: tab });
  }, []);

  const pushRoute = useCallback((path, label) => {
    dispatch({
      type: 'PUSH_ROUTE',
      payload: { tab: state.activeTab, path, label },
    });
  }, [state.activeTab]);

  const popRoute = useCallback(() => {
    dispatch({ type: 'POP_ROUTE' });
  }, []);

  const goBack = useCallback(() => {
    const stack = state.stacks[state.activeTab];
    if (stack.length > 1) {
      popRoute();
      return state.stacks[state.activeTab][stack.length - 2];
    }
    return null;
  }, [state, popRoute]);

  const getCurrentRoute = useCallback(() => {
    const stack = state.stacks[state.activeTab];
    return stack[stack.length - 1];
  }, [state]);

  const getTabRoot = useCallback((tab) => {
    return TAB_ROOTS[tab];
  }, []);

  const saveScrollPosition = useCallback((position) => {
    dispatch({ type: 'SAVE_SCROLL', payload: { tab: state.activeTab, position } });
  }, [state.activeTab]);

  const getScrollPosition = useCallback(() => {
    return state.scrollPositions[state.activeTab];
  }, [state]);

  const value = {
    state,
    switchTab,
    pushRoute,
    popRoute,
    goBack,
    getCurrentRoute,
    getTabRoot,
    saveScrollPosition,
    getScrollPosition,
  };

  return (
    <TabNavigationContext.Provider value={value}>
      {children}
    </TabNavigationContext.Provider>
  );
}