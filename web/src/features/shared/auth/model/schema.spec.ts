import { describe, expect, it } from 'vitest';
import * as z from 'zod';

import { signInSchema } from './schema';

describe('signInSchema', () => {
  it('normalizes the e-mail and turns the checkbox into a boolean', () => {
    const result = signInSchema.parse({ email: '  Admin@Trezzy.com.BR ', password: 'segredo', remember: 'on' });

    expect(result).toEqual({ email: 'admin@trezzy.com.br', password: 'segredo', remember: true, next: '/admin' });
  });

  it('treats a missing checkbox as not remembering', () => {
    expect(signInSchema.parse({ email: 'a@trezzy.com.br', password: 'x' }).remember).toBe(false);
  });

  it('keeps a panel path to return to and drops anything else', () => {
    expect(signInSchema.parse({ email: 'a@trezzy.com.br', password: 'x', next: '/admin/pedidos' }).next).toBe('/admin/pedidos');
    expect(signInSchema.parse({ email: 'a@trezzy.com.br', password: 'x', next: 'https://evil.com' }).next).toBe('/admin');
  });

  it('reports field errors in pt-BR', () => {
    const result = signInSchema.safeParse({ email: 'nao-e-email', password: '' });

    expect(result.success).toBe(false);
    expect(result.error && z.flattenError(result.error).fieldErrors).toEqual({
      email: ['Informe um e-mail válido.'],
      password: ['Informe a senha.'],
    });
  });

  it('asks for the e-mail when it is blank', () => {
    const result = signInSchema.safeParse({ email: '   ', password: 'x' });

    expect(result.error && z.flattenError(result.error).fieldErrors.email).toEqual(['Informe o e-mail.']);
  });
});
