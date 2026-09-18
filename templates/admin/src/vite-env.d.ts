/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** SSO 授权端点（frame-me-sso） */
  readonly VITE_SSO_AUTHORIZE_URL?: string;
  /** 本应用在 SSO 注册的 appId */
  readonly VITE_SSO_APP_ID?: string;
  /** 认证端点前缀（frame-me-sso-starter me.sso.client.path，默认 /api/auth） */
  readonly VITE_AUTH_BASE?: string;
  /** token 请求头名（JWT 下游 Authorization；sa-token 下游 satoken） */
  readonly VITE_TOKEN_HEADER?: string;
  /** token 头值前缀（如 'Bearer '） */
  readonly VITE_TOKEN_PREFIX?: string;
  /** dev 代理：RP 后端地址 */
  readonly VITE_PROXY_BACKEND?: string;
  /** dev 代理：审计服务地址 */
  readonly VITE_PROXY_AUDIT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
