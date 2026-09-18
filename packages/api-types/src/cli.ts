#!/usr/bin/env node
/**
 * frame-me-gen-api CLI。
 *
 * 用法：
 *   frame-me-gen-api [--config frame-me.config.mjs]
 *
 * 配置文件（frame-me.config.mjs，ESM 默认导出）：
 *   export default {
 *     outDir: 'src/api/gen',
 *     services: [{ name: 'audit', docsUrl: 'http://localhost:10020/v3/api-docs' }],
 *   };
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { generateApiTypes, type GenConfig } from './index.js';

function parseArgs(argv: string[]): { config: string } {
  const idx = argv.indexOf('--config');
  const value = idx >= 0 ? argv[idx + 1] : undefined;
  return { config: value ?? 'frame-me.config.mjs' };
}

async function main(): Promise<void> {
  const { config: configPath } = parseArgs(process.argv.slice(2));
  const abs = path.resolve(process.cwd(), configPath);
  let config: GenConfig;
  try {
    const mod = (await import(pathToFileURL(abs).href)) as { default: GenConfig };
    config = mod.default;
  } catch {
    console.error(`✗ 无法加载配置文件：${abs}`);
    console.error('  请在项目根目录创建 frame-me.config.mjs（见模板 templates/admin 示例）。');
    process.exit(1);
  }
  if (!Array.isArray(config.services) || config.services.length === 0) {
    console.error('✗ 配置文件中 services 为空。');
    process.exit(1);
  }

  const written = await generateApiTypes(config);
  for (const file of written) console.log(`✓ ${file}`);
}

main().catch((e: unknown) => {
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
