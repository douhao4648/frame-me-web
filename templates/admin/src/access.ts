import type { CurrentUser } from './auth/session';

/**
 * 权限判断（按钮级权限的数据源）。
 * User 主体默认无 roles 字段——RBAC 由 frame-me-starter-auth-rbac 管理，
 * 业务接入后在 /api/auth/user 响应中扩展 roles 并在此处实现判断。
 * 用法：const { hasRole } = useAccess(); {hasRole('admin') && <Button ... />}
 */
export default function access(user: CurrentUser | null) {
  const roles = (user?.roles ?? '')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  return {
    isLogin: !!user,
    hasRole: (role: string) => roles.includes(role),
    isAdmin: roles.includes('admin'),
  };
}
