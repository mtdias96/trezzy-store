import type { Route } from 'next';

// Espelha as permissões do catálogo da API (application/authorization/Permission.ts) que abrem um item do menu.
type Permission = 'dashboard:access';

export type PanelNavId = 'dashboard' | 'orders' | 'products' | 'inventory' | 'coupons' | 'brands-categories';

export type PanelNavItem = {
  id: PanelNavId;
  label: string;
  href: Route;
  badge?: number;
};

type PanelNavEntry = PanelNavItem & { permission: Permission };

export type PanelPage = {
  label: string;
  href: Route;
};

export const PANEL_HOME_HREF: Route = '/admin';

// PRÉVIA (não commitar): seções sem permissão própria na API, com páginas vazias. Usam a do Dashboard só para aparecer.
const PREVIEW_PERMISSION: Permission = 'dashboard:access';

// Um item novo entra junto com a página dele e com a permissão que a rota exige na API.
const PANEL_NAV: readonly PanelNavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', href: PANEL_HOME_HREF, permission: 'dashboard:access' },
  { id: 'orders', label: 'Pedidos', href: '/admin/pedidos', permission: PREVIEW_PERMISSION },
  { id: 'products', label: 'Produtos', href: '/admin/produtos', permission: PREVIEW_PERMISSION },
  { id: 'inventory', label: 'Estoque', href: '/admin/estoque', permission: PREVIEW_PERMISSION },
  { id: 'coupons', label: 'Cupons', href: '/admin/cupons', permission: PREVIEW_PERMISSION },
  {
    id: 'brands-categories',
    label: 'Marcas & Categorias',
    href: '/admin/marcas-e-categorias',
    permission: PREVIEW_PERMISSION,
  },
];

const PANEL_PAGES: readonly PanelPage[] = [
  { label: 'Novo produto', href: '/admin/produtos/novo' },
];

function toNavItem({ id, label, href }: PanelNavEntry): PanelNavItem {
  return { id, label, href };
}

// Esconder um item não protege nada: quem protege é a rota.
export function visibleNavItems(permissions: readonly string[]): PanelNavItem[] {
  return PANEL_NAV.filter(({ permission }) => permissions.includes(permission)).map(toNavItem);
}

// Sem filtrar por permissão: só dá nome à página atual, e quem decide se ela abre é a rota.
export function findSection(pathname: string): PanelNavItem | undefined {
  const href = findActiveHref(PANEL_NAV.map((item) => item.href), pathname);
  const section = PANEL_NAV.find((item) => item.href === href);

  return section && toNavItem(section);
}

export function findPage(pathname: string): PanelPage | undefined {
  return PANEL_PAGES.find(({ href }) => href === pathname);
}

// O href mais longo que é a página ou um ancestral dela: /admin/pedidos/42 acende Pedidos, e não o /admin.
export function findActiveHref(hrefs: readonly string[], pathname: string): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .reduce<string | undefined>((closest, href) => (href.length > (closest?.length ?? 0) ? href : closest), undefined);
}
