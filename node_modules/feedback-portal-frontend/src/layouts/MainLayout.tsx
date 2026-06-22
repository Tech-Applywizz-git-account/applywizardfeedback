import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ title }) => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16')}>
        <Navbar title={title} />
        <main className="p-4 md:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
