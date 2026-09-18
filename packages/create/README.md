# @frame-me/create

`npm init @frame-me` —— frame-me 管理后台工程生成器。

## 使用

```bash
npm init @frame-me my-admin    # 或 pnpm create @frame-me my-admin
```

未提供的参数进入交互问答：项目名（kebab-case）→ 项目描述 → dev server 端口。也支持管道输入（CI 场景）：

```bash
printf '商城后台\n5200\n' | npm init @frame-me my-admin
```

## 生成行为

1. 复制内置模板（管理后台 UI 壳：SSO 登录、ProLayout 布局、权限、审计日志演示页）；
2. 占位符替换：`{{name}}` / `{{description}}` / `{{port}}`；
3. 模板内 `@frame-me/*` 依赖的 `workspace:*` 改写为发布版本号；
4. 占位文件名还原：`npmrc` → `.npmrc`、`_gitignore` → `.gitignore`（npm 不发布 `.npmrc`、会把 `.gitignore` 改名，故包内用占位名存放）。

## 生成后

```bash
cd my-admin
pnpm i          # 需可访问 @frame-me registry（见生成工程的 .npmrc 注释）
pnpm dev        # 本地联调需 frame-me-sso:10010 + RP 后端:8080 + frame-me-audit:10020
pnpm gen:api    # 从后端 OpenAPI 重新生成契约类型
```

编程接口：`import { createApp, resolveTemplateDir, createAsker } from '@frame-me/create'`。
