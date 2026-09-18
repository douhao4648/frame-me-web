# @frame-me/create

## 0.2.1

### Patch Changes

- - config：vite preset 的 react-vendor 分组补上 `react-router-dom` 显式匹配（不再依赖 v7 内部包结构）
  - create：模板补齐 prettier 依赖与 format 脚本；`_gitignore` 增加 `.vite-temp/`；模板源码按 prettier 统一格式化

## 0.2.0

### Patch Changes

- - config：vite preset 内置 vendor 拆包（ui-vendor/react-vendor/vendor），业务工程改代码不再让用户重下 antd
  - create：修复管道输入下交互问答吞行、静默退出的 bug（改用 readline 异步迭代器）
  - api-types：OpenAPI 拉取失败时给出服务名 + 地址的友好报错
  - 各包补充 README

## 0.1.4

### Patch Changes

- test

## 0.1.3

### Patch Changes

- 修复模板 vite.config.ts 在生成物中编译失败：TS6 types 不含 node 导致 process 未定义，loadEnv 改用 '.'（vite 内部 resolve 到 cwd，等效且零新依赖）

## 0.1.2

### Patch Changes

- 修复生成物缺 .npmrc / .gitignore：npm 不发布 .npmrc 且会改名 .gitignore，包内改用占位名 npmrc / _gitignore 存放，生成时还原；模板补充 _gitignore 与 pnpm 凭证配置注释

## 0.1.1

### Patch Changes

- 修复发布后 CLI 生成空目录：cp filter 改用相对路径判断（发布包模板位于 node_modules 下，绝对路径过滤会全部误跳过）；同步与生成均排除 .omc 运行时目录
