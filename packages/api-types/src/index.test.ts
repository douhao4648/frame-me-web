import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateApiTypes, RESULT_HELPER } from './index';

/** 最小可用的 OpenAPI fixture（模拟 frame-me-audit 的 /v3/api-docs 片段） */
const FIXTURE_DOC = {
  openapi: '3.0.1',
  info: { title: 'audit', version: '1.0' },
  paths: {
    '/api/log/{id}': {
      get: {
        operationId: 'getById',
        responses: {
          '200': {
            description: 'ok',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IResultLogVO' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      LogVO: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          action: { type: 'string' },
          success: { type: 'boolean' },
        },
      },
      IResultLogVO: {
        type: 'object',
        properties: {
          code: { type: 'integer', format: 'int32' },
          msg: { type: 'string' },
          data: { $ref: '#/components/schemas/LogVO' },
        },
      },
    },
  },
};

function stubDocFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(FIXTURE_DOC), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('generateApiTypes', () => {
  it('每个服务生成一个类型文件 + 共享 result.ts', async () => {
    stubDocFetch();
    const outDir = await mkdtemp(path.join(tmpdir(), 'fm-gen-'));
    try {
      const written = await generateApiTypes({
        outDir,
        services: [
          { name: 'audit', docsUrl: 'http://localhost:10020/v3/api-docs' },
          { name: 'sso', docsUrl: 'http://localhost:10010/v3/api-docs' },
        ],
      });
      expect(written).toHaveLength(3);
      expect(written.map((f) => path.basename(f)).sort()).toEqual([
        'audit.ts',
        'result.ts',
        'sso.ts',
      ]);

      const auditTs = await readFile(path.join(outDir, 'audit.ts'), 'utf8');
      expect(auditTs).toContain('LogVO');
      expect(auditTs).toContain('请勿手改');

      const resultTs = await readFile(path.join(outDir, 'result.ts'), 'utf8');
      expect(resultTs).toBe(RESULT_HELPER);
      expect(resultTs).toContain('PageData<T>');
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it('拉取文档失败时报错并带服务名', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('x', { status: 500 }))),
    );
    const outDir = await mkdtemp(path.join(tmpdir(), 'fm-gen-'));
    try {
      await expect(
        generateApiTypes({
          outDir,
          services: [{ name: 'audit', docsUrl: 'http://localhost:1/v3/api-docs' }],
        }),
      ).rejects.toThrow('[audit]');
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });
});
