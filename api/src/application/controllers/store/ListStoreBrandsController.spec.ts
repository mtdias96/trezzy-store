import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { ListStoreBrandsUseCase } from '@application/useCases/store/ListStoreBrandsUseCase';

import { ListStoreBrandsController } from './ListStoreBrandsController';

function makeSut() {
  const brands = [{ slug: 'vans', name: 'Vans', productCount: 2, imageUrl: null }];
  const execute = vi.fn<ListStoreBrandsUseCase['execute']>().mockResolvedValue({ brands });
  const sut = new ListStoreBrandsController({ execute } as unknown as ListStoreBrandsUseCase);
  const request = (queryParams: Record<string, string>) => ({ body: undefined, params: {}, queryParams, accountId: null });

  return { sut, execute, request, brands };
}

describe('ListStoreBrandsController', () => {
  it('answers without an account, passing the limit and ignoring unknown parameters', async () => {
    const { sut, execute, request, brands } = makeSut();

    await expect(sut.execute(request({ limit: '8', featured: 'true' }))).resolves.toEqual({ statusCode: 200, body: { brands } });
    expect(execute).toHaveBeenCalledWith({ limit: 8 });
  });

  it('rejects a limit out of range', async () => {
    const { sut, execute, request } = makeSut();

    await expect(sut.execute(request({ limit: '0' }))).rejects.toBeInstanceOf(ValidationError);
    expect(execute).not.toHaveBeenCalled();
  });
});
