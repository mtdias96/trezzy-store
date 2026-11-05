import { describe, expect, it } from 'vitest';

import { shippingEstimateSchema } from './schema';

describe('shippingEstimateSchema', () => {
  it.each(['01310-100', '01310100'])('accepts %s', (cep) => {
    expect(shippingEstimateSchema.safeParse({ cep }).success).toBe(true);
  });

  it('explains what a valid CEP looks like', () => {
    const parsed = shippingEstimateSchema.safeParse({ cep: '0131' });

    expect(parsed.error?.issues[0]?.message).toBe('Digite um CEP com 8 números.');
  });
});
