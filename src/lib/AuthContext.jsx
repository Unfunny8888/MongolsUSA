import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // isLoading = true only on the very first app boot
  const [isLoading, setIsLoading] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: { 'X-App-Id': appParams.appId },
        token: appParams.token,
        interceptResponses: true,
      });

      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
      } catch {
        // App settings failed — not fatal, guests can still browse
      }

      // Only attempt user fetch if a token exists
      if (appParams.token) {
        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch {
          // Token invalid/expired — treat as guest, don't redirect
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch {
      return null;
    }
  };

  const login = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      isLoading,
      appPublicSettings,
      refreshUser,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};