// __Host-: o browser só aceita o cookie com Secure, Path=/ e sem Domain, e um subdomínio não consegue sobrescrevê-lo.
// Em dev, o Secure funciona em http://localhost; pelo IP da rede, só com HTTPS (next dev --experimental-https).
export const ACCESS_TOKEN_COOKIE = '__Host-trezzy-access';
export const REFRESH_TOKEN_COOKIE = '__Host-trezzy-refresh';

// httpOnly: o JavaScript da página não lê os tokens, então um XSS não consegue roubá-los.
export const SESSION_COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' } as const;
