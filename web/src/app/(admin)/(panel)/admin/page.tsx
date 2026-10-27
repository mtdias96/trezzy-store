import { Suspense } from 'react';
import type { Metadata } from 'next';

import { StatCardSkeleton } from '@/components/admin/data-display/stat-card';
import { DashboardView } from '@/features/admin/dashboard/components/dashboard-view';
import { AccountsSummary } from '@/features/admin/dashboard/containers/accounts-summary';

export const metadata: Metadata = {
  title: 'Visão geral',
};

export default function Page() {
  return (
    <DashboardView>
      <Suspense fallback={<StatCardSkeleton />}>
        <AccountsSummary />
      </Suspense>
    </DashboardView>
  );
}
