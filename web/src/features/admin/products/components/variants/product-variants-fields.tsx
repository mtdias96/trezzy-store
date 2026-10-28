import { PlusIcon, ZapIcon } from 'lucide-react';

import { FormCard } from '@/components/admin/forms/form-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ProductVariant } from '@/features/admin/products/model/types';
import { COLOR_SUGGESTIONS, SIZE_GRIDS, type SizeGridId } from '@/features/admin/products/model/variants';

import { ColorSwatch } from './color-swatch';
import { VariantsTable } from './variants-table';

type ProductVariantsFieldsProps = {
  defaultSizeGrid: SizeGridId;
  variants: readonly ProductVariant[];
};

export function ProductVariantsFields({ defaultSizeGrid, variants }: ProductVariantsFieldsProps) {
  const activeCount = variants.filter(({ active }) => active).length;

  return (
    <FormCard
      title="Variantes"
      count={variants.length}
      meta={variants.length > 0 ? `${activeCount} ativas` : 'Gere a grade abaixo'}
    >
      <div className="flex flex-col gap-2.5">
        <p id="size-grid-label" className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-body-sm font-semibold">Tipo de grade</span>
          <span className="text-caption text-muted-foreground">Escolha uma categoria para receber uma sugestão</span>
        </p>
        <RadioGroup
          aria-labelledby="size-grid-label"
          name="sizeGrid"
          defaultValue={defaultSizeGrid}
          className="grid-cols-1 gap-2.5 sm:grid-cols-3"
        >
          {SIZE_GRIDS.map(({ id, label, examples, range }) => (
            <label
              key={id}
              className="
                flex cursor-pointer flex-col gap-1 rounded-2xl border border-gray-250 bg-card px-3.5 py-3
                transition-colors
                has-data-checked:border-ink has-data-checked:ring-1 has-data-checked:ring-ink
              "
            >
              <span className="flex items-center gap-2.5">
                <RadioGroupItem value={id} />
                <span className="text-body-lg font-semibold">{label}</span>
              </span>
              <span className="text-body-sm text-muted-foreground">{examples}</span>
              <span className="font-mono text-caption text-ink-soft">{range}</span>
            </label>
          ))}
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="variant-color">Cores</Label>
        <Input id="variant-color" type="text" variant="dashed" placeholder="Adicionar cor + Enter" className="sm:w-48" />
        <ul aria-label="Sugestões de cor" className="flex flex-wrap gap-x-1 gap-y-1">
          {COLOR_SUGGESTIONS.map(({ label, swatch }) => (
            <li key={label}>
              <button
                type="button"
                className="
                  flex h-ctl-sm items-center gap-1.5 rounded-pill px-2.5 text-body-sm text-muted-foreground
                  transition-colors
                  hover:bg-gray-100 hover:text-ink
                "
              >
                <ColorSwatch swatch={swatch} />
                <PlusIcon aria-hidden className="size-3" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl bg-gray-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body text-ink-soft">1 tamanho × 1 cor = 1 variantes · 1 nova</p>
        <Button variant="inverse" shape="pill" className="font-semibold">
          <ZapIcon data-icon="inline-start" aria-hidden />
          Gerar variantes
        </Button>
      </div>
      {variants.length > 0
        ? <VariantsTable variants={variants} />
        : (
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-gray-300 px-6 py-7 text-center">
              <p className="text-body-lg font-semibold">Nenhuma variante ainda</p>
              <p className="max-w-sm text-body text-muted-foreground">
                Escolha a grade, os tamanhos e as cores acima e toque em Gerar variantes. Dá para ajustar SKU, preço e estoque
                de cada uma depois.
              </p>
            </div>
          )}
    </FormCard>
  );
}
