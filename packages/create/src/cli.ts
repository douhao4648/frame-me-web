#!/usr/bin/env node
/**
 * create-frame-me CLI（npm init @frame-me / pnpm create @frame-me）。
 *
 * 用法：npm init @frame-me [项目名]
 * 未提供的参数进入交互问答。
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createApp } from './index.js';

const rl = createInterface({ input: stdin, output: stdout });

async function ask(question: string, fallback?: string): Promise<string> {
  const suffix = fallback ? `（默认 ${fallback}）` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || fallback || '';
}

async function main(): Promise<void> {
  console.log('\nframe-me 管理后台工程生成器\n');

  const argName = process.argv[2]?.trim();
  const name = argName || (await ask('项目名（kebab-case）', 'fm-admin'));
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    console.error(`✗ 项目名不合法：${name}（需 kebab-case）`);
    process.exit(1);
  }
  const description = await ask('项目描述', `${name} 管理后台`);
  const portText = await ask('dev server 端口', '5173');
  const port = Number.parseInt(portText, 10) || 5173;

  rl.close();

  const targetDir = await createApp({ name, description, port });

  console.log(`
✓ 已生成：${targetDir}

下一步：
  cd ${name}
  pnpm i          # 需 GITHUB_TOKEN 环境变量（GitHub Packages 拉取 @frame-me/*）
  pnpm dev        # 启动（本地联调需 frame-me-sso + RP 后端 + frame-me-audit，见 README）
  pnpm gen:api    # 从后端 OpenAPI 重新生成契约类型
`);
}

main().catch((e: unknown) => {
  rl.close();
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
