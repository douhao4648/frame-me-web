// @frame-me/config vite preset（Vite 8 / Rolldown）。
// 消费方 vite.config.ts：
//   import { frameMeViteConfig } from '@frame-me/config/vite';
//   export default defineConfig(frameMeViteConfig({ port: 5173, proxy: {...} }));
import react from '@vitejs/plugin-react';

/**
 * @param {object} [options]
 * @param {number} [options.port] dev server 端口
 * @param {Record<string, string | import('vite').ProxyOptions>} [options.proxy] dev 代理表
 * @param {import('vite').PluginOption[]} [options.plugins] 追加插件
 * @returns {import('vite').UserConfig}
 */
export function frameMeViteConfig({ port = 5173, proxy = {}, plugins = [] } = {}) {
  return {
    plugins: [react(), ...plugins],
    resolve: {
      // Vite 8 内置 tsconfig paths 支持（别名写在 tsconfig 里，单一事实源）
      tsconfigPaths: true,
    },
    server: {
      port,
      proxy,
    },
    build: {
      rolldownOptions: {
        output: {
          // vendor 拆包：antd/react 稳定且大，独立 chunk 可长期缓存，
          // 业务代码改动不再让用户重下整个 bundle。消费方可覆盖 build 字段。
          codeSplitting: {
            groups: [
              { name: 'ui-vendor', test: /node_modules[\\/](antd|@ant-design)/, priority: 20 },
              {
                name: 'react-vendor',
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)/,
                priority: 15,
              },
              { name: 'vendor', test: /node_modules/, priority: 10 },
            ],
          },
        },
      },
    },
  };
}
