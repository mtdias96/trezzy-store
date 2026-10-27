import { describe, expect, it } from 'vitest';

import { findActiveHref, findPage, findSection, visibleNavItems } from './nav';

describe('visibleNavItems', () => {
  it('shows the items the account has permission for, without the permission', () => {
    expect(visibleNavItems(['dashboard:access'])).toContainEqual({ id: 'dashboard', label: 'Dashboard', href: '/admin' });
  });

  it('hides every item from an account without permissions', () => {
    expect(visibleNavItems([])).toEqual([]);
  });

  it('ignores permissions the panel does not know yet', () => {
    expect(visibleNavItems(['reports:read'])).toEqual([]);
  });
});

describe('findSection', () => {
  it('names the panel home', () => {
    expect(findSection('/admin')).toEqual({ id: 'dashboard', label: 'Dashboard', href: '/admin' });
  });

  it('finds nothing outside the panel', () => {
    expect(findSection('/produtos')).toBeUndefined();
  });
});

describe('findPage', () => {
  it('names a page inside a section', () => {
    expect(findPage('/admin/produtos/novo')?.label).toBe('Novo produto');
  });

  it('names a page with an id in the path', () => {
    expect(findPage('/admin/produtos/0f8e2c1a')?.label).toBe('Editar produto');
  });

  it('finds nothing for the section itself', () => {
    expect(findPage('/admin/produtos')).toBeUndefined();
  });
});

describe('findActiveHref', () => {
  const hrefs = ['/admin', '/admin/pedidos'];

  it('matches the current page', () => {
    expect(findActiveHref(hrefs, '/admin')).toBe('/admin');
  });

  it('prefers the closest ancestor over the panel home', () => {
    expect(findActiveHref(hrefs, '/admin/pedidos/42')).toBe('/admin/pedidos');
  });

  it('falls back to the panel home for pages without their own item', () => {
    expect(findActiveHref(hrefs, '/admin/perfil')).toBe('/admin');
  });

  it('does not match a path that only shares the prefix', () => {
    expect(findActiveHref(['/admin/pedidos'], '/admin/pedidos-antigos')).toBeUndefined();
  });
});
