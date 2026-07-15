import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashLayout from '../shared/components/layout/DashLayout';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import UserDashboardPage from '../pages/User/UserDashboard';
import AdminDashboardPage from '../pages/Admin/AdminDashboard';
import SourcesPage from '../pages/Sources/SourcesPage';
import SourceDetailPageWrapper from '../pages/Sources/SourceDetailPage';
import SourceNewPage from '../pages/Sources/SourceNewPage';
import SourceEditPage from '../pages/Sources/SourceEditPage';
import SchemaVersionsPage from '../pages/Schemas/SchemaVersionsPage';
import SchemaNewPage from '../pages/Schemas/SchemaNewPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashLayout role="USER" />,
        children: [
          {
            path: '/dashboard',
            element: <UserDashboardPage />,
          },
          {
            path: '/sources',
            element: <SourcesPage />,
          },
          {
            path: '/sources/new',
            element: <SourceNewPage />,
          },
          {
            path: '/sources/:id',
            element: <SourceDetailPageWrapper />,
          },
          {
            path: '/sources/:id/edit',
            element: <SourceEditPage />,
          },
          {
            path: '/sources/:id/schemas',
            element: <SchemaVersionsPage />,
          },
          {
            path: '/sources/:id/schemas/new',
            element: <SchemaNewPage />,
          },
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRole="ADMIN" />,
    children: [
      {
        element: <DashLayout role="ADMIN" />,
        children: [
          {
            path: '/admin',
            element: <AdminDashboardPage />,
          },
          {
            path: '/sources',
            element: <SourcesPage />,
          },
          {
            path: '/sources/new',
            element: <SourceNewPage />,
          },
          {
            path: '/sources/:id',
            element: <SourceDetailPageWrapper />,
          },
          {
            path: '/sources/:id/edit',
            element: <SourceEditPage />,
          },
          {
            path: '/sources/:id/schemas',
            element: <SchemaVersionsPage />,
          },
          {
            path: '/sources/:id/schemas/new',
            element: <SchemaNewPage />,
          },
        ],
      },
    ],
  },
]);
