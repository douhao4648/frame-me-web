# @frame-me/config

frame-me 前端共享**构建规范层**（无 UI）：tsconfig / eslint / prettier / vite preset 的单一事实源。

## 使用

```bash
pnpm add -D @frame-me/config eslint typescript-eslint prettier
```

| 导出 | 用途 |
|---|---|
| `@frame-me/config/tsconfig.base.json` | tsconfig 基础配置，业务侧 `"extends": "@frame-me/config/tsconfig.base.json"` |
| `@frame-me/config/eslint` | ESLint 10 flat config（typescript-eslint recommended + 项目规则） |
| `@frame-me/config/prettier` | Prettier 配置 |
| `@frame-me/config/vite` | Vite 8（Rolldown）preset |

```js
// eslint.config.js
export { default } from '@frame-me/config/eslint';

// vite.config.ts
import { defineConfig } from 'vite';
import { frameMeViteConfig } from '@frame-me/config/vite';
export default defineConfig(frameMeViteConfig({ port: 5173, proxy: { '/api': 'http://localhost:8080' } }));
```

vite preset 内置 `@vitejs/plugin-react`，并开启 Vite 8 的 `tsconfigPaths`（路径别名写在 tsconfig 里，单一事实源）。

## peer 说明

`vite` / `@vitejs/plugin-react` 为 optional peer——只用 tsconfig/eslint/prettier 的消费方无需安装。
