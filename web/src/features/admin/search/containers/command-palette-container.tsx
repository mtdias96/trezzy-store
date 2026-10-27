import { CommandPalette } from '@/features/admin/search/components/command-palette';
import { buildCommandGroups, QUICK_ACTIONS, type RecentOrder } from '@/features/admin/search/model/commands';

// PRÉVIA (não commitar): pedidos fixos. Os de verdade vêm da API de pedidos: aí o container busca, fica
// assíncrono e entra num Suspense.
const PREVIEW_RECENT_ORDERS: RecentOrder[] = [
  { code: 'TZ-10854', customer: 'Isabela Ramos', totalInCents: 196987, status: 'pending', href: '/admin/pedidos' },
  { code: 'TZ-10853', customer: 'Rafael Teixeira', totalInCents: 26999, status: 'pending', href: '/admin/pedidos' },
  { code: 'TZ-10852', customer: 'Beatriz Nogueira', totalInCents: 54999, status: 'paid', href: '/admin/pedidos' },
];

export function CommandPaletteContainer() {
  return <CommandPalette groups={buildCommandGroups(QUICK_ACTIONS, PREVIEW_RECENT_ORDERS)} />;
}
