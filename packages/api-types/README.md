# @frame-me/api-types

`frame-me-gen-api` CLI：多后端服务 OpenAPI → TS 契约类型。打包的是「约定」，生成器本体是 [openapi-typescript](https://github.com/openapi-ts/openapi-typescript)。

## 使用

业务项目根目录创建 `frame-me.config.mjs`：

```js
export default {
  outDir: 'src/api/gen', // 可省略，默认值即此
  services: [
    { name: 'audit', docsUrl: 'http://localhost:10020/v3/api-docs' },
    // { name: 'xxx', docsUrl: '...', headers: { Authorization: '...' } },
  ],
};
```

```bash
pnpm add -D @frame-me/api-types
pnpm gen:api   # 即 frame-me-gen-api [--config frame-me.config.mjs]
```

## 输出约定

- 每个服务一个文件：`<outDir>/<name>.ts`（openapi-typescript 生成的 `paths` / `components` 类型）；
- 另附共享辅助类型 `<outDir>/result.ts`：`IResult<T>` / `PageData<T>` / `PageResult<T>`，对齐后端 `frame-me-parent` 的统一响应，全服务共享一份；
- 生成文件带 `/* eslint-disable */` 与「请勿手改」头，重复生成直接覆盖。

也可编程调用：`import { generateApiTypes } from '@frame-me/api-types'`（返回写入的文件路径列表）。
