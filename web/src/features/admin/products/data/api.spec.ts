import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authorizedHttp } from '@/features/shared/auth/session/authorized-http';
import { HttpError } from '@/lib/http';

import { createMediaUpload, fetchProduct, fetchProducts } from './api';

vi.mock('@/config/env', () => ({ env: { API_URL: 'https://api.test' } }));
vi.mock('@/features/shared/auth/session/authorized-http', () => ({ authorizedHttp: vi.fn() }));

// A API "responde" o payload, e o schema de cada rota valida como no app.
function respondWith(payload: unknown) {
  vi.mocked(authorizedHttp).mockImplementation(async (_path, { schema }) => schema.parse(payload));
}

const variant = { id: 'v1', size: 'M', color: 'preto', sku: 'SLC-M-PRE', priceInCents: 68990, stock: 10, active: true };
const summary = {
  id: 'p1',
  title: 'Stock Logo Crew',
  status: 'active',
  brandId: 'b1',
  categoryId: 'c1',
  coverUrl: null,
  variants: [variant],
  updatedAt: '2026-10-26T21:30:00-03:00',
};

describe('catalog API contract', () => {
  beforeEach(() => {
    vi.mocked(authorizedHttp).mockReset();
  });

  it('reads the product list from GET /admin/products', async () => {
    respondWith({ products: [summary] });

    await expect(fetchProducts()).resolves.toEqual([summary]);
    expect(authorizedHttp).toHaveBeenCalledWith('/admin/products', expect.anything());
  });

  it('refuses a price that is not integer cents', async () => {
    respondWith({ products: [{ ...summary, variants: [{ ...variant, priceInCents: 689.9 }] }] });

    await expect(fetchProducts()).rejects.toThrow();
  });

  it('reads one product, with description and gallery', async () => {
    const product = { ...summary, coverUrl: undefined, description: '<p>Moletom</p>', media: [{ id: 'm1', url: 'https://cdn.trezzy.com/m1.webp' }] };

    respondWith({ product });

    await expect(fetchProduct('p1')).resolves.toMatchObject({ id: 'p1', media: [{ id: 'm1' }] });
    expect(authorizedHttp).toHaveBeenCalledWith('/admin/products/p1', expect.anything());
  });

  it('turns a 404 into a missing product and keeps other errors', async () => {
    vi.mocked(authorizedHttp).mockRejectedValueOnce(new HttpError(404, null));
    await expect(fetchProduct('x')).resolves.toBeNull();

    vi.mocked(authorizedHttp).mockRejectedValueOnce(new HttpError(500, null));
    await expect(fetchProduct('x')).rejects.toThrow('HTTP 500');
  });

  it('asks for a presigned URL with POST /admin/media', async () => {
    respondWith({ media: { id: 'm1', uploadUrl: 'https://s3.example/m1' } });

    await expect(createMediaUpload({ contentType: 'image/webp', sizeBytes: 1024 })).resolves.toEqual({
      id: 'm1',
      uploadUrl: 'https://s3.example/m1',
    });
    expect(authorizedHttp).toHaveBeenCalledWith(
      '/admin/media',
      expect.objectContaining({ method: 'POST', body: { contentType: 'image/webp', sizeBytes: 1024 } }),
    );
  });
});
