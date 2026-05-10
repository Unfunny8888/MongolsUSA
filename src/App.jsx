import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useEffect } from 'react';

import { initializeGestureHandler } from '@/lib/gestureHandler';

import PageNotFound from './lib/PageNotFound';

import {
  AuthProvider,
  useAuth,
} from '@/lib/AuthContext';

import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import { TabNavigationProvider } from '@/lib/TabNavigationContext';

import { DiscoveryProvider } from '@/lib/DiscoveryContext';

import AppLayout from './components/layout/AppLayout';

// CORE PAGES
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Housing from './pages/Housing';
import ServicesPage from './pages/ServicesPage';
import More from './pages/More';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Search from './pages/Search';

// CATEGORY PAGES
import Events from './pages/Events';
import Vehicles from './pages/Vehicles';
import Marketplace from './pages/Marketplace';
import RideShare from './pages/RideShare';

// DETAIL PAGES
import ListingDetail from './pages/ListingDetail';
import BusinessDetail from './pages/BusinessDetail';
import CreateListing from './pages/CreateListing';
import Inbox from './pages/Inbox';
import Conversation from './pages/Conversation';
import SavedListings from './pages/SavedListings';
import EditProfile from './pages/EditProfile';
import MyListings from './pages/MyListings';
import AIAssistant from './pages/AIAssistant';
import VIPMembership from './pages/VIPMembership';
import BusinessDashboard from './pages/BusinessDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Admin from './pages/Admin';
import Emergency from './pages/Emergency';

// AUTH
import Auth from './pages/Auth';
import OnboardingProfile from './pages/OnboardingProfile';

const AuthenticatedApp = () => {
  useSystemTheme();

  useEffect(() => {
    initializeGestureHandler();
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
    user,
  } = useAuth();

  // ONBOARDING STATUS
  const onboardingComplete =
    localStorage.getItem(
      'onboarding_complete'
    ) === 'true';

  const isOnboardingPage =
    location.pathname ===
    '/onboarding';

  // FORCE ONBOARDING
  useEffect(() => {
    if (
      user &&
      !onboardingComplete &&
      !isOnboardingPage
    ) {
      navigate('/onboarding', {
        replace: true,
      });
    }
  }, [
    user,
    onboardingComplete,
    isOnboardingPage,
    navigate,
  ]);

  // LOADING
  if (
    isLoadingPublicSettings ||
    isLoadingAuth
  ) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // AUTH ERRORS
  if (authError) {
    if (
      authError.type ===
      'user_not_registered'
    ) {
      return (
        <UserNotRegisteredError />
      );
    }

    if (
      authError.type ===
      'auth_required'
    ) {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>

      {/* AUTH */}
      <Route
        path="/auth"
        element={<Auth />}
      />

      {/* ONBOARDING */}
      <Route
        path="/onboarding"
        element={
          <OnboardingProfile />
        }
      />

      {/* APP */}
      <Route
        element={<AppLayout />}
      >

        {/* ROOT */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/housing"
          element={<Housing />}
        />

        <Route
          path="/services"
          element={
            <ServicesPage />
          }
        />

        <Route
          path="/more"
          element={<More />}
        />

        {/* CATEGORY */}
        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/vehicles"
          element={<Vehicles />}
        />

        <Route
          path="/marketplace"
          element={
            <Marketplace />
          }
        />

        <Route
          path="/rideshare"
          element={
            <RideShare />
          }
        />

        {/* DETAILS */}
        <Route
          path="/listing/:listingId"
          element={
            <ListingDetail />
          }
        />

        <Route
          path="/business/:businessId"
          element={
            <BusinessDetail />
          }
        />

        <Route
          path="/create"
          element={
            <CreateListing />
          }
        />

        <Route
          path="/emergency"
          element={<Emergency />}
        />

        {/* USER */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/edit-profile"
          element={
            <EditProfile />
          }
        />

        <Route
          path="/my-listings"
          element={
            <MyListings />
          }
        />

        <Route
          path="/saved"
          element={
            <SavedListings />
          }
        />

        <Route
          path="/notifications"
          element={
            <Notifications />
          }
        />

        <Route
          path="/search"
          element={<Search />}
        />

        <Route
          path="/inbox"
          element={<Inbox />}
        />

        <Route
          path="/conversation/:conversationId"
          element={
            <Conversation />
          }
        />

        {/* PREMIUM */}
        <Route
          path="/ai-assistant"
          element={
            <AIAssistant />
          }
        />

        <Route
          path="/vip"
          element={
            <VIPMembership />
          }
        />

        <Route
          path="/business-dashboard"
          element={
            <BusinessDashboard />
          }
        />

        <Route
          path="/recruiter"
          element={
            <RecruiterDashboard />
          }
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <PageNotFound />
          }
        />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider
      client={queryClientInstance}
    >
      <AuthProvider>
        <Router>
          <TabNavigationProvider>
            <DiscoveryProvider>

              <AuthenticatedApp />

              <Toaster />

            </DiscoveryProvider>
          </TabNavigationProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;