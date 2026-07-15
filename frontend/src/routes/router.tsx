import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashLayout from '../shared/components/layout/DashLayout';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import UserDashboardPage from '../pages/User/UserDashboard';
import AdminDashboardPage from '../pages/Admin/AdminDashboard';
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
        ],
      },
    ],
  },
]);
