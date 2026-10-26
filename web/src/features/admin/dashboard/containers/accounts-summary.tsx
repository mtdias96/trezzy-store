import { StatCard } from '@/components/admin/stat-card';
import { getDashboardSummary } from '@/features/admin/dashboard/data/queries';

export async function AccountsSummary() {
  const { totalAccounts } = await getDashboardSummary();

  return <StatCard label="Contas cadastradas" value={totalAccounts.toLocaleString('pt-BR')} />;
}
