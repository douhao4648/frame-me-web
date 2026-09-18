/**
 * @frame-me/api-types —— frame-me-gen-api 核心。
 *
 * 打包的是「约定」而非工具（生成器本体是 openapi-typescript）：
 * 1. 多后端服务 → 每个服务一个类型文件（<outDir>/<name>.ts）；
 * 2. 附带共享辅助类型 result.ts（对齐 frame-me-parent 的 Result/PageData）；
 * 3. 输出/命名约定统一，业务项目只声明服务清单（frame-me.config.mjs）。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import openapiTS, { astToString, type OpenAPI3 } from 'openapi-typescript';

/** 单个后端服务的契约来源 */
export interface GenService {
  /** 服务名（输出文件名，如 'audit' → audit.ts） */
  name: string;
  /** OpenAPI 文档地址，如 http://localhost:10020/v3/api-docs */
  docsUrl: string;
  /** 请求文档时附加的请求头（如鉴权） */
  headers?: Record<string, string>;
}

/** frame-me-gen-api 配置（业务项目 frame-me.config.mjs 的默认导出） */
export interface GenConfig {
  /** 输出目录，默认 'src/api/gen' */
  outDir?: string;
  services: GenService[];
}

const GENERATED_HEADER = `/* eslint-disable */
/**
 * 本文件由 frame-me-gen-api 自动生成，请勿手改。
 * 重新生成：pnpm gen:api
 */
`;

/** result.ts 辅助类型（对齐后端 Result<T> / PageData<T>，全服务共享一份） */
export const RESULT_HELPER = `${GENERATED_HEADER}
/** 统一响应结构（对齐 frame-me-parent Result<T>） */
export interface IResult<T> {
  code: number;
  msg: string;
  data: T;
  err?: string | null;
  rid?: string | null;
}

/** 分页出参（对齐 frame-me-parent PageData<T>） */
export interface PageData<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
}

/** 分页响应便捷类型 */
export type PageResult<T> = IResult<PageData<T>>;
`;

async function fetchOpenApiDoc(service: GenService): Promise<Record<string, unknown>> {
  const res = await fetch(service.docsUrl, { headers: service.headers });
  if (!res.ok) {
    throw new Error(`[${service.name}] 拉取 OpenAPI 文档失败：${service.docsUrl}（HTTP ${res.status}）`);
  }
  return (await res.json()) as Record<string, unknown>;
}

/**
 * 按配置生成全部服务的契约类型。
 * @returns 写入的文件路径列表
 */
export async function generateApiTypes(config: GenConfig): Promise<string[]> {
  const outDir = config.outDir ?? 'src/api/gen';
  await mkdir(outDir, { recursive: true });
  const written: string[] = [];

  for (const service of config.services) {
    const doc = await fetchOpenApiDoc(service);
    const ast = await openapiTS(doc as unknown as OpenAPI3);
    const file = path.join(outDir, `${service.name}.ts`);
    await writeFile(file, GENERATED_HEADER + astToString(ast), 'utf8');
    written.push(file);
  }

  const helperFile = path.join(outDir, 'result.ts');
  await writeFile(helperFile, RESULT_HELPER, 'utf8');
  written.push(helperFile);

  return written;
}
