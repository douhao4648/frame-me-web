import { useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/login';
import SsoCallback from './pages/auth/callback';
import Welcome from './pages/welcome';
import AuditLogPage from './pages/audit';
import { getToken } from './auth/token';
import { redirectToSso } from './auth/redirect';
import { AuthProvider } from './stores/auth';

/** 路由守卫：无 token 直接发起 SSO 授权跳转（方式 A：登录态由 SSO 侧维护） */
function RequireAuth({ children }: { children: ReactNode }) {
  const authed = !!getToken();
  useEffect(() => {
    if (!authed) redirectToSso();
  }, [authed]);
  if (!authed) return null;
  return <AuthProvider>{children}</AuthProvider>;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <SsoCallback /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/welcome" replace /> },
      { path: 'welcome', element: <Welcome /> },
      { path: 'audit', element: <AuditLogPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
