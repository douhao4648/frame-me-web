# @frame-me/request

frame-me 统一请求层（零依赖，基于原生 fetch）。字段严格对齐后端 `frame-me-parent`：

- 统一响应 `Result<T>`：`{ code, msg, data, err, rid }`，成功码 `200`
- 分页出参 `PageData<T>`：`{ current, size, total, pages, records }`
- 状态码约定：`401` 未授权（跳登录）/ `4001` 凭证错误（留登录页提示）

## 使用

```ts
import { createClient, ApiError } from '@frame-me/request';

const client = createClient({
  baseURL: '/api',
  getToken: () => session.accessToken,          // 未登录返回 null 即可
  refresh: async () => await tryRefreshToken(), // 401 时刷新，并发 401 只刷一次（single-flight）
  onUnauthorized: () => redirectToSso(),        // 刷新失败兜底：跳登录
  onError: (e) => message.error(e.msg),         // 统一错误提示
});

const user = await client.get<UserVO>('/user/current');
const page = await client.page<AuditLogVO>('/audit/page', { current: 1, size: 20 });
```

## 行为约定

- 业务码 `code !== 200` 一律抛 `ApiError`（带 `code` / `err` / `rid`，`rid` 用于排查）；
- HTTP 401 或业务 401：先 `refresh()` 成功则原请求自动重试一次，失败走 `onUnauthorized`；
- query 中 `undefined` / `null` / `''` 自动剔除，数组重复拼接；
- sa-token 下游：`headerName: 'satoken'`，`tokenPrefix` 视后端 `sa-token.token-prefix` 配置（默认 `''`）；JWT 下游保持默认 `Authorization` + `Bearer `。
