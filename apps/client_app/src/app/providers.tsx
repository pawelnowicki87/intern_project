'use client';

import { AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';

function ThemeInitializer() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('theme-dark');
      } else {
        document.documentElement.classList.remove('theme-dark');
      }
    } catch {
      void 0;
    }
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeInitializer />
      {children}
    </AuthProvider>
  );
}
