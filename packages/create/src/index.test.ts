import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from './index';

/** 造一个最小模板目录，验证复制 + 占位符 + workspace 改写。
 *  模板放在 node_modules 命名的父目录下——复现发布后真实场景
 *  （包内 template 位于 node_modules/@frame-me/create/template），防 filter 误判回归 */
async function makeFixtureTemplate(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'fm-tpl-'));
  const tpl = path.join(dir, 'node_modules', 'fixture');
  await mkdir(path.join(tpl, 'src'), { recursive: true });
  await writeFile(
    path.join(tpl, 'package.json'),
    JSON.stringify(
      {
        name: '{{name}}',
        description: '{{description}}',
        dependencies: { '@frame-me/request': 'workspace:*', react: '^19.3.0' },
      },
      null,
      2,
    ),
  );
  await writeFile(path.join(tpl, 'src', 'app.ts'), 'export const name = "{{name}}";\n');
  await writeFile(path.join(tpl, 'vite.config.ts'), 'export const port = {{port}};\n');
  // dotfile 无常规扩展名，占位符替换也要覆盖
  await writeFile(path.join(tpl, '.env.development'), 'FM_PORT={{port}}\n');
  // 发布包内占位名（npm 不发布 .npmrc / 会改名 .gitignore），生成时须还原
  await writeFile(path.join(tpl, 'npmrc'), '@frame-me:registry=https://npm.pkg.github.com\n');
  await writeFile(path.join(tpl, '_gitignore'), 'node_modules\n');
  // 模板内自带的 node_modules 仍应被跳过
  await mkdir(path.join(tpl, 'node_modules'), { recursive: true });
  await writeFile(path.join(tpl, 'node_modules', 'skip.js'), 'x');
  return tpl;
}

describe('createApp', () => {
  it('复制模板并替换占位符、改写 workspace:*', async () => {
    const templateDir = await makeFixtureTemplate();
    const targetDir = await mkdtemp(path.join(tmpdir(), 'fm-out-'));
    try {
      await createApp({
        name: 'fm-mall-admin',
        description: '商城后台',
        port: 5200,
        targetDir,
        templateDir,
        packageVersion: '^0.1.0',
      });

      const pkg = JSON.parse(await readFile(path.join(targetDir, 'package.json'), 'utf8')) as {
        name: string;
        description: string;
        dependencies: Record<string, string>;
      };
      expect(pkg.name).toBe('fm-mall-admin');
      expect(pkg.description).toBe('商城后台');
      expect(pkg.dependencies['@frame-me/request']).toBe('^0.1.0');
      expect(pkg.dependencies['react']).toBe('^19.3.0');

      const appTs = await readFile(path.join(targetDir, 'src', 'app.ts'), 'utf8');
      expect(appTs).toContain('fm-mall-admin');

      const viteTs = await readFile(path.join(targetDir, 'vite.config.ts'), 'utf8');
      expect(viteTs).toContain('5200');

      const env = await readFile(path.join(targetDir, '.env.development'), 'utf8');
      expect(env).toBe('FM_PORT=5200\n');

      // 占位名还原
      const npmrc = await readFile(path.join(targetDir, '.npmrc'), 'utf8');
      expect(npmrc).toContain('npm.pkg.github.com');
      const gitignore = await readFile(path.join(targetDir, '.gitignore'), 'utf8');
      expect(gitignore).toBe('node_modules\n');

      // node_modules 不应被复制
      await expect(readFile(path.join(targetDir, 'node_modules', 'skip.js'), 'utf8')).rejects.toThrow();
    } finally {
      await rm(templateDir, { recursive: true, force: true });
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});
