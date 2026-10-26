// Escrito pelo PreTokenGeneration para quem está no grupo admin do Cognito e exigido pelas rotas de admin no serverless.yml.
export const ADMIN_SCOPE = 'trezzy/admin';

// A claim `scope` do access token é uma string com os scopes separados por espaço.
export function readScopes(scopeClaim: unknown): string[] {
  return typeof scopeClaim === 'string' ? scopeClaim.split(' ').filter(Boolean) : [];
}
