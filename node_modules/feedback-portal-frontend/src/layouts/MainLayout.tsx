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
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn('transition-all duration-300 min-h-screen flex flex-col', sidebarOpen ? 'md:ml-64' : 'md:ml-16', 'ml-0')}>
        <Navbar title={title} />
        <main className="p-4 md:p-6 flex-1 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
