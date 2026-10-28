import { FilterChecklist } from '@/components/store/forms/filter-checklist';
import { FilterChips } from '@/components/store/forms/filter-chips';
import { FilterRadios } from '@/components/store/forms/filter-radios';
import { FilterSection } from '@/components/store/forms/filter-section';
import { FilterSwitch } from '@/components/store/forms/filter-switch';
import { FilterLinks } from '@/components/store/navigation/filter-links';
import { CATALOG_LABELS, type CatalogFilters, PRICE_RANGES, toggleValue } from '@/features/store/catalog/model/listing';
import type { DepartmentFilterItem } from '@/features/store/catalog/model/scope';
import type { BrandFacet } from '@/features/store/catalog/model/types';

export type PanelFilters = Pick<CatalogFilters, 'tamanho' | 'marca' | 'preco' | 'promocao'>;

type CatalogFilterPanelProps = {
  // O painel aparece duas vezes (lateral e gaveta): cada uma com os próprios ids.
  idPrefix: string;
  departments: readonly DepartmentFilterItem[];
  sizes: readonly string[];
  brands: readonly BrandFacet[];
  filters: PanelFilters;
  // Só o que mudou.
  onChange: (changes: Partial<PanelFilters>) => void;
};

const PRICE_OPTIONS = PRICE_RANGES.map(({ value, label }) => ({ value, label }));

export function CatalogFilterPanel({ idPrefix, departments, sizes, brands, filters, onChange }: CatalogFilterPanelProps) {
  const ids = {
    departments: `${idPrefix}-departments`,
    sizes: `${idPrefix}-sizes`,
    brands: `${idPrefix}-brands`,
    price: `${idPrefix}-price`,
  };

  return (
    <div className="flex flex-col gap-5">
      <FilterSection titleId={ids.departments} title={CATALOG_LABELS.departments}>
        <FilterLinks labelledBy={ids.departments} items={departments} />
      </FilterSection>
      {sizes.length > 0
        ? (
            <FilterSection
              titleId={ids.sizes}
              title={CATALOG_LABELS.sizes}
              onClear={filters.tamanho.length > 0 ? () => onChange({ tamanho: [] }) : undefined}
            >
              <FilterChips
                labelledBy={ids.sizes}
                options={sizes}
                selected={filters.tamanho}
                onToggle={(size) => onChange({ tamanho: toggleValue(filters.tamanho, size) })}
              />
            </FilterSection>
          )
        : null}
      {brands.length > 0
        ? (
            <FilterSection
              titleId={ids.brands}
              title={CATALOG_LABELS.brands}
              onClear={filters.marca.length > 0 ? () => onChange({ marca: [] }) : undefined}
            >
              <FilterChecklist
                labelledBy={ids.brands}
                options={brands.map(({ slug, name, count }) => ({ value: slug, label: name, count }))}
                selected={filters.marca}
                onToggle={(brand) => onChange({ marca: toggleValue(filters.marca, brand) })}
              />
            </FilterSection>
          )
        : null}
      <FilterSection
        titleId={ids.price}
        title={CATALOG_LABELS.price}
        onClear={filters.preco === null ? undefined : () => onChange({ preco: null })}
      >
        <FilterRadios
          labelledBy={ids.price}
          options={PRICE_OPTIONS}
          value={filters.preco}
          onValueChange={(preco) => onChange({ preco })}
        />
      </FilterSection>
      <FilterSwitch
        label={CATALOG_LABELS.onSale}
        checked={filters.promocao}
        onCheckedChange={(promocao) => onChange({ promocao })}
      />
    </div>
  );
}
