import type { Route } from 'next';

import { formatPrice } from '@/lib/money';
import { matchesSearch } from '@/lib/text';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type CommandItem = {
  id: string;
  kind: 'create' | 'go' | 'order';
  label: string;
  description: string;
  href: Route;
  status?: OrderStatus;
};

// O `value` é o título do grupo: é o formato de grupos do Combobox do Base UI.
export type CommandGroup = {
  value: string;
  items: readonly CommandItem[];
};

export type RecentOrder = {
  code: string;
  customer: string;
  totalInCents: number;
  status: OrderStatus;
  href: Route;
};

// Cada ação entra junto com a página dela e, com cargos, com a permissão que a rota exige.
// PRÉVIA (não commitar): levam às páginas vazias das seções, e não aos formulários e filtros de verdade.
export const QUICK_ACTIONS: readonly CommandItem[] = [
  {
    id: 'new-product',
    kind: 'create',
    label: 'Novo produto',
    description: 'Cadastrar produto, variantes e estoque',
    href: '/admin/produtos',
  },
  { id: 'new-coupon', kind: 'create', label: 'Novo cupom', description: 'Criar código de desconto', href: '/admin/cupons' },
  {
    id: 'pending-orders',
    kind: 'go',
    label: 'Ver pedidos pendentes',
    description: 'Aguardando PIX ou boleto',
    href: '/admin/pedidos',
  },
];

export function buildCommandGroups(
  quickActions: readonly CommandItem[],
  recentOrders: readonly RecentOrder[],
): CommandGroup[] {
  const orders = recentOrders.map(({ code, customer, totalInCents, status, href }): CommandItem => ({
    id: `order-${code}`,
    kind: 'order',
    label: `#${code}`,
    description: `${customer} · ${formatPrice(totalInCents)}`,
    href,
    status,
  }));

  return [
    { value: 'Ações rápidas', items: quickActions },
    { value: 'Pedidos recentes', items: orders },
  ].filter(({ items }) => items.length > 0);
}

export function matchesCommand(item: CommandItem, query: string): boolean {
  return matchesSearch(`${item.label} ${item.description}`, query);
}
