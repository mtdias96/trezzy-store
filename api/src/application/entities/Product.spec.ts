import { describe, expect, it } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';

import { Product } from './Product';

const variant = { size: 'M', color: 'preto', sku: 'CAM-M-PT', priceInCents: 18990, stock: 10, active: true };

const input: Product.CreateInput = {
  slug: 'camiseta-box-fit',
  title: 'Camiseta Box Fit',
  description: '',
  status: 'draft',
  brandId: 'brand-1',
  category: { id: 'category-1', slug: 'camisetas', grid: 'apparel' },
  variants: [variant],
};

describe('Product.create', () => {
  it('generates ids for the product and its variants and keeps a typed SKU', () => {
    const product = Product.create(input);

    expect(product.id).toEqual(expect.any(String));
    expect(product.categoryId).toBe('category-1');
    expect(product.variants[0]).toEqual({ ...variant, id: expect.any(String) });
  });

  it('generates the SKU of a variant without one from the category and the product id', () => {
    const product = Product.create({ ...input, variants: [{ ...variant, sku: undefined }] });

    const productCode = product.id.replace(/-/g, '').slice(0, 6).toUpperCase();
    expect(product.variants[0]!.sku).toBe(`CAM-${productCode}-M-PRETO`);
  });

  it('leaves a draft unpublished and publishes a product created as active', () => {
    expect(Product.create(input).publishedAt).toBeNull();
    expect(Product.create({ ...input, status: 'active' }).publishedAt).toBeInstanceOf(Date);
  });

  it('rejects sizes outside the category grid, by variant', () => {
    const error = (() => {
      try {
        Product.create({ ...input, variants: [variant, { ...variant, size: '42', sku: 'CAM-42-PT' }] });

        return null;
      } catch (reason) {
        return reason;
      }
    })();

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map(({ field }) => field)).toEqual(['variants.1.size']);
  });
});
