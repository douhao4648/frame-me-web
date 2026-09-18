import type { TokenPair } from '@frame-me/request';
import { AUTH_BASE, client } from '../api/client';
import { clearTokens, setTokens } from './token';

/**
 * 当前登录用户（对齐 frame-me-base User）。
 * 角色/权限由 frame-me-starter-auth-rbac 另行管理，接入后在 access.ts 扩展。
 */
export interface CurrentUser {
  id: number;
  account: string;
  userNo?: string;
  nickname?: string;
  realName?: string;
  avatar?: string;
  /** 角色码（逗号分隔），业务接入 RBAC 后在 /api/auth/user 响应中扩展返回 */
  roles?: string;
}

/** 授权码换本地会话（frame-me-sso-starter SsoAuthController#ssoLogin） */
export async function ssoLogin(code: string): Promise<TokenPair> {
  const pair = await client.post<TokenPair>(`${AUTH_BASE}/sso-login`, { code });
  setTokens(pair.accessToken, pair.refreshToken);
  return pair;
}

/** 当前登录用户（JwtAuthController#user） */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  return client.get<CurrentUser>(`${AUTH_BASE}/user`);
}

/** 登出：注销 RP 后端会话并清本地 token（SSO 全局登出可另调 /api/auth/logout，见 sso.md） */
export async function logout(): Promise<void> {
  try {
    await client.post(`${AUTH_BASE}/logout`);
  } finally {
    clearTokens();
  }
}
