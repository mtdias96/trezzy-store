import { describe, expect, it } from 'vitest';

import { generateSku } from './sku';

const productId = '3f9a2c71-0b4d-4e8a-9c1f-2d3e4f5a6b7c';

describe('generateSku', () => {
  it('joins category, product, size and color', () => {
    expect(generateSku({ categorySlug: 'camisetas', productId, size: 'M', color: 'preto' })).toBe('CAM-3F9A2C-M-PRETO');
  });

  it('spells the whole color without accents, so similar colors never collide', () => {
    expect(generateSku({ categorySlug: 'camisetas', productId, size: 'GG', color: 'cinza mescla' })).toBe(
      'CAM-3F9A2C-GG-CINZA-MESCLA',
    );
    expect(generateSku({ categorySlug: 'camisetas', productId, size: 'P', color: 'vermelho' })).not.toBe(
      generateSku({ categorySlug: 'camisetas', productId, size: 'P', color: 'verde' }),
    );
  });

  it('skips the hyphens of a compound category and the color when there is none', () => {
    expect(generateSku({ categorySlug: 'oculos-de-sol', productId, size: 'U', color: '' })).toBe('OCU-3F9A2C-U');
  });

  it('produces the format the database accepts', () => {
    expect(generateSku({ categorySlug: 'calcas', productId, size: '42', color: 'off-white' })).toMatch(
      /^[A-Z0-9]+(-[A-Z0-9]+)*$/,
    );
  });
});
