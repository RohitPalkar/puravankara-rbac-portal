import 'src/global.css';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

import { usePermissionStore } from 'src/stores/permission-store';
import { MOCK_USER_PROFILES } from 'src/services/mock-data';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const DEFAULT_PROFILE = 'super-admin';

export default function App() {
  useScrollToTop();

  useEffect(() => {
    const profile = MOCK_USER_PROFILES[DEFAULT_PROFILE];
    if (profile) {
      const primaryRole = profile.roles.find((r) => r.isPrimary) ?? profile.roles[0];
      const initialRes = profile.permissionResponses[primaryRole.roleId];
      if (initialRes) {
        usePermissionStore.getState().setActiveProfile(
          DEFAULT_PROFILE,
          primaryRole.roleId,
          initialRes,
          profile.roles
        );
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider settings={defaultSettings}>
          <ThemeProvider>
            <MotionLazy>
              <ProgressBar />
              <SettingsDrawer />
              <Router />
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}