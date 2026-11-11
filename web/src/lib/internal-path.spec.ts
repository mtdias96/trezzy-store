import { describe, expect, it } from 'vitest';

import { internalPathSchema } from './internal-path';

describe('internalPathSchema', () => {
  it.each([
    '/',
    '/produtos',
    '/sneakers/corrida',
    '/produtos?promocao=true',
    '/produtos?ordem=mais-vendidos#lista',
  ])('accepts the store path %s', (path) => {
    expect(internalPathSchema.safeParse(path).success).toBe(true);
  });

  it.each([
    '',
    'produtos',
    'https://evil.com',
    '//evil.com/x',
    '/\\evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    '/produtos\r\n',
  ])('rejects %j, which can leave the store', (path) => {
    expect(internalPathSchema.safeParse(path).success).toBe(false);
  });
});
