/** frame-me-gen-api 配置：后端契约来源清单（执行 pnpm gen:api 重新生成类型） */
export default {
  outDir: 'src/api/gen',
  services: [
    { name: 'audit', docsUrl: 'http://localhost:10020/v3/api-docs' },
    // 需要其他服务契约时追加：
    // { name: 'sso', docsUrl: 'http://localhost:10010/v3/api-docs' },
  ],
};
