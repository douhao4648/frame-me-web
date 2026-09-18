import { createClient, type TokenPair } from '@frame-me/request';
import { clearTokens, getRefreshToken, getToken, setTokens } from '../auth/token';
import { redirectToSso } from '../auth/redirect';

// 认证端点前缀：RP 后端 frame-me-sso-starter（me.sso.client.path，默认 /api/auth）
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE ?? '/api/auth';

/** 不走 client 的裸 POST（refresh 用，避免 401 递归） */
async function rawPost<T>(
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = (await res.json()) as { code: number; msg: string; data: T };
  if (result.code !== 200) throw new Error(result.msg || `HTTP ${res.status}`);
  return result.data;
}

export const client = createClient({
  baseURL: '',
  getToken,
  // JWT 下游默认 Authorization: Bearer；sa-token 下游在 .env 配置
  // VITE_TOKEN_HEADER=satoken、VITE_TOKEN_PREFIX=（视 sa-token.token-prefix 配置）
  headerName: import.meta.env.VITE_TOKEN_HEADER ?? 'Authorization',
  tokenPrefix: import.meta.env.VITE_TOKEN_PREFIX ?? 'Bearer ',
  refresh: async () => {
    const rt = getRefreshToken();
    if (!rt) return false;
    try {
      // 与 JwtAuthController#refresh 契约一致：refresh token 放 token-header 头、无 body，
      // 返回新 TokenVO（accessToken/refreshToken）
      const header = import.meta.env.VITE_TOKEN_HEADER ?? 'Authorization';
      const prefix = import.meta.env.VITE_TOKEN_PREFIX ?? 'Bearer ';
      const pair = await rawPost<TokenPair>(`${AUTH_BASE}/refresh`, undefined, {
        [header]: `${prefix}${rt}`,
      });
      setTokens(pair.accessToken, pair.refreshToken);
      return true;
    } catch {
      return false;
    }
  },
  onUnauthorized: () => {
    clearTokens();
    redirectToSso();
  },
  onError: (error) => {
    // 统一错误提示挂钩：组件外用 console 兜底，业务可替换为 antd App.useApp() 封装
    console.error(`[${error.code}] ${error.message}${error.rid ? ` (rid: ${error.rid})` : ''}`);
  },
});

export { AUTH_BASE };
