import 'server-only';

import { type PanelNavItem, visibleNavItems } from '@/features/admin/navigation/model/nav';
import { requireAdminSession } from '@/features/shared/auth/session/session';

import { fetchMyPermissions } from './api';

export async function getPanelNav(): Promise<PanelNavItem[]> {
  await requireAdminSession();

  const { permissions } = await fetchMyPermissions();

  return visibleNavItems(permissions);
}
