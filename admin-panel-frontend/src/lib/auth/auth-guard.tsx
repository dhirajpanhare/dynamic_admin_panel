import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './use-auth';
import { ROUTES } from '@/config/constants';

/**
 * Protects routes that require authentication.
 * Renders children (or <Outlet /> for nested routes) when authenticated.
 * Redirects to /login when not authenticated.
 */
export const AuthGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AuthGuard;
