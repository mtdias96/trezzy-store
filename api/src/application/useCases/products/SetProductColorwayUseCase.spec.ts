import { describe, expect, it, vi } from 'vitest';

import type { ColorwayProduct } from '@application/entities/colorway';
import { ErrorCode } from '@application/errors/ErrorCode';
import { ValidationError } from '@application/errors/ValidationError';
import type { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import type { ProductFamilyRepository } from '@infra/database/repositories/ProductFamilyRepository';
import type { ProductRepository } from '@infra/database/repositories/ProductRepository';

import { SetProductColorwayUseCase } from './SetProductColorwayUseCase';

const black: ColorwayProduct = { id: 'p-black', brandId: 'vans', categoryId: 'tenis', familyId: null, colorName: null };
const grey: ColorwayProduct = { id: 'p-grey', brandId: 'vans', categoryId: 'tenis', familyId: null, colorName: '2 Tone Grey' };
const member = (id: string, colorName: string) => ({ id, title: id, colorName, status: 'active' as const, coverKey: null });

function makeSut(products: ColorwayProduct[]) {
  const productRepository = {
    findColorway: vi.fn<ProductRepository['findColorway']>((id) => Promise.resolve(products.find((item) => item.id === id) ?? null)),
    findFamilyMembers: vi.fn<ProductRepository['findFamilyMembers']>().mockResolvedValue([]),
    setColorway: vi.fn<ProductRepository['setColorway']>().mockResolvedValue(),
  };
  const productFamilyRepository = {
    create: vi.fn<ProductFamilyRepository['create']>().mockResolvedValue(),
    deleteIfAlone: vi.fn<ProductFamilyRepository['deleteIfAlone']>().mockResolvedValue(),
  };
  const tx = {} as DrizzleClient.Transaction;
  const drizzle = { transaction: vi.fn((callback: (transaction: DrizzleClient.Transaction) => Promise<void>) => callback(tx)) };
  const sut = new SetProductColorwayUseCase(
    productRepository as unknown as ProductRepository,
    productFamilyRepository as unknown as ProductFamilyRepository,
    drizzle as unknown as DrizzleClient,
  );

  return { sut, productRepository, productFamilyRepository, tx };
}

describe('SetProductColorwayUseCase', () => {
  it('links two products without a family into a new one, naming the color', async () => {
    const { sut, productRepository, productFamilyRepository, tx } = makeSut([black, grey]);

    await sut.execute({ productId: 'p-black', colorName: 'Reflective Black', familyOf: 'p-grey' });

    const [familyId] = productFamilyRepository.create.mock.calls[0]!;
    expect(productRepository.setColorway).toHaveBeenCalledWith('p-grey', { familyId, colorName: '2 Tone Grey' }, tx);
    expect(productRepository.setColorway).toHaveBeenCalledWith('p-black', { familyId, colorName: 'Reflective Black' }, tx);
  });

  it('renames the color and keeps the family when familyOf is left out', async () => {
    const { sut, productRepository, productFamilyRepository } = makeSut([{ ...black, familyId: 'family-1', colorName: 'Black' }]);
    productRepository.findFamilyMembers.mockResolvedValue([member('p-black', 'Black'), member('p-grey', '2 Tone Grey')]);

    await sut.execute({ productId: 'p-black', colorName: 'Reflective Black' });

    expect(productRepository.setColorway).toHaveBeenCalledWith('p-black', { familyId: 'family-1', colorName: 'Reflective Black' }, expect.anything());
    expect(productFamilyRepository.create).not.toHaveBeenCalled();
    expect(productFamilyRepository.deleteIfAlone).not.toHaveBeenCalled();
  });

  it('leaves the family and dissolves it when a single color remains', async () => {
    const { sut, productRepository, productFamilyRepository, tx } = makeSut([{ ...black, familyId: 'family-1', colorName: 'Black' }]);

    await sut.execute({ productId: 'p-black', colorName: null, familyOf: null });

    expect(productRepository.setColorway).toHaveBeenCalledWith('p-black', { familyId: null, colorName: null }, tx);
    expect(productFamilyRepository.deleteIfAlone).toHaveBeenCalledWith('family-1', tx);
  });

  it('checks the name against the other colors only, not the product itself', async () => {
    const { sut, productRepository } = makeSut([{ ...black, familyId: 'family-1', colorName: 'Black' }]);
    productRepository.findFamilyMembers.mockResolvedValue([member('p-black', 'Black'), member('p-grey', '2 Tone Grey')]);

    await expect(sut.execute({ productId: 'p-black', colorName: 'black' })).resolves.toBeUndefined();
    await expect(sut.execute({ productId: 'p-black', colorName: '2 tone grey' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('answers NOT_FOUND for an unknown product and writes nothing', async () => {
    const { sut, productRepository } = makeSut([]);

    await expect(sut.execute({ productId: 'p-x', colorName: null })).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    expect(productRepository.setColorway).not.toHaveBeenCalled();
  });

  it('rejects a link to a product of another category before writing', async () => {
    const { sut, productRepository } = makeSut([black, { ...grey, categoryId: 'camisetas' }]);

    const error = await sut.execute({ productId: 'p-black', colorName: 'Black', familyOf: 'p-grey' }).catch((caught: unknown) => caught);

    expect((error as ValidationError).issues.map(({ field }) => field)).toEqual(['familyOf']);
    expect(productRepository.setColorway).not.toHaveBeenCalled();
  });
});
