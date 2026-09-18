/**
 * @frame-me/create 核心：把 templates/admin 生成为业务工程。
 *
 * 干三件事：
 * 1. 复制模板（排除 node_modules/dist/.git）；
 * 2. 占位符替换：{{name}} / {{description}} / {{port}}；
 * 3. package.json 中 @frame-me/* 的 workspace:* 改写为发布版本号。
 */
import { cp, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

export interface CreateOptions {
  /** 项目名（也是 package.json name 与默认目录名） */
  name: string;
  /** 项目描述 */
  description?: string;
  /** dev server 端口 */
  port?: number;
  /** 目标目录（默认 ./<name>） */
  targetDir?: string;
  /** @frame-me/* 依赖改写成的版本号，默认 '^0.1.0' */
  packageVersion?: string;
  /** 模板目录（默认自动解析：包内 template/ → 仓内 templates/admin） */
  templateDir?: string;
}

/** 占位符做文本替换的文件类型 */
const TEXT_EXTENSIONS = new Set([
  '.json',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.html',
  '.md',
  '.css',
  '.yml',
  '.yaml',
]);

/** 解析模板目录：优先包内 template/（发布后），否则仓内 templates/admin（开发时） */
export async function resolveTemplateDir(): Promise<string> {
  const pkgDir = fileURLToPath(new URL('..', import.meta.url));
  const candidates = [path.join(pkgDir, 'template'), path.resolve(pkgDir, '../../templates/admin')];
  for (const dir of candidates) {
    try {
      await stat(path.join(dir, 'package.json'));
      return dir;
    } catch {
      // 下一个候选
    }
  }
  throw new Error(`未找到模板目录（尝试过：${candidates.join('、')}）`);
}

/**
 * 交互问答器。基于 readline 异步迭代器而非 rl.question：
 * 管道输入（printf '\n\n' | npm init @frame-me）时，question 会吞掉
 * 在下一个 question 注册前到达的行，且 EOF 后进程静默退出（exit 0 无输出）。
 * 迭代器内部有行缓冲，EOF 时 done=true，直接回落默认值。
 */
export function createAsker(input: NodeJS.ReadableStream, output: NodeJS.WritableStream) {
  const rl = createInterface({ input, output });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (question: string, fallback = ''): Promise<string> => {
    output.write(`${question}${fallback ? `（默认 ${fallback}）` : ''}: `);
    const { value, done } = await lines.next();
    const answer = done ? '' : String(value).trim();
    return answer || fallback;
  };
  return { ask, close: () => rl.close() };
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

export async function createApp(options: CreateOptions): Promise<string> {
  const { name, description = '', port = 5173, packageVersion = '^0.1.0' } = options;
  const targetDir = path.resolve(options.targetDir ?? name);
  const templateDir = options.templateDir ?? (await resolveTemplateDir());

  await mkdir(targetDir, { recursive: true });
  await cp(templateDir, targetDir, {
    recursive: true,
    // 必须判相对路径：发布后模板位于 node_modules/@frame-me/create/template，
    // 用绝对路径过滤会把所有文件误判为 node_modules 内容而全部跳过
    filter: (p) =>
      !/(^|\/)(node_modules|dist|\.git|\.omc)(\/|$)/.test(path.relative(templateDir, p)),
  });

  for await (const file of walk(targetDir)) {
    // .env / .env.development 等 dotfile 无常规扩展名，按文件名前缀放行
    if (!TEXT_EXTENSIONS.has(path.extname(file)) && !path.basename(file).startsWith('.env'))
      continue;
    let content = await readFile(file, 'utf8');
    content = content
      .replaceAll('{{name}}', name)
      .replaceAll('{{description}}', description)
      .replaceAll('{{port}}', String(port));
    if (path.basename(file) === 'package.json') {
      content = content.replaceAll('workspace:*', packageVersion);
    }
    await writeFile(file, content, 'utf8');
  }

  // 占位名还原：npm 永不发布 .npmrc、会把 .gitignore 改名，
  // 包内以 npmrc / _gitignore 存放（create-vite 同款约定），生成时改回
  for (const [from, to] of [
    ['npmrc', '.npmrc'],
    ['_gitignore', '.gitignore'],
  ] as const) {
    const src = path.join(targetDir, from);
    if (existsSync(src)) await rename(src, path.join(targetDir, to));
  }

  return targetDir;
}
