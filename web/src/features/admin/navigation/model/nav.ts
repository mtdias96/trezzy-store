import type { Route } from 'next';

// Espelha as permissões do catálogo da API (application/authorization/Permission.ts) que abrem um item do menu.
type Permission = 'dashboard:access';

export type PanelNavId = 'dashboard';

export type PanelNavItem = {
  id: PanelNavId;
  label: string;
  href: Route;
  badge?: number;
};

type PanelNavEntry = PanelNavItem & { permission: Permission };

const PANEL_HOME_HREF: Route = '/admin';

// Um item novo entra junto com a página dele e com a permissão que a rota exige na API.
const PANEL_NAV: readonly PanelNavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', href: PANEL_HOME_HREF, permission: 'dashboard:access' },
];

function toNavItem({ id, label, href }: PanelNavEntry): PanelNavItem {
  return { id, label, href };
}

// Esconder um item não protege nada: quem protege é a rota.
export function visibleNavItems(permissions: readonly string[]): PanelNavItem[] {
  return PANEL_NAV.filter(({ permission }) => permissions.includes(permission)).map(toNavItem);
}

// O href mais longo que é a página ou um ancestral dela: /admin/pedidos/42 acende Pedidos, e não o /admin.
export function findActiveHref(hrefs: readonly string[], pathname: string): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .reduce<string | undefined>((closest, href) => (href.length > (closest?.length ?? 0) ? href : closest), undefined);
}
