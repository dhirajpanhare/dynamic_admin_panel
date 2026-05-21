import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';

/**
 * Root layout that provides AuthContext and TenantContext to the entire app.
 * Must be a route element (not in providers.tsx) because AuthProvider
 * uses useNavigate which requires the React Router context.
 */
export function RootLayout() {
  return (
    <AuthProvider>
      <TenantProvider>
        <Outlet />
      </TenantProvider>
    </AuthProvider>
  );
}

export default RootLayout;
