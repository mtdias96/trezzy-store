import { FormCard } from '@/components/admin/forms/form-card';
import type { VariantSummary } from '@/features/admin/products/model/variants';
import { formatPrice } from '@/lib/money';

type SummaryRow = {
  label: string;
  value: string;
  isAlert?: boolean;
};

function formatPriceRange({ minPriceInCents, maxPriceInCents }: VariantSummary): string {
  if (minPriceInCents === null || maxPriceInCents === null) {
    return '—';
  }

  return minPriceInCents === maxPriceInCents
    ? formatPrice(minPriceInCents)
    : `${formatPrice(minPriceInCents)} – ${formatPrice(maxPriceInCents)}`;
}

type ProductSummaryProps = {
  summary: VariantSummary;
  imageCount: number;
};

export function ProductSummary({ summary, imageCount }: ProductSummaryProps) {
  const rows: readonly SummaryRow[] = [
    { label: 'Variantes', value: `${summary.count} · ${summary.activeCount} ativas` },
    { label: 'Estoque total', value: `${summary.totalStock} un.` },
    { label: 'Sem estoque', value: String(summary.outOfStockCount), isAlert: summary.outOfStockCount > 0 },
    { label: 'Faixa de preço', value: formatPriceRange(summary) },
    { label: 'Imagens', value: String(imageCount), isAlert: imageCount === 0 },
  ];

  return (
    <FormCard title="Resumo">
      <dl className="flex flex-col gap-2.5">
        {rows.map(({ label, value, isAlert }) => (
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
