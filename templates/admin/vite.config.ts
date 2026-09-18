import { defineConfig, loadEnv } from 'vite';
import { frameMeViteConfig } from '@frame-me/config/vite';

export default defineConfig(({ mode }) => {
  // ponytail: '.' 由 vite 内部 resolve 到进程 cwd，与 process.cwd() 等效，避免引入 @types/node
  const env = loadEnv(mode, '.', '');
  const port = Number(env.FM_PORT) || 5173;
  // RP 后端（集成 frame-me-sso-starter，提供 /index 落地页与 /api/auth/sso-login）
  const backend = env.VITE_PROXY_BACKEND ?? 'http://localhost:8080';
  // 审计服务（演示页数据源）
  const audit = env.VITE_PROXY_AUDIT ?? 'http://localhost:10020';

  return frameMeViteConfig({
    port,
    proxy: {
      // 精确匹配 /index（RP 落地页），避免误伤前端自身的 /index.html
      '^/index$': backend,
      // 认证端点走 RP 后端；其余 /api/** 业务接口默认也走 RP 后端
      '/api/auth': backend,
      // 审计服务单独代理（演示页数据源）
      '/api/log': audit,
      '/api': backend,
    },
  });
});
