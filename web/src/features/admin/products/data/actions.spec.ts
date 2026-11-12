import { revalidateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/lib/http';

import { createProduct, finishMediaUpload, startMediaUpload } from './actions';
import { confirmMediaUpload, createMediaUpload, createProduct as createProductRequest } from './api';

vi.mock('@/config/env', () => ({ env: { API_URL: 'https://api.test' } }));
vi.mock('./api', () => ({ createMediaUpload: vi.fn(), confirmMediaUpload: vi.fn(), createProduct: vi.fn() }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@/features/shared/auth/session/session', () => ({ requireAdminSession: vi.fn() }));

describe('startMediaUpload', () => {
  beforeEach(() => {
    vi.mocked(createMediaUpload).mockReset();
  });

  it('refuses a file the API would refuse, without calling it', async () => {
    await expect(startMediaUpload({ contentType: 'image/gif', sizeBytes: 1024 })).resolves.toEqual({
      ok: false,
      error: 'Use JPG, PNG ou WEBP de até 10 MB.',
    });
    expect(createMediaUpload).not.toHaveBeenCalled();
  });

  it('returns the media id and the presigned URL', async () => {
    vi.mocked(createMediaUpload).mockResolvedValue({ id: 'm1', uploadUrl: 'https://s3.example/m1' });

    await expect(startMediaUpload({ contentType: 'image/png', sizeBytes: 1024 })).resolves.toEqual({
      ok: true,
      data: { mediaId: 'm1', uploadUrl: 'https://s3.example/m1' },
    });
  });

  it('explains a failure from the API', async () => {
    vi.mocked(createMediaUpload).mockRejectedValue(new HttpError(503, null));

    await expect(startMediaUpload({ contentType: 'image/png', sizeBytes: 1024 })).resolves.toMatchObject({ ok: false });
  });
});

describe('finishMediaUpload', () => {
  it('confirms the upload with the API', async () => {
    vi.mocked(confirmMediaUpload).mockResolvedValue();

    await expect(finishMediaUpload('m1')).resolves.toEqual({ ok: true, data: undefined });
    expect(confirmMediaUpload).toHaveBeenCalledWith('m1');
  });
});

describe('createProduct', () => {
  const input = {
    title: 'Camiseta Lost Tsunami Ride',
    description: '',
    status: 'active',
    brandId: '0d9c3c8e-2f1a-4b6e-9a7d-1c2b3a4d5e6f',
    categoryId: '7a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
    variants: [{ size: 'P', color: 'preto', priceInCents: 15990, stock: 2, active: true }],
    mediaIds: ['3f2b8c1d-4e5a-4b6c-9d7e-8f9a0b1c2d3e'],
  };

  beforeEach(() => {
    vi.mocked(createProductRequest).mockReset();
  });

  it('creates the product and invalidates the storefront catalog', async () => {
    vi.mocked(createProductRequest).mockResolvedValue({ id: 'p-1' });

    await expect(createProduct(null, input)).resolves.toEqual({ ok: true, data: undefined });
    expect(createProductRequest).toHaveBeenCalledWith(input);
    expect(revalidateTag).toHaveBeenCalledWith('catalog', 'max');
  });

  it('points to the fields the schema refuses, without calling the API', async () => {
    const result = await createProduct(null, { ...input, title: '', mediaIds: [] });

    expect(result).toMatchObject({ ok: false, fieldErrors: { title: ['Informe o título.'], mediaIds: ['Produto ativo precisa de pelo menos uma foto.'] } });
    expect(createProductRequest).not.toHaveBeenCalled();
  });

  it('translates the API validation errors to the same fields', async () => {
    vi.mocked(createProductRequest).mockRejectedValue(new HttpError(400, {
      error: {
        code: 'VALIDATION',
        message: [
          { field: 'variants.0.sku', error: 'SKU already in use.' },
          { field: 'mediaIds.0', error: 'Media is already in use.' },
          { field: 'title', error: 'Something new.' },
        ],
      },
    }));

    await expect(createProduct(null, input)).resolves.toEqual({
      ok: false,
      error: 'Revise os campos destacados.',
      fieldErrors: {
        'variants.0.sku': ['SKU já usado em outro produto.'],
        'mediaIds.0': ['Foto já usada em outro produto.'],
        title: ['Valor inválido.'],
      },
    });
  });

  it('explains a photo taken by another product at the same time', async () => {
    vi.mocked(createProductRequest).mockRejectedValue(
      new HttpError(409, { error: { code: 'CONFLICT', message: 'A photo is already in use by another product.' } }),
    );

    const result = await createProduct(null, input);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain('outro produto');
  });

  it('explains a title saved by another admin at the same time', async () => {
    vi.mocked(createProductRequest).mockRejectedValue(
      new HttpError(409, { error: { code: 'CONFLICT', message: 'A product with this title was just created.' } }),
    );

    const result = await createProduct(null, input);

    expect(!result.ok && result.error).toContain('título');
  });

  it('turns a size outside the category grid into a message with the grid', async () => {
    vi.mocked(createProductRequest).mockRejectedValue(new HttpError(400, {
      error: { code: 'VALIDATION', message: [{ field: 'variants.0.size', error: 'Size must be one of: PP, P, M, G, GG, XGG.' }] },
    }));

    await expect(createProduct(null, input)).resolves.toMatchObject({
      fieldErrors: { 'variants.0.size': ['Fora da grade da categoria (PP, P, M, G, GG, XGG).'] },
    });
  });

  it('says to try again when the API is down', async () => {
    vi.mocked(createProductRequest).mockRejectedValue(new HttpError(503, null));

    await expect(createProduct(null, input)).resolves.toEqual({
      ok: false,
      error: 'Não foi possível salvar agora. Tente de novo em instantes.',
    });
  });
});
