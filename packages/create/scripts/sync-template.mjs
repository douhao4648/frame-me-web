#!/usr/bin/env node
/**
 * prepack 时把 templates/admin 同步为包内 template/ 副本。
 * 发布后 CLI 使用包内副本；本仓开发时 CLI 优先用 ../../templates/admin。
 */
import { cp, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const src = path.resolve(pkgDir, '../../templates/admin');
const dest = path.join(pkgDir, 'template');

await rm(dest, { recursive: true, force: true });
await cp(src, dest, {
  recursive: true,
  filter: (p) => !/(^|\/)(node_modules|dist|\.git|\.omc)(\/|$)/.test(path.relative(src, p)),
});
// npm 永不发布 .npmrc（防凭证泄漏），包内以占位名存放，CLI 生成时改回
await rename(path.join(dest, '.npmrc'), path.join(dest, 'npmrc'));
console.log(`✓ 模板已同步：${src} → ${dest}`);
