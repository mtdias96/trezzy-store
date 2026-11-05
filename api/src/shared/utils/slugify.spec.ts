import { describe, expect, it } from 'vitest';

import { nextAvailableSlug, slugify } from './slugify';

describe('slugify', () => {
  it('drops accents and joins words with hyphens', () => {
    expect(slugify('  Calça Cargo — Edição Ação!  ')).toBe('calca-cargo-edicao-acao');
  });

  it('returns an empty slug when nothing is a letter or a number', () => {
    expect(slugify('!!! ✨')).toBe('');
  });

  it('caps the length without leaving a trailing hyphen', () => {
    const slug = slugify(`${'a'.repeat(79)} b`);

    expect(slug).toBe('a'.repeat(79));
  });
});

describe('nextAvailableSlug', () => {
  it('keeps the base when it is free', () => {
    expect(nextAvailableSlug('camiseta', ['camiseta-preta'])).toBe('camiseta');
  });

  it('appends the first free suffix', () => {
    expect(nextAvailableSlug('camiseta', ['camiseta', 'camiseta-2', 'camiseta-4'])).toBe('camiseta-3');
  });
});
