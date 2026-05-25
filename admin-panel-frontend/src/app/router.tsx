import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout';
import { AppLayout } from '@/components/layout';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { LoginPage } from '@/features/auth/login-page';
import { OtpVerifyPage } from '@/features/auth/otp-verify';
import { WorkspaceSelectorPage } from '@/pages/workspace/workspace-selector';
import { DashboardPage } from '@/pages/dashboard/dashboard';
import ProductsPage from '@/pages/products/products';
import { FormBuilderPage } from '@/pages/builder/form-builder';
import { UsersPage } from '@/pages/users/users';
import { WorkflowPage } from '@/pages/workflow/workflow';
import { NotFoundPage } from '@/pages/not-found';
import { ROUTES } from '@/config';
import SettingsPage from '@/pages/settings/settings-page';
import ProfilePage from '@/features/profile/profile-page';
import WorkspaceListPage from '@/pages/workspaces/workspace-list';
import WorkspaceMembersPage from '@/pages/workspaces/workspace-members';
import { RolesPage } from '@/pages/rbac/roles';
import { PermissionsMatrixPage } from '@/pages/rbac/permissions-matrix';
import { UserManagementPage } from '@/pages/rbac/user-management';
import { AuditLogsPage } from '@/pages/rbac/audit-logs';
import { ListPage } from '@/pages/entity/list-page';
import { CreatePage } from '@/pages/entity/create-page';
import { EditPage } from '@/pages/entity/edit-page';
import { DetailPage } from '@/pages/entity/detail-page';
import FilesPage from '@/pages/files/files-page';
import NotificationsPage from '@/pages/notifications/notifications-page';

export const router = createBrowserRouter([
  {
    // Root layout injects AuthProvider + TenantProvider
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to={ROUTES.LOGIN} replace />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.VERIFY_OTP,
        element: <OtpVerifyPage />,
      },
      {
        path: ROUTES.WORKSPACE,
        element: <WorkspaceSelectorPage />,
      },
      {
        // All routes inside here require authentication
        element: <AuthGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: ROUTES.DASHBOARD,
                element: <DashboardPage />,
              },
              {
                path: ROUTES.PRODUCTS,
                element: <ProductsPage />,
              },
              {
                path: ROUTES.BUILDER,
                element: <FormBuilderPage />,
              },
              {
                path: ROUTES.USERS,
                element: <UsersPage />,
              },
              {
                path: ROUTES.WORKFLOW,
                element: <WorkflowPage />,
              },
              {
                path: ROUTES.SETTINGS,
                element: <SettingsPage />,
              },
              {
                path: ROUTES.PROFILE,
                element: <ProfilePage />,
              },
              {
                path: ROUTES.WORKSPACES,
                element: <WorkspaceListPage />,
              },
              {
                path: '/workspaces/:workspaceId/members',
                element: <WorkspaceMembersPage />,
              },
              {
                path: ROUTES.RBAC_ROLES,
                element: <RolesPage />,
              },
              {
                path: ROUTES.RBAC_PERMISSIONS,
                element: <PermissionsMatrixPage />,
              },
              {
                path: ROUTES.RBAC_USERS,
                element: <UserManagementPage />,
              },
              {
                path: ROUTES.RBAC_AUDIT,
                element: <AuditLogsPage />,
              },
              // Files
              {
                path: ROUTES.FILES,
                element: <FilesPage />,
              },
              // Notifications
              {
                path: ROUTES.NOTIFICATIONS,
                element: <NotificationsPage />,
              },
              // Dynamic entity routes — driven by metadata from the backend
              {
                path: ROUTES.ENTITY_LIST,
                element: <ListPage />,
              },
              {
                path: ROUTES.ENTITY_CREATE,
                element: <CreatePage />,
              },
              {
                path: ROUTES.ENTITY_DETAIL,
                element: <DetailPage />,
              },
              {
                path: ROUTES.ENTITY_EDIT,
                element: <EditPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
