import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useEffect } from 'react';
import { initializeGestureHandler } from '@/lib/gestureHandler';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { TabNavigationProvider } from '@/lib/TabNavigationContext';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Auth from './pages/Auth';
import OnboardingProfile from './pages/OnboardingProfile';
import Explore from './pages/Explore';
import ListingDetail from './pages/ListingDetail';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Businesses from './pages/Businesses';
import BusinessDetail from './pages/BusinessDetail';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import Conversation from './pages/Conversation';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Onboarding from './pages/Onboarding';
import VIPMembership from './pages/VIPMembership';
import SavedListings from './pages/SavedListings';
import EditProfile from './pages/EditProfile';
import MyListings from './pages/MyListings';
import AIAssistant from './pages/AIAssistant';
import SavedSearches from './pages/SavedSearches';
import BusinessDashboard from './pages/BusinessDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Services from './pages/Services';
import Emergency from './pages/Emergency';
import Recommendations from './pages/Recommendations';

const AuthenticatedApp = () => {
  useSystemTheme();

  useEffect(() => {
    initializeGestureHandler();
  }, []);
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<OnboardingProfile />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/listing/:listingId" element={<ListingDetail />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/group/:groupId" element={<GroupDetail />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/business/:businessId" element={<BusinessDetail />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/conversation/:conversationId" element={<Conversation />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/vip" element={<VIPMembership />} />
        <Route path="/saved" element={<SavedListings />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/saved-searches" element={<SavedSearches />} />
        <Route path="/business-dashboard" element={<BusinessDashboard />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/recommendations" element={<Recommendations />} />
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
  )
}

export default App