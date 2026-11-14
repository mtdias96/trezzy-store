import { describe, expect, it, vi } from 'vitest';

import { Product } from '@application/entities/Product';
import { ValidationError } from '@application/errors/ValidationError';
import type { DrizzleClient } from '@infra/database/drizzle/DrizzleClient';
import type { BrandRepository } from '@infra/database/repositories/BrandRepository';
import type { CategoryRepository } from '@infra/database/repositories/CategoryRepository';
import type { MediaRepository } from '@infra/database/repositories/MediaRepository';
import type { ProductFamilyRepository } from '@infra/database/repositories/ProductFamilyRepository';
import type { ProductRepository } from '@infra/database/repositories/ProductRepository';

import { CreateProductUseCase } from './CreateProductUseCase';

const input: CreateProductUseCase.Input = {
  title: 'Camiseta Box Fit',
  description: 'Algodão pesado.',
  status: 'active',
  brandId: 'brand-1',
  categoryId: 'category-1',
  colorName: null,
  familyOf: null,
  variants: [
    { size: 'M', color: 'preto', sku: 'CAM-M-PT', priceInCents: 18990, stock: 10, active: true },
    { size: 'G', color: 'preto', sku: 'CAM-G-PT', priceInCents: 18990, stock: 0, active: true },
  ],
  mediaIds: ['m-cover', 'm-2'],
};

const confirmed = (id: string): MediaRepository.Usage => ({ id, uploadedAt: new Date(), inUse: false });

function makeSut() {
  const productRepository = {
    findExistingSkus: vi.fn<ProductRepository['findExistingSkus']>().mockResolvedValue([]),
    findSlugsStartingWith: vi.fn<ProductRepository['findSlugsStartingWith']>().mockResolvedValue([]),
    existsWithTitle: vi.fn<ProductRepository['existsWithTitle']>().mockResolvedValue(false),
    create: vi.fn<ProductRepository['create']>().mockResolvedValue(),
    findColorway: vi.fn<ProductRepository['findColorway']>().mockResolvedValue(null),
    findFamilyMembers: vi.fn<ProductRepository['findFamilyMembers']>().mockResolvedValue([]),
    setColorway: vi.fn<ProductRepository['setColorway']>().mockResolvedValue(),
  };
  const productFamilyRepository = { create: vi.fn<ProductFamilyRepository['create']>().mockResolvedValue() };
  const tx = {} as DrizzleClient.Transaction;
  const drizzle = { transaction: vi.fn((callback: (transaction: DrizzleClient.Transaction) => Promise<void>) => callback(tx)) };
  const brandRepository = {
    findById: vi.fn<BrandRepository['findById']>().mockResolvedValue({ id: 'brand-1' }),
  };
  const categoryRepository = {
    findById: vi.fn<CategoryRepository['findById']>().mockResolvedValue({ id: 'category-1', slug: 'camisetas', grid: 'apparel' }),
  };
  const mediaRepository = {
    findUsage: vi.fn<MediaRepository['findUsage']>().mockResolvedValue([confirmed('m-cover'), confirmed('m-2')]),
  };
  const sut = new CreateProductUseCase(
    productRepository as unknown as ProductRepository,
    brandRepository as unknown as BrandRepository,
    categoryRepository as unknown as CategoryRepository,
    mediaRepository as unknown as MediaRepository,
    productFamilyRepository as unknown as ProductFamilyRepository,
    drizzle as unknown as DrizzleClient,
  );

  return { sut, productRepository, brandRepository, categoryRepository, mediaRepository, productFamilyRepository, tx };
}

describe('CreateProductUseCase', () => {
  it('persists the product with its variants under a slug from the title', async () => {
    const { sut, productRepository } = makeSut();

    const { id } = await sut.execute(input);

    const [product] = productRepository.create.mock.calls[0]!;
    expect(product).toBeInstanceOf(Product);
    expect(product).toMatchObject({
      id,
      slug: 'camiseta-box-fit',
      title: 'Camiseta Box Fit',
      status: 'active',
      publishedAt: expect.any(Date),
    });
    expect(product.variants.map(({ sku }) => sku)).toEqual(['CAM-M-PT', 'CAM-G-PT']);
    expect(productRepository.findExistingSkus).toHaveBeenCalledWith(['CAM-M-PT', 'CAM-G-PT']);
  });

  it('suffixes the slug when another product has the same title', async () => {
    const { sut, productRepository } = makeSut();
    productRepository.findSlugsStartingWith.mockResolvedValue(['camiseta-box-fit']);

    await sut.execute(input);

    expect(productRepository.create.mock.calls[0]![0].slug).toBe('camiseta-box-fit-2');
  });

  it('generates the SKU of a variant sent without one, from the category and the product id', async () => {
    const { sut, productRepository } = makeSut();
    const [typed, untyped] = input.variants;

    const { id } = await sut.execute({ ...input, variants: [typed!, { ...untyped!, sku: undefined }] });

    const productCode = id.replace(/-/g, '').slice(0, 6).toUpperCase();
    const [product] = productRepository.create.mock.calls[0]!;
    expect(product.variants.map(({ sku }) => sku)).toEqual(['CAM-M-PT', `CAM-${productCode}-G-PRETO`]);
    expect(productRepository.findExistingSkus).toHaveBeenCalledWith(['CAM-M-PT', `CAM-${productCode}-G-PRETO`]);
  });

  it('reports a missing brand and category by field', async () => {
    const { sut, productRepository, brandRepository, categoryRepository } = makeSut();
    brandRepository.findById.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(null);

    const error = await sut.execute(input).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map(({ field }) => field)).toEqual(['brandId', 'categoryId']);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a title the same brand already uses, so the variants go to the existing product', async () => {
    const { sut, productRepository } = makeSut();
    productRepository.existsWithTitle.mockResolvedValue(true);

    const error = await sut.execute(input).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map(({ field }) => field)).toEqual(['title']);
    expect(productRepository.existsWithTitle).toHaveBeenCalledWith('brand-1', 'Camiseta Box Fit');
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a size outside the category grid', async () => {
    const { sut, productRepository, categoryRepository } = makeSut();
    categoryRepository.findById.mockResolvedValue({ id: 'category-1', slug: 'calcas', grid: 'num' });

    const error = await sut.execute(input).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map(({ field }) => field)).toEqual(['variants.0.size', 'variants.1.size']);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('points to the variant whose SKU another product already uses', async () => {
    const { sut, productRepository } = makeSut();
    productRepository.findExistingSkus.mockResolvedValue(['CAM-G-PT']);

    const error = await sut.execute(input).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues).toEqual([{ field: 'variants.1.sku', error: 'SKU already in use.' }]);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('saves the gallery in the order it was sent', async () => {
    const { sut, productRepository, mediaRepository } = makeSut();

    await sut.execute(input);

    expect(mediaRepository.findUsage).toHaveBeenCalledWith(['m-cover', 'm-2']);
    expect(productRepository.create.mock.calls[0]![0].mediaIds).toEqual(['m-cover', 'm-2']);
  });

  it('points to each photo that is missing, unconfirmed or already in use', async () => {
    const { sut, productRepository, mediaRepository } = makeSut();
    mediaRepository.findUsage.mockResolvedValue([
      { id: 'm-pending', uploadedAt: null, inUse: false },
      { id: 'm-used', uploadedAt: new Date(), inUse: true },
      confirmed('m-ok'),
    ]);

    const error = await sut
      .execute({ ...input, mediaIds: ['m-ok', 'm-missing', 'm-pending', 'm-used'] })
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues).toEqual([
      { field: 'mediaIds.1', error: 'Media not found.' },
      { field: 'mediaIds.2', error: 'Media upload is not confirmed.' },
      { field: 'mediaIds.3', error: 'Media is already in use.' },
    ]);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('requires a photo to create an active product', async () => {
    const { sut, productRepository, mediaRepository } = makeSut();
    mediaRepository.findUsage.mockResolvedValue([]);

    const error = await sut.execute({ ...input, mediaIds: [] }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map(({ field }) => field)).toEqual(['mediaIds']);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  describe('another color of a model', () => {
    const origin = { id: 'p-grey', brandId: 'brand-1', categoryId: 'category-1', familyId: null, colorName: '2 Tone Grey' };
    const linked = { ...input, colorName: 'Reflective Black', familyOf: 'p-grey' };

    it('creates the family with the origin product, in the same transaction as the new one', async () => {
      const { sut, productRepository, productFamilyRepository, tx } = makeSut();
      productRepository.findColorway.mockResolvedValue(origin);

      await sut.execute(linked);

      const [product, createTx] = productRepository.create.mock.calls[0]!;
      const [familyId] = productFamilyRepository.create.mock.calls[0]!;
      expect(product).toMatchObject({ familyId, colorName: 'Reflective Black' });
      expect(createTx).toBe(tx);
      expect(productRepository.setColorway).toHaveBeenCalledWith('p-grey', { familyId, colorName: '2 Tone Grey' }, tx);
    });

    it('joins the family the origin product already has', async () => {
      const { sut, productRepository, productFamilyRepository } = makeSut();
      productRepository.findColorway.mockResolvedValue({ ...origin, familyId: 'family-1' });
      productRepository.findFamilyMembers.mockResolvedValue([
        { id: 'p-grey', title: 'Old Skool', colorName: '2 Tone Grey', status: 'active', coverKey: null },
      ]);

      await sut.execute(linked);

      expect(productRepository.create.mock.calls[0]![0].familyId).toBe('family-1');
      expect(productFamilyRepository.create).not.toHaveBeenCalled();
      expect(productRepository.setColorway).not.toHaveBeenCalled();
    });

    it.each([
      ['a product of another category', { ...origin, categoryId: 'category-2' }, linked, 'familyOf'],
      ['an origin without a color name', { ...origin, colorName: null }, linked, 'familyOf'],
      ['a missing color name', origin, { ...linked, colorName: null }, 'colorName'],
      ['the color name of the origin', origin, { ...linked, colorName: '2 tone grey' }, 'colorName'],
    ])('rejects %s before writing anything', async (_case, found, request, field) => {
      const { sut, productRepository } = makeSut();
      productRepository.findColorway.mockResolvedValue(found);

      const error = await sut.execute(request).catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues.map((issue) => issue.field)).toEqual([field]);
      expect(productRepository.create).not.toHaveBeenCalled();
    });
  });
});
