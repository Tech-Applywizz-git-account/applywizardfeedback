import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouter } from './router';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './store/auth.store';
import { useUIStore } from './store/ui.store';
import { supabase } from './lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppInit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setToken, setLoading, logout } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    // Apply theme on load
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  useEffect(() => {
    // Initialize auth from stored token
    const initAuth = async () => {
      setLoading(true);
      const token = useAuthStore.getState().token;
      
      if (token) {
        try {
          const { authApi } = await import('./api/auth.api');
          const { data: profileRes } = await authApi.me();
          setUser(profileRes);
        } catch {
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInit>
        <AppRouter />
        <Toaster />
      </AppInit>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
