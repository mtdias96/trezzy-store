import { describe, expect, it } from 'vitest';

import { newsletterSchema } from './schema';

function firstError(input: unknown) {
  const parsed = newsletterSchema.safeParse(input);

  return parsed.success ? undefined : parsed.error.issues[0]?.message;
}

describe('newsletterSchema', () => {
  it('trims and lowercases the e-mail', () => {
    expect(newsletterSchema.parse({ email: '  Voce@Trezzy.com.BR ' })).toEqual({ email: 'voce@trezzy.com.br' });
  });

  it('asks for the e-mail when it is missing or blank', () => {
    expect(firstError({ email: null })).toBe('Digite seu e-mail.');
    expect(firstError({ email: '   ' })).toBe('Digite seu e-mail.');
  });

  it('rejects an invalid e-mail', () => {
    expect(firstError({ email: 'voce@trezzy' })).toBe('Digite um e-mail válido.');
  });
});
