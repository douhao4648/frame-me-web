# {{name}}

{{description}}

基于 frame-me-web 管理后台模板生成（React 19 + TS 6 + Vite 8 + antd 6 + ProComponents v3）。

## 快速开始

```bash
pnpm i          # 需 GITHUB_TOKEN 环境变量（GitHub Packages 拉取 @frame-me/*）
pnpm dev        # 本地开发
pnpm gen:api    # 从后端 OpenAPI 重新生成契约类型（src/api/gen/）
pnpm build      # 生产构建
```

## 本地联调依赖

| 依赖 | 默认地址 | 作用 |
|---|---|---|
| frame-me-sso | `http://localhost:10010` | SSO 授权（`VITE_SSO_AUTHORIZE_URL`） |
| RP 后端（集成 frame-me-sso-starter） | `http://localhost:8080` | `/index` 落地页、`/api/auth/sso-login`、业务接口（`VITE_PROXY_BACKEND`） |
| frame-me-audit | `http://localhost:10020` | 审计日志演示页数据源（`VITE_PROXY_AUDIT`） |

以上地址均在 `.env.development` 中配置。SSO 登录流程见
[frame-me-parent/docs/guides/sso.md](../../frame-me-parent/docs/guides/sso.md)「方式 A」。

## 目录

```
src/
├── api/
│   ├── client.ts       # @frame-me/request 实例（token 注入、401 刷新重试、跳 SSO）
│   └── gen/            # frame-me-gen-api 生成物（契约类型，勿手改）
├── auth/               # SSO 跳转、token 存取、会话（sso-login / 当前用户 / 登出）
├── stores/auth.tsx     # 当前用户上下文（useAuth）
├── access.ts           # 按钮级权限判断（接入 RBAC 后扩展）
├── layouts/            # ProLayout 布局（菜单、用户区、登出）
└── pages/              # login / auth/callback / welcome / audit（演示页）
```

## 说明

- `@frame-me/*` 为共享层依赖（GitHub Packages），升级 = 升版本号；UI 壳（本工程全部 src）归业务自由修改。
- 契约类型：`frame-me.config.mjs` 声明后端服务清单，`pnpm gen:api` 重新生成 `src/api/gen/`。
