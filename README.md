# frame-me-web

Frame_Me 体系的管理后台前端脚手架（parent）。对标 `frame-me-parent` 的「一生万物」：
业务项目通过 **CLI 生成 + npm 依赖** 集成，不复制源码。

## 结构

| 路径 | 说明 |
|---|---|
| `packages/config` | `@frame-me/config`：tsconfig.base / eslint(flat) / prettier / vite preset |
| `packages/request` | `@frame-me/request`：统一响应解包、token 注入、401 刷新重试、错误码映射 |
| `packages/api-types` | `@frame-me/api-types`：`frame-me-gen-api` CLI，从后端 OpenAPI 生成契约类型 |
| `packages/create` | `@frame-me/create`：`npm init @frame-me` 生成器 |
| `templates/admin` | 管理后台模板（UI 壳，生成后归业务所有）：登录（SSO）、布局、权限、审计日志演示页 |

## 快速上手（业务侧：从脚手架衍生新应用）

**一次性前置**（每台开发机只配一次）：

```bash
# Node ≥ 22.12（推荐 24 LTS）+ pnpm
# GitHub Packages 凭证（拉 @frame-me/* 私有包；pnpm 不展开项目级 .npmrc 的 ${}，必须配用户级）
pnpm config set -g "//npm.pkg.github.com/:_authToken" <PAT>
# PAT 从 Frame_Me 仓库 .secrets/github-packages.env 获取（权限 read:packages 即可）
```

**每个新应用**（约 1 分钟，无需 clone 本仓）：

```bash
npm init @frame-me fm-mall-admin   # CLI 从 GitHub Packages 拉取；问答有默认值可一路回车
cd fm-mall-admin && pnpm i         # 生成物自带 .npmrc 指向 GitHub Packages

# 编辑 .env.development 对接你的环境：
#   VITE_SSO_AUTHORIZE_URL → SSO 服务地址（默认 localhost:10010）
#   VITE_SSO_APP_ID        → 在 SSO 注册的应用 ID
#   VITE_PROXY_BACKEND     → RP 后端（默认 localhost:8080）

pnpm dev        # 登录 → 跳 SSO → 回来自带布局/菜单/权限/审计日志演示页
pnpm gen:api    # 后端启动后，按 frame-me.config.mjs 的服务清单生成契约类型
```

**之后的每一天**：

| 诉求 | 操作 |
|---|---|
| 改 UI（布局/菜单/页面） | 直接改，代码全部归业务所有 |
| 升级共享层（request 修复、契约约定更新） | `pnpm up "@frame-me/*"` 升版本号 |
| 新增后端服务的契约类型 | `frame-me.config.mjs` 加一行 → `pnpm gen:api` |

**关键边界**：生成物是独立仓（自带 `.gitignore`），与本仓的耦合只有 `@frame-me/*` 依赖的版本号。

## 开发本仓

```bash
pnpm i
pnpm build        # 构建 packages/*
pnpm test         # packages/* 单测（vitest）
```

模板在 workspace 内以 `workspace:*` 引用 `@frame-me/*` 开发；CLI 生成时改写为版本号。

## 发包

```bash
pnpm changeset     # 记录变更（或直接手写 .changeset/*.md）
pnpm run version   # 提升版本号（fixed 组四包联动）
pnpm release       # 构建并发布到 GitHub Packages（frame-me 组织，凭证走用户级 ~/.npmrc）
```

⚠️ 凭证不在项目级 `.npmrc` 存 token（pnpm 不展开 `${}` 且文件被 git 追踪），统一用户级配置，见上文「一次性前置」。
