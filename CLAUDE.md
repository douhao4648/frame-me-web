# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 项目身份

`frame-me-web` 是 Frame_Me 体系的**管理后台前端脚手架（parent）**，对标后端 `frame-me-parent` 的「一生万物」：业务项目通过 **CLI 生成（UI 壳）+ npm 依赖（共享层）** 集成，不复制源码。

技术栈：React 19.3 + TypeScript 6.0 + Vite 8（Rolldown，Node ≥22.12，推荐 24 LTS）+ antd 6 + @ant-design/pro-components v3（beta，精确锁版 `3.1.14-7`，GA 后升级）。

# 结构

| 路径 | 包名 | 说明 |
|---|---|---|
| `packages/config` | `@frame-me/config` | tsconfig.base / eslint(flat) / prettier / vite preset（无 UI 的构建规范层） |
| `packages/request` | `@frame-me/request` | 统一 Result/PageData 解包、token 注入、401 刷新重试（运行时共享逻辑） |
| `packages/api-types` | `@frame-me/api-types` | `frame-me-gen-api` CLI：多服务 OpenAPI → TS 契约类型（打包的是「约定」，工具本体 openapi-typescript） |
| `packages/create` | `@frame-me/create` | `npm init @frame-me` 生成器（prepack 时同步 templates/admin 为包内 template/） |
| `templates/admin` | （私有，不发包） | 管理后台 UI 壳：SSO 登录、ProLayout 布局、权限、审计日志演示页 |

**形态决策**（详见根 README 与总工程 `docs/architecture.md`）：UI 壳进模板（生成后归业务自由改——UI 定制高频，不做依赖）；只有稳定无 UI 层发包；契约生成打包因多后端服务是 Day-1 现实。

# 知识库检索

| 文档 | 何时读取 |
|---|---|
| `docs/index.md` | 文档导航 |
| `README.md` | 结构、业务侧使用、发包流程（含 GitHub Packages scope 约束） |
| `templates/admin/README.md` | 模板工程的本地联调依赖（sso/RP 后端/audit）与环境变量 |
| [frame-me-parent/docs/guides/sso.md](../frame-me-parent/docs/guides/sso.md) | SSO 方式 A 流程（前端登录链路的契约依据） |
| [frame-me-parent/docs/conventions.md](../frame-me-parent/docs/conventions.md) | 统一响应 Result / PageData / ResultCode（request 包字段对齐依据） |

# 常用命令

```bash
pnpm i
pnpm build        # 构建 packages/*
pnpm test         # packages/* 单测（vitest）
pnpm changeset && pnpm version && pnpm release   # 发包（需 GITHUB_TOKEN）
```

模板开发调试：`cd templates/admin && pnpm dev`（本地联调需 frame-me-sso:10010 + RP 后端:8080 + frame-me-audit:10020）。

# 关键约定

- 统一响应字段：`{ code, msg, data, err, rid }`，成功码 200，401 跳 SSO，4001 留登录页提示——`@frame-me/request` 与 `api-types` 的 result.ts 以此为唯一事实源。
- 认证链路（方式 A）：`redirectToSso()` → SSO authorize → RP `/index` → `/auth/callback#code=` → `POST /api/auth/sso-login` → `TokenVO{accessToken, refreshToken?}`；refresh 走 `POST /api/auth/refresh`（refresh token 放 token-header 头、无 body）。
- 模板 `@frame-me/*` 依赖以 `workspace:*` 开发，CLI 生成时改写为版本号。
- 发包：GitHub Packages，scope `@frame-me` 对应同名 GitHub 组织（2026-09-18 已建组织并首发 0.1.x）；凭证只配用户级 `~/.npmrc`（pnpm 不展开项目级 `.npmrc` 的 `${}`，项目级仅存 registry 映射）。
