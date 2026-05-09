import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useEffect } from 'react';
import { initializeGestureHandler } from '@/lib/gestureHandler';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { TabNavigationProvider } from '@/lib/TabNavigationContext';
import AppLayout from './components/layout/AppLayout';

// Core pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Housing from './pages/Housing';
import ServicesPage from './pages/ServicesPage';
import More from './pages/More';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Search from './pages/Search';

// Category ecosystem pages
import Events from './pages/Events';
import Vehicles from './pages/Vehicles';
import Marketplace from './pages/Marketplace';
import RideShare from './pages/RideShare';

// Detail / sub pages
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

// Auth / onboarding
import Auth from './pages/Auth';
import OnboardingProfile from './pages/OnboardingProfile';

const AuthenticatedApp = () => {
  useSystemTheme();

  useEffect(() => {
    initializeGestureHandler();
  }, []);

  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<OnboardingProfile />} />
      <Route element={<AppLayout />}>
        {/* ── BOTTOM NAV ROOTS ── */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/housing" element={<Housing />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/more" element={<More />} />

        {/* ── CATEGORY ECOSYSTEMS (from More) ── */}
        <Route path="/events" element={<Events />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/rideshare" element={<RideShare />} />

        {/* ── DETAIL PAGES ── */}
        <Route path="/listing/:listingId" element={<ListingDetail />} />
        <Route path="/business/:businessId" element={<BusinessDetail />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/emergency" element={<Emergency />} />

        {/* ── USER PAGES ── */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/saved" element={<SavedListings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/search" element={<Search />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/conversation/:conversationId" element={<Conversation />} />

        {/* ── TOOLS / PREMIUM ── */}
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/vip" element={<VIPMembership />} />
        <Route path="/business-dashboard" element={<BusinessDashboard />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/admin" element={<Admin />} />

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <TabNavigationProvider>
            <AuthenticatedApp />
            <Toaster />
          </TabNavigationProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;