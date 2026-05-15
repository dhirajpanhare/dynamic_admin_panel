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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
