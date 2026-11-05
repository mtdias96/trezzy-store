import 'server-only';

import { type PanelNavItem, visibleNavItems } from '@/features/admin/navigation/model/nav';
import { requireAdminSession } from '@/features/shared/auth/session/session';

import { fetchMyPermissions } from './api';

// PRÉVIA (não commitar): contador fixo. O de verdade vem da API de pedidos.
const PREVIEW_PENDING_ORDERS = 6;

export async function getPanelNav(): Promise<PanelNavItem[]> {
  await requireAdminSession();

  const { permissions } = await fetchMyPermissions();

  return visibleNavItems(permissions).map((item) =>
    item.id === 'orders' ? { ...item, badge: PREVIEW_PENDING_ORDERS } : item,
  );
}
