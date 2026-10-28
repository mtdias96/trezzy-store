'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATALOG_LABELS, CATALOG_SORTS, type CatalogSort, SORT_LABELS } from '@/features/store/catalog/model/listing';

type SortSelectProps = {
  value: CatalogSort;
  onValueChange: (value: CatalogSort) => void;
};

const ITEMS = CATALOG_SORTS.map((value) => ({ value, label: SORT_LABELS[value] }));

export function SortSelect({ value, onValueChange }: SortSelectProps) {
  return (
    <Select items={ITEMS} value={value} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger className="w-auto gap-2.5">
        <span className="text-caption text-gray-700">{CATALOG_LABELS.sort}</span>
        <SelectValue className="font-bold" />
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false}>
        {ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
