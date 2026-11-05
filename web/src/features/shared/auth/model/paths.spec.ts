import { describe, expect, it } from 'vitest';

import { PANEL_HOME, toPanelPath } from './paths';

describe('toPanelPath', () => {
  it.each(['/admin', '/admin/pedidos', '/admin/pedidos?status=pago', '/admin#topo'])('keeps the panel path %s', (path) => {
    expect(toPanelPath(path)).toBe(path);
  });

  it.each([
    ['no path', undefined],
    ['an external URL', 'https://evil.com'],
    ['a protocol-relative URL', '//evil.com/admin'],
    ['a double slash inside the panel', '/admin//evil.com'],
    ['a backslash', '/admin\\evil.com'],
    ['a path outside the panel', '/conta'],
    ['a path that only starts like the panel', '/administrador'],
    ['the sign-in page', '/admin/entrar'],
  ])('falls back to the panel home for %s', (_case, path) => {
    expect(toPanelPath(path)).toBe(PANEL_HOME);
  });
});
