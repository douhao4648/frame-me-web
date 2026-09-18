/**
 * @frame-me/request —— frame-me 统一请求层。
 *
 * 字段严格对齐 frame-me-parent：
 * - 统一响应 `com.frame.me.base.result.Result`：{ code, msg, data, err, rid }
 * - 分页出参 `com.frame.me.api.result.PageData`：{ current, size, total, pages, records }
 * - 分页入参 `PageQuery`：{ current, size, orderBy }
 * - 状态码 `ResultCode`：200 成功 / 401 未授权（跳登录）/ 4001 凭证错误（留登录页提示）
 */

/** 统一响应结构（对齐后端 Result<T>） */
export interface IResult<T> {
  code: number;
  msg: string;
  data: T;
  err?: string | null;
  rid?: string | null;
}

/** 分页出参（对齐后端 PageData<T>） */
export interface PageData<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
}

/** 分页入参（对齐后端 PageQuery） */
export interface PageQuery {
  current?: number;
  size?: number;
  /** 排序字段列表，格式：字段名[ 方向]，如 ['timestamp desc'] */
  orderBy?: string[];
}

/** ResultCode 中前端关心的状态码 */
export const RESULT_SUCCESS = 200;
export const RESULT_UNAUTHORIZED = 401;
export const RESULT_BAD_CREDENTIAL = 4001;

/** 业务错误：HTTP 通了但 code !== 200，或 HTTP 层失败 */
export class ApiError extends Error {
  /** 业务状态码（Result.code）；HTTP 层失败时为 HTTP status 或 -1（网络错误） */
  readonly code: number;
  /** 错误详情（Result.err） */
  readonly err?: string | null;
  /** 请求 ID（Result.rid），排查用 */
  readonly rid?: string | null;

  constructor(code: number, msg: string, err?: string | null, rid?: string | null) {
    super(msg);
    this.name = 'ApiError';
    this.code = code;
    this.err = err;
    this.rid = rid;
  }
}

/** JWT 下游 sso-login/login 的令牌对（sa-token 下游 refreshToken 为 null） */
export interface TokenPair {
  accessToken: string;
  refreshToken?: string | null;
}

export interface FrameMeClientOptions {
  /** 请求前缀，如 '' / '/api' / 'http://localhost:8080' */
  baseURL?: string;
  /** 取当前 access token（未登录返回 null/undefined） */
  getToken?: () => string | null | undefined;
  /**
   * token 请求头名。JWT 下游默认 'Authorization'（配套 tokenPrefix 'Bearer '）；
   * sa-token 下游改 'satoken'（tokenPrefix 视 sa-token.token-prefix 配置，默认 ''）。
   */
  headerName?: string;
  /** token 头值前缀，如 'Bearer ' */
  tokenPrefix?: string;
  /**
   * 401 时的刷新钩子：返回 true 表示刷新成功，原请求自动重试一次。
   * 并发 401 只刷新一次（single-flight）。
   */
  refresh?: () => Promise<boolean>;
  /** 刷新失败或未配置刷新时的兜底（通常是清 token + 跳 SSO 登录） */
  onUnauthorized?: () => void;
  /** 统一错误提示挂钩（如 antd message.error），返回 false 可阻止默认抛出 */
  onError?: (error: ApiError) => void;
}

export interface RequestOptions {
  /** query 参数（undefined 值自动剔除；数组重复拼接） */
  query?: Record<string, unknown>;
  /** 请求体（对象自动 JSON 序列化） */
  body?: unknown;
  /** 额外请求头 */
  headers?: Record<string, string>;
  /** AbortSignal */
  signal?: AbortSignal;
}

export interface FrameMeClient {
  request<T>(method: string, path: string, options?: RequestOptions): Promise<T>;
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
  /** 分页便捷方法：query 自动带 current/size，返回 PageData<T> */
  page<T>(path: string, query?: PageQuery & Record<string, unknown>): Promise<PageData<T>>;
}

export function createClient(options: FrameMeClientOptions = {}): FrameMeClient {
  const {
    baseURL = '',
    getToken,
    headerName = 'Authorization',
    tokenPrefix = 'Bearer ',
    refresh,
    onUnauthorized,
    onError,
  } = options;

  // single-flight：并发 401 共享同一次刷新
  let refreshing: Promise<boolean> | null = null;
  function tryRefresh(): Promise<boolean> {
    if (!refresh) return Promise.resolve(false);
    refreshing ??= refresh()
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  }

  function buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = `${baseURL}${path}`;
    if (!query) return url;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        for (const item of value) params.append(key, String(item));
      } else {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }

  async function rawRequest<T>(
    method: string,
    path: string,
    opts?: RequestOptions,
    retried = false,
  ): Promise<T> {
    const headers: Record<string, string> = { ...opts?.headers };
    const token = getToken?.();
    if (token) headers[headerName] = `${tokenPrefix}${token}`;
    let body: BodyInit | undefined;
    if (opts?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }

    let res: Response;
    try {
      res = await fetch(buildUrl(path, opts?.query), {
        method,
        headers,
        body,
        signal: opts?.signal,
      });
    } catch (e) {
      throw new ApiError(-1, e instanceof Error ? e.message : '网络错误');
    }

    // HTTP 401 或业务 401：先尝试刷新并重试一次
    if (res.status === RESULT_UNAUTHORIZED && !retried) {
      if (await tryRefresh()) return rawRequest<T>(method, path, opts, true);
      onUnauthorized?.();
      throw new ApiError(RESULT_UNAUTHORIZED, '登录已失效，请重新登录');
    }

    const result = (await res.json().catch(() => null)) as IResult<T> | null;
    if (!result) {
      throw new ApiError(res.status, `响应解析失败（HTTP ${res.status}）`);
    }
    if (result.code === RESULT_UNAUTHORIZED && !retried) {
      if (await tryRefresh()) return rawRequest<T>(method, path, opts, true);
      onUnauthorized?.();
      throw new ApiError(RESULT_UNAUTHORIZED, result.msg || '登录已失效，请重新登录');
    }
    if (result.code !== RESULT_SUCCESS) {
      const error = new ApiError(result.code, result.msg || '请求失败', result.err, result.rid);
      onError?.(error);
      throw error;
    }
    return result.data;
  }

  const client: FrameMeClient = {
    request: (method, path, opts) => rawRequest(method, path, opts),
    get: (path, opts) => rawRequest('GET', path, opts),
    post: (path, body, opts) => rawRequest('POST', path, { ...opts, body }),
    put: (path, body, opts) => rawRequest('PUT', path, { ...opts, body }),
    delete: (path, opts) => rawRequest('DELETE', path, opts),
    page: (path, query) => rawRequest('GET', path, { query: { current: 1, size: 10, ...query } }),
  };
  return client;
}
