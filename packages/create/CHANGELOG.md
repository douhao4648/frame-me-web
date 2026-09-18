# @frame-me/create

## 0.1.3

### Patch Changes

- 修复模板 vite.config.ts 在生成物中编译失败：TS6 types 不含 node 导致 process 未定义，loadEnv 改用 '.'（vite 内部 resolve 到 cwd，等效且零新依赖）

## 0.1.2

### Patch Changes

- 修复生成物缺 .npmrc / .gitignore：npm 不发布 .npmrc 且会改名 .gitignore，包内改用占位名 npmrc / _gitignore 存放，生成时还原；模板补充 _gitignore 与 pnpm 凭证配置注释

## 0.1.1

### Patch Changes

- 修复发布后 CLI 生成空目录：cp filter 改用相对路径判断（发布包模板位于 node_modules 下，绝对路径过滤会全部误跳过）；同步与生成均排除 .omc 运行时目录
