import { describe, expect, it, vi } from 'vitest';

import { applyFieldErrors } from './form';

type Values = { title: string; variants: { sku: string }[] };

describe('applyFieldErrors', () => {
  it('sets the first message of each field, keeping the nested path', () => {
    const setError = vi.fn();

    applyFieldErrors<Values>(setError, { title: ['Informe o título.', 'outra'], 'variants.1.sku': ['SKU já usado.'] });

    expect(setError).toHaveBeenCalledWith('title', { type: 'server', message: 'Informe o título.' });
    expect(setError).toHaveBeenCalledWith('variants.1.sku', { type: 'server', message: 'SKU já usado.' });
    expect(setError).toHaveBeenCalledTimes(2);
  });

  it('skips the fields the screen shows somewhere else and the empty ones', () => {
    const setError = vi.fn();

    applyFieldErrors<Values>(setError, { title: [], 'mediaIds.0': ['Foto já usada.'] }, (field) => !field.startsWith('mediaIds'));

    expect(setError).not.toHaveBeenCalled();
  });
});
