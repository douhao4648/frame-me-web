/**
 * SSO 授权跳转（方式 A：hash 落地页 + 前端换会话，见 frame-me-parent/docs/guides/sso.md）。
 *
 * 流程：本应用 → SSO /api/auth/authorize → RP 后端 /index 落地页
 *       → 站内回调路由 /auth/callback#code=xxx → POST /api/auth/sso-login 换本地会话。
 */
const REDIRECT_KEY = 'fm:login-redirect';

export function buildAuthorizeUrl(): string {
  const base =
    import.meta.env.VITE_SSO_AUTHORIZE_URL ?? 'http://localhost:10010/api/auth/authorize';
  const appId = import.meta.env.VITE_SSO_APP_ID ?? 'fm-internal-admin';
  // redirectUri 指向 RP 后端的内置落地页（SsoCallbackController /index）；
  // 开发态经 vite 代理 '^/index$' 转发到后端，与 SPA 同源
  const redirectUri = `${window.location.origin}/index`;
  // state 固定为回调路由；原始目标地址存 sessionStorage
  // （方式 A 下 state 的 hash 片段会被剥离，见 sso.md state 说明）
  const state = encodeURIComponent('/auth/callback');
  return `${base}?appId=${encodeURIComponent(appId)}&redirectUri=${encodeURIComponent(redirectUri)}&scope=openid&state=${state}`;
}

/** 记录当前地址并跳往 SSO 授权 */
export function redirectToSso(): void {
  sessionStorage.setItem(REDIRECT_KEY, window.location.pathname + window.location.search);
  window.location.href = buildAuthorizeUrl();
}

/** 登录成功后取回原始目标地址（仅接受站内相对路径，防 open redirect） */
export function consumeLoginRedirect(): string {
  const target = sessionStorage.getItem(REDIRECT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  return target && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}
