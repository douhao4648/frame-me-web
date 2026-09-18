import type { PluginOption, ProxyOptions, UserConfig } from 'vite';

export interface FrameMeViteConfigOptions {
  /** dev server 端口，默认 5173 */
  port?: number;
  /** dev 代理表 */
  proxy?: Record<string, string | ProxyOptions>;
  /** 追加插件 */
  plugins?: PluginOption[];
}

/** frame-me vite preset：react 插件 + tsconfig paths + dev server 默认值 */
export declare function frameMeViteConfig(options?: FrameMeViteConfigOptions): UserConfig;
