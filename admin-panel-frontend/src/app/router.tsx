import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { LoginPage } from '@/pages/login/login';
import { WorkspaceSelectorPage } from '@/pages/workspace/workspace-selector';
import { DashboardPage } from '@/pages/dashboard/dashboard';
import { ProductsPage } from '@/pages/products/products';
import { FormBuilderPage } from '@/pages/builder/form-builder';
import { UsersPage } from '@/pages/users/users';
import { WorkflowPage } from '@/pages/workflow/workflow';
import { NotFoundPage } from '@/pages/not-found';
import { ROUTES } from '@/config';
import SettingsPage from '@/pages/settings/settings-page';
import ProfilePage from '@/features/profile/profile-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.WORKSPACE,
    element: <WorkspaceSelectorPage />,
  },
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
        element: <SettingsPage/>,
      },
      {
        path: ROUTES.PROFILE,
        element: <ProfilePage/>
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
