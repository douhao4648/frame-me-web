import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, createClient } from './index';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function stubFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    return Promise.resolve(handler(url, init));
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createClient', () => {
  it('成功响应解包 data', async () => {
    stubFetch(() => jsonResponse({ code: 200, msg: 'ok', data: { id: 1 } }));
    const client = createClient();
    await expect(client.get<{ id: number }>('/api/x')).resolves.toEqual({ id: 1 });
  });

  it('query 拼接：剔除空值、数组重复拼接', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ code: 200, msg: 'ok', data: null })));
    vi.stubGlobal('fetch', fetchMock);
    const client = createClient();
    await client.get('/api/x', { query: { a: 1, b: undefined, c: '', d: ['x', 'y'] } });
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).toContain('a=1');
    expect(url).toContain('d=x&d=y');
    expect(url).not.toContain('b=');
    expect(url).not.toContain('c=');
  });

  it('注入 token 头（默认 Authorization Bearer）', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ code: 200, msg: 'ok', data: null })));
    vi.stubGlobal('fetch', fetchMock);
    const client = createClient({ getToken: () => 'tk' });
    await client.get('/api/x');
    const headers = (fetchMock.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer tk');
  });

  it('sa-token 下游可换 headerName/tokenPrefix', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ code: 200, msg: 'ok', data: null })));
    vi.stubGlobal('fetch', fetchMock);
    const client = createClient({ getToken: () => 'tk', headerName: 'satoken', tokenPrefix: '' });
    await client.get('/api/x');
    const headers = (fetchMock.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers['satoken']).toBe('tk');
  });

  it('业务错误码抛 ApiError，携带 code/msg/rid', async () => {
    stubFetch(() => jsonResponse({ code: 500, msg: '系统错误', data: null, rid: 'r-1' }));
    const client = createClient();
    const err = await client.get('/api/x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe(500);
    expect((err as ApiError).rid).toBe('r-1');
  });

  it('401 → 刷新成功后自动重试', async () => {
    let calls = 0;
    stubFetch((_url, init) => {
      calls += 1;
      const headers = (init?.headers ?? {}) as Record<string, string>;
      // 第一次（旧 token）401，第二次（新 token）成功
      return headers['Authorization'] === 'Bearer new'
        ? jsonResponse({ code: 200, msg: 'ok', data: 'done' })
        : jsonResponse({ code: 401, msg: '未授权', data: null }, 401);
    });
    let token = 'old';
    const client = createClient({
      getToken: () => token,
      refresh: async () => {
        token = 'new';
        return true;
      },
    });
    await expect(client.get<string>('/api/x')).resolves.toBe('done');
    expect(calls).toBe(2);
  });

  it('并发 401 只刷新一次（single-flight）', async () => {
    let refreshed = false;
    stubFetch(() =>
      refreshed
        ? jsonResponse({ code: 200, msg: 'ok', data: 'done' })
        : jsonResponse({ code: 401, msg: 'x', data: null }, 401),
    );
    let refreshCalls = 0;
    const client = createClient({
      refresh: async () => {
        refreshCalls += 1;
        refreshed = true;
        return true;
      },
    });
    const results = await Promise.allSettled([client.get('/a'), client.get('/b'), client.get('/c')]);
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(refreshCalls).toBe(1);
  });

  it('刷新失败调用 onUnauthorized 并抛 401', async () => {
    stubFetch(() => jsonResponse({ code: 401, msg: '未授权', data: null }, 401));
    const onUnauthorized = vi.fn();
    const client = createClient({
      refresh: async () => false,
      onUnauthorized,
    });
    await expect(client.get('/api/x')).rejects.toMatchObject({ code: 401 });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('page() 自动带分页参数并返回 PageData', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          code: 200,
          msg: 'ok',
          data: { current: 2, size: 20, total: 100, pages: 5, records: [{ id: 1 }] },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = createClient();
    const page = await client.page<{ id: number }>('/api/log/page', { current: 2, size: 20 });
    expect(page.records).toHaveLength(1);
    expect(page.total).toBe(100);
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).toContain('current=2');
    expect(url).toContain('size=20');
  });
});
