import 'server-only';

import * as z from 'zod';

import { authorizedHttp } from '@/features/shared/auth/session/authorized-http';

const dashboardSchema = z.object({
  accounts: z.object({ total: z.number().int().nonnegative() }),
});

export function fetchDashboard() {
  return authorizedHttp('/admin/dashboard', { schema: dashboardSchema });
}
