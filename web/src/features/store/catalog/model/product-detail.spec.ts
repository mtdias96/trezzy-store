import { describe, expect, it } from 'vitest';

import { initialColorId, isSoldOut, metaDescription, productJsonLd, sizeOptions } from './product-detail';
import type { ProductDetail } from './types';

const product: ProductDetail = {
  id: 'camiseta-boxy',
  slug: 'camiseta-boxy',
  name: 'Camiseta Boxy “Concreto”',
  brand: 'Mormaço',
  href: '/',
  priceInCents: 22990,
  compareAtPriceInCents: null,
  installments: null,
  pixPriceInCents: null,
  rating: 4.7,
  reviewCount: 12,
  reviewSummary: { distribution: [0, 0, 0, 0, 0], fit: null },
  tag: null,
  description: ['Algodão pesado e modelagem boxy.'],
  composition: ['100% algodão'],
  department: { name: 'Streetwear', href: '/' },
  category: null,
  images: [
    { url: 'https://cdn.trezzy.com/boxy.jpg', alt: '' },
    { url: '/preview/boxy.jpg', alt: '' },
  ],
  colors: [
    { id: 'preto', name: 'Preto', swatch: 'black' },
    { id: 'branco', name: 'Branco', swatch: 'white' },
  ],
  sizes: ['P', 'M', 'G'],
  variants: [
    { id: 'preto-p', colorId: 'preto', size: 'P', inStock: false },
    { id: 'preto-m', colorId: 'preto', size: 'M', inStock: false },
    { id: 'branco-p', colorId: 'branco', size: 'P', inStock: true },
    { id: 'branco-m', colorId: 'branco', size: 'M', inStock: false },
  ],
  sizeChart: null,
};

describe('sizeOptions', () => {
  it('keeps the grid order and marks what is out of stock in the chosen color', () => {
    expect(sizeOptions(product, 'branco')).toEqual([
      { size: 'P', variantId: 'branco-p' },
      { size: 'M', variantId: null },
      { size: 'G', variantId: null },
    ]);
  });
});

describe('initialColorId', () => {
  it('opens on the first color with stock', () => {
    expect(initialColorId(product)).toBe('branco');
  });

  it('falls back to the first color when everything sold out', () => {
    expect(initialColorId({ ...product, variants: [] })).toBe('preto');
  });
});

describe('isSoldOut', () => {
  it('is sold out only when no variant has stock', () => {
    expect(isSoldOut(product)).toBe(false);
    expect(isSoldOut({ ...product, variants: product.variants.map((variant) => ({ ...variant, inStock: false })) })).toBe(true);
  });
});

describe('metaDescription', () => {
  it('uses the first paragraph when it fits', () => {
    expect(metaDescription(product)).toBe('Algodão pesado e modelagem boxy.');
  });

  it('cuts long text on a whole word, under 160 characters', () => {
    const description = metaDescription({ ...product, description: ['palavra '.repeat(40)] });

    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith('palavra…')).toBe(true);
  });
});

describe('productJsonLd', () => {
  it('describes price in BRL, stock, rating and only absolute images', () => {
    expect(productJsonLd(product)).toMatchObject({
      '@type': 'Product',
      image: ['https://cdn.trezzy.com/boxy.jpg'],
      aggregateRating: { ratingValue: 4.7, reviewCount: 12 },
      offers: { priceCurrency: 'BRL', price: '229.90', availability: 'https://schema.org/InStock' },
    });
  });

  it('leaves the rating out without reviews', () => {
    expect(productJsonLd({ ...product, reviewCount: 0 })).not.toHaveProperty('aggregateRating');
  });
});
