import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { Dashboard } from '@/pages/user/Dashboard';
import { SubmitFeedback } from '@/pages/user/SubmitFeedback';
import { MyFeedback } from '@/pages/user/MyFeedback';
import { FeedbackDetail } from '@/pages/user/FeedbackDetail';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminFeedback } from '@/pages/admin/AdminFeedback';
import { AdminFeedbackDetail } from '@/pages/admin/AdminFeedbackDetail';
import { UserManagement } from '@/pages/admin/UserManagement';
import { Loader2 } from 'lucide-react';

// Protected route — requires authentication
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

// Admin-only route
const AdminRoute: React.FC = () => {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// Public-only route (redirects if already logged in)
const PublicRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth',
    element: (
      <PublicRoute />
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
          { path: 'forgot-password', element: <ForgotPassword /> },
          { path: 'reset-password', element: <ResetPassword /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/feedback', element: <MyFeedback /> },
          { path: '/feedback/new', element: <SubmitFeedback /> },
          { path: '/feedback/:id', element: <FeedbackDetail /> },

          // Admin routes
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin', element: <AdminDashboard /> },
              { path: '/admin/feedback', element: <AdminFeedback /> },
              { path: '/admin/feedback/:id', element: <AdminFeedbackDetail /> },
              { path: '/admin/users', element: <UserManagement /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
  },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
