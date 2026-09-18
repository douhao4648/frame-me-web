# @frame-me/config

## 0.2.1

### Patch Changes

- - config：vite preset 的 react-vendor 分组补上 `react-router-dom` 显式匹配（不再依赖 v7 内部包结构）
  - create：模板补齐 prettier 依赖与 format 脚本；`_gitignore` 增加 `.vite-temp/`；模板源码按 prettier 统一格式化

## 0.2.0

### Minor Changes

- - config：vite preset 内置 vendor 拆包（ui-vendor/react-vendor/vendor），业务工程改代码不再让用户重下 antd
  - create：修复管道输入下交互问答吞行、静默退出的 bug（改用 readline 异步迭代器）
  - api-types：OpenAPI 拉取失败时给出服务名 + 地址的友好报错
  - 各包补充 README

## 0.1.4

### Patch Changes

- test

## 0.1.3

No changes in this release.

## 0.1.2

No changes in this release.

## 0.1.1

No changes in this release.
