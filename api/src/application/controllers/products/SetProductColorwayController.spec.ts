import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { SetProductColorwayUseCase } from '@application/useCases/products/SetProductColorwayUseCase';

import { SetProductColorwayController } from './SetProductColorwayController';

const PRODUCT_ID = '0d9c3c8e-2f1a-4b6e-9a7d-1c2b3a4d5e6f';
const OTHER_ID = '7A1B2C3D-4E5F-4A6B-8C7D-9E0F1A2B3C4D';

function makeSut() {
  const execute = vi.fn<SetProductColorwayUseCase['execute']>().mockResolvedValue();
  const sut = new SetProductColorwayController({ execute } as unknown as SetProductColorwayUseCase);
  const request = (body: unknown, id: unknown = PRODUCT_ID) => ({
    body,
    params: { id },
    queryParams: {},
    accountId: 'admin-1',
    permissions: ['products:write' as const],
  });

  return { sut, execute, request };
}

describe('SetProductColorwayController', () => {
  it('trims the color name, lowercases the product id and answers 204', async () => {
    const { sut, execute, request } = makeSut();

    await expect(sut.execute(request({ colorName: ' Reflective Black ', familyOf: OTHER_ID }))).resolves.toEqual({ statusCode: 204 });
    expect(execute).toHaveBeenCalledWith({ productId: PRODUCT_ID, colorName: 'Reflective Black', familyOf: OTHER_ID.toLowerCase() });
  });

  it('keeps the family when familyOf is left out, and leaves it with null', async () => {
    const { sut, execute, request } = makeSut();

    await sut.execute(request({ colorName: 'Black' }));
    await sut.execute(request({ familyOf: null }));

    expect(execute).toHaveBeenNthCalledWith(1, { productId: PRODUCT_ID, colorName: 'Black', familyOf: undefined });
    expect(execute).toHaveBeenNthCalledWith(2, { productId: PRODUCT_ID, colorName: null, familyOf: null });
  });

  it.each([
    [{ colorName: '' }, PRODUCT_ID],
    [{ familyOf: 'p-grey' }, PRODUCT_ID],
    [{ colorName: 'Black' }, 'not-a-uuid'],
  ])('rejects %o before calling the use case', async (body, id) => {
    const { sut, execute, request } = makeSut();

    await expect(sut.execute(request(body, id))).rejects.toBeInstanceOf(ValidationError);
    expect(execute).not.toHaveBeenCalled();
  });
});
