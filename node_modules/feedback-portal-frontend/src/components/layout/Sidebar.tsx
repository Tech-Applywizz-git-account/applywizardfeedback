import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  MessageSquare,
  Users,
  Settings,
  Bug,
  ChevronLeft,
  ChevronRight,
  Shield,
  ListFilter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Submit Feedback', href: '/feedback/new', icon: Plus },
  { label: 'My Feedback', href: '/feedback', icon: MessageSquare },
];

const adminItems: NavItem[] = [
  { label: 'Admin Dashboard', href: '/admin', icon: Shield, adminOnly: true },
  { label: 'All Feedback', href: '/admin/feedback', icon: ListFilter, adminOnly: true },
  { label: 'User Management', href: '/admin/users', icon: Users, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 min-h-[68px]', !sidebarOpen && 'justify-center')}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Bug className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm leading-none">BugTracker</p>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">Beta Portal</p>
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {sidebarOpen && (
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 px-2 pt-2 pb-1 font-medium">
            Main
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                !sidebarOpen && 'justify-center px-2',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            {sidebarOpen && (
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 px-2 pt-4 pb-1 font-medium">
                Admin
              </p>
            )}
            {!sidebarOpen && <Separator className="bg-sidebar-border my-2" />}
            {adminItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    !sidebarOpen && 'justify-center px-2',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className={cn('p-3 border-t border-sidebar-border', !sidebarOpen && 'px-2')}>
        {user && (
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-xs">{getInitials(user.username)}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.role}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3 h-3 text-sidebar-foreground" />
        ) : (
          <ChevronRight className="w-3 h-3 text-sidebar-foreground" />
        )}
      </button>
    </aside>
  );
};
