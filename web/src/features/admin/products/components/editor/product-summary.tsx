import { FormCard } from '@/components/admin/forms/form-card';

type SummaryRow = {
  label: string;
  value: string;
  isAlert?: boolean;
};

const SUMMARY: readonly SummaryRow[] = [
  { label: 'Variantes', value: '0 · 0 ativas' },
  { label: 'Estoque total', value: '0 un.' },
  { label: 'Sem estoque', value: '0' },
  { label: 'Faixa de preço', value: '—' },
  { label: 'Imagens', value: '0', isAlert: true },
];

export function ProductSummary() {
  return (
    <FormCard title="Resumo">
      <dl className="flex flex-col gap-2.5">
        {SUMMARY.map(({ label, value, isAlert }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="text-body-sm text-ink-soft">{label}</dt>
            <dd className={isAlert ? 'font-mono text-body-sm text-danger-600' : 'font-mono text-body-sm text-ink'}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </FormCard>
  );
}
