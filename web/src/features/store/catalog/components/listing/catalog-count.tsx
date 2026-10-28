import { productCountLabel } from '@/features/store/catalog/model/departments';

type CatalogCountProps = {
  total: number;
};

// role="status": quem usa leitor de tela ouve o novo total depois de cada filtro.
export function CatalogCount({ total }: CatalogCountProps) {
  return (
    <p role="status" className="text-body font-semibold text-gray-700 tabular-nums">
      {productCountLabel(total)}
    </p>
  );
}
