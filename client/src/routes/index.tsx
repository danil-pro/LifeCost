import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PremiumRoute } from './PremiumRoute';
import { Spinner } from '../components/UI/Spinner';

const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const IncomePage = lazy(() => import('../pages/Income/IncomePage'));
const InsightsPage = lazy(() => import('../pages/Insights/InsightsPage'));
const SimulationsPage = lazy(() => import('../pages/Simulations/SimulationsPage'));
const GoalsPage = lazy(() => import('../pages/Goals/GoalsPage'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

const PageLoader = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spinner size="lg" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={PageLoader}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={PageLoader}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={PageLoader}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: 'expenses',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'income',
            element: (
              <Suspense fallback={PageLoader}>
                <IncomePage />
              </Suspense>
            ),
          },
          {
            path: 'insights',
            element: (
              <Suspense fallback={PageLoader}>
                <InsightsPage />
              </Suspense>
            ),
          },
          {
            path: 'simulations',
            element: <PremiumRoute />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={PageLoader}>
                    <SimulationsPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'goals',
            element: (
              <Suspense fallback={PageLoader}>
                <GoalsPage />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={PageLoader}>
                <SettingsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={PageLoader}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
