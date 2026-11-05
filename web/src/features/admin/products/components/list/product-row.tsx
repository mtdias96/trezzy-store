import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PRODUCT_STATUS_LABELS } from '@/features/admin/products/model/status';
import type { ProductListItem, StockLevel } from '@/features/admin/products/model/types';
import { formatRelativeDate } from '@/lib/date';
import { formatPrice } from '@/lib/money';

import { ProductRowActions } from './product-row-actions';

const stockBadge = {
  'in-stock': null,
  low: { label: 'Baixo', className: 'rounded-md bg-warning-50 px-2 py-0.5 text-caption font-medium text-warning-700' },
  out: { label: 'Esgotado', className: 'rounded-md bg-danger-50 px-2 py-0.5 text-caption font-medium text-danger-700' },
} satisfies Record<StockLevel, { label: string; className: string } | null>;

function formatPriceRange(min: number | null, max: number | null): string {
  if (min === null || max === null) {
    return '—';
  }

  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}

type ProductRowProps = {
  product: ProductListItem;
  now: Date;
};

export function ProductRow({ product, now }: ProductRowProps) {
  const href = `/admin/produtos/${product.id}` as Route;
  const badge = stockBadge[product.stockLevel];

  return (
    <tr className="relative border-t border-border transition-colors hover:bg-gray-25">
      <td className="w-12 py-3 pr-2 pl-4">
        <Checkbox aria-label={`Selecionar ${product.title}`} className="relative z-10" />
      </td>
      <td className="py-3 pr-4">
        <div className="flex min-w-64 items-center gap-3">
          {product.coverUrl
            ? <Image src={product.coverUrl} alt="" width={44} height={44} className="size-11 shrink-0 rounded-lg object-cover" />
            : <span aria-hidden className="size-11 shrink-0 rounded-lg border border-dashed border-gray-300 bg-gray-50" />}
          <div className="min-w-0">
            {/* Link esticado sobre a linha: clicar em qualquer ponto abre o produto. */}
            <Link
              href={href}
              className="line-clamp-1 font-semibold text-ink after:absolute after:inset-0 focus-visible:underline"
            >
              {product.title}
            </Link>
            <p className="text-body-sm text-muted-foreground">{product.brand}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 text-body text-ink-soft">{product.category}</td>
      <td className="py-3 pr-4 text-right font-mono text-body-sm whitespace-nowrap">
        {formatPriceRange(product.minPriceInCents, product.maxPriceInCents)}
      </td>
      <td className="py-3 pr-4 text-right font-mono text-body-sm">{product.variantsCount}</td>
      <td className="py-3 pr-4 text-right">
        <span className="inline-flex items-center gap-2">
          {badge
            ? <span className={badge.className}>{badge.label}</span>
            : null}
          <span className="font-mono text-body-sm">{product.totalStock}</span>
        </span>
      </td>
      <td className="py-3 pr-4">
        <span className="relative z-10 inline-flex items-center gap-2.5">
          <Switch readOnly checked={product.status === 'active'} aria-label={`Status de ${product.title}`} />
          <span className="text-body">{PRODUCT_STATUS_LABELS[product.status]}</span>
        </span>
      </td>
      <td className="py-3 pr-4 font-mono text-body-sm whitespace-nowrap text-muted-foreground">
        {formatRelativeDate(new Date(product.updatedAt), now)}
      </td>
      <td className="relative z-10 w-14 py-3 pr-4 text-right">
        <ProductRowActions href={href} title={product.title} />
      </td>
    </tr>
  );
}
