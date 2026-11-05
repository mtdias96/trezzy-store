import { afterEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

import { http, HttpError, isRequestFailure } from './http';

vi.mock('@/config/env', () => ({ env: { API_URL: 'https://api.test' } }));

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

function lastRequest() {
  const [url, init] = fetchMock.mock.calls.at(-1) ?? [];

  return { url, init };
}

describe('http', () => {
  it('calls the API URL and returns the validated body', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'p1' })));

    const product = await http('/products/p1', { schema: z.object({ id: z.string() }) });

    expect(product).toEqual({ id: 'p1' });
    expect(lastRequest().url).toBe('https://api.test/products/p1');
  });

  it('sends the body as JSON', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await http('/auth/signout', { method: 'POST', body: { refreshToken: 't1' }, schema: z.undefined() });

    const { init } = lastRequest();
    expect(init?.body).toBe('{"refreshToken":"t1"}');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
  });

  it('throws HttpError with the status and the parsed payload', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: { code: 'NOT_FOUND' } }), { status: 404 }));

    const request = http('/products/x', { schema: z.object({}) });

    await expect(request).rejects.toBeInstanceOf(HttpError);
    await expect(request).rejects.toMatchObject({ status: 404, payload: { error: { code: 'NOT_FOUND' } } });
  });

  it('keeps a non-JSON error body as text', async () => {
    fetchMock.mockResolvedValue(new Response('Bad Gateway', { status: 502 }));

    await expect(http('/products', { schema: z.array(z.unknown()) })).rejects.toMatchObject({
      status: 502,
      payload: 'Bad Gateway',
    });
  });

  it('rejects a response that does not match the schema', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 1 })));

    await expect(http('/products/p1', { schema: z.object({ id: z.string() }) })).rejects.toBeInstanceOf(z.ZodError);
  });
});

describe('isRequestFailure', () => {
  it.each([
    ['an API error', new HttpError(500, 'Internal Server Error')],
    ['a timeout', new DOMException('The operation timed out.', 'TimeoutError')],
    ['an aborted request', new DOMException('The operation was aborted.', 'AbortError')],
    ['a network error', new TypeError('fetch failed')],
  ])('is true for %s', (_case, error) => {
    expect(isRequestFailure(error)).toBe(true);
  });

  it.each([
    ['a schema mismatch', new z.ZodError([])],
    ['a bug', new TypeError('Cannot read properties of undefined')],
  ])('is false for %s', (_case, error) => {
    expect(isRequestFailure(error)).toBe(false);
  });
});
