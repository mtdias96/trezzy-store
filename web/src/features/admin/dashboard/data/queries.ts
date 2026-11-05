import 'server-only';

import { requireAdminSession } from '@/features/shared/auth/session/session';

import { fetchDashboard } from './api';

export async function getDashboardSummary(): Promise<{ totalAccounts: number }> {
  await requireAdminSession();

  const { accounts } = await fetchDashboard();

  return { totalAccounts: accounts.total };
}
