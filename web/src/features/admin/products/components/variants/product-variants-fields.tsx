'use client';

import { type KeyboardEvent, useState } from 'react';
import { PlusIcon, XIcon, ZapIcon } from 'lucide-react';

import { FormCard } from '@/components/admin/forms/form-card';
import { FormMessage } from '@/components/common/forms/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ProductFormInput } from '@/features/admin/products/model/schema';
import type { CategoryOption } from '@/features/admin/products/model/types';
import {
  COLOR_SUGGESTIONS,
  colorSuggestionOf,
  generateVariants,
  normalizeColor,
  SIZE_GRIDS,
  type SizeGridId,
  SIZES_BY_GRID,
} from '@/features/admin/products/model/variants';
import { useFieldArray, useFormContext, useWatch } from '@/lib/form';

import { ColorSwatch } from './color-swatch';
import { VariantsTable } from './variants-table';

type ProductVariantsFieldsProps = {
  categories: readonly CategoryOption[];
  defaultSizeGrid: SizeGridId;
};

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function ProductVariantsFields({ categories, defaultSizeGrid }: ProductVariantsFieldsProps) {
  const { control } = useFormContext<ProductFormInput>();
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const [categoryId, basePriceInCents, variants] = useWatch({ control, name: ['categoryId', 'basePriceInCents', 'variants'] });

  const [grid, setGrid] = useState(defaultSizeGrid);
  const [sizes, setSizes] = useState<readonly string[]>(SIZES_BY_GRID[defaultSizeGrid]);
  const [colors, setColors] = useState<readonly string[]>([]);
  const [colorText, setColorText] = useState('');
  const [suggestedFor, setSuggestedFor] = useState(categoryId);

  function chooseGrid(next: SizeGridId) {
    setGrid(next);
    setSizes(SIZES_BY_GRID[next]);
  }

  // A grade é da categoria: trocar a categoria sugere a grade dela, e o admin ainda pode escolher outra.
  if (categoryId !== suggestedFor) {
    setSuggestedFor(categoryId);
    const categoryGrid = categories.find(({ value }) => value === categoryId)?.grid;

    if (categoryGrid && categoryGrid !== grid) {
      chooseGrid(categoryGrid);
    }
  }

  function toggleSize(size: string) {
    setSizes((current) => (current.includes(size) ? current.filter((item) => item !== size) : [...current, size]));
  }

  function addColor(color: string) {
    const normalized = normalizeColor(color);

    if (normalized !== '' && !colors.includes(normalized)) {
      setColors([...colors, normalized]);
    }
  }

  function handleColorKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      // Dentro do formulário, o Enter enviaria o cadastro.
      event.preventDefault();
      addColor(colorText);
      setColorText('');
    }
  }

  const orderedSizes = SIZES_BY_GRID[grid].filter((size) => sizes.includes(size));
  const generated = generateVariants(orderedSizes, colors, basePriceInCents, variants);
  const colorCount = Math.max(colors.length, 1);
  const activeCount = variants.filter(({ active }) => active).length;

  return (
    <FormCard
      title="Variantes"
      count={fields.length}
      meta={fields.length > 0 ? `${activeCount} ativas` : 'Gere a grade abaixo'}
    >
      <div className="flex flex-col gap-2.5">
        <p id="size-grid-label" className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-body-sm font-semibold">Tipo de grade</span>
          <span className="text-caption text-muted-foreground">Escolha uma categoria para receber uma sugestão</span>
        </p>
        <RadioGroup
          aria-labelledby="size-grid-label"
          value={grid}
          onValueChange={(value) => chooseGrid(value as SizeGridId)}
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
        <p id="variant-sizes-label" className="text-body-sm font-semibold">Tamanhos</p>
        <ul aria-labelledby="variant-sizes-label" className="flex flex-wrap gap-1.5">
          {SIZES_BY_GRID[grid].map((size) => {
            const isSelected = sizes.includes(size);

            return (
              <li key={size}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleSize(size)}
                  className={
                    isSelected
                      ? 'h-ctl-sm min-w-10 rounded-pill border border-ink bg-ink px-3 font-mono text-body-sm text-gray-0'
                      : `
                        h-ctl-sm min-w-10 rounded-pill border border-gray-250 bg-card px-3 font-mono text-body-sm
                        text-muted-foreground transition-colors
                        hover:border-ink hover:text-ink
                      `
                  }
                >
                  {size}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="variant-color">Cores</Label>
        {colors.length > 0
          ? (
              <ul aria-label="Cores escolhidas" className="flex flex-wrap gap-1.5">
                {colors.map((color) => {
                  const suggestion = colorSuggestionOf(color);

                  return (
                    <li
                      key={color}
                      className="flex h-ctl-sm items-center gap-1.5 rounded-pill bg-gray-100 pr-1 pl-2.5 text-body-sm text-ink"
                    >
                      <ColorSwatch swatch={suggestion?.swatch} />
                      {suggestion?.label ?? color}
                      <button
                        type="button"
                        aria-label={`Remover a cor ${suggestion?.label ?? color}`}
                        onClick={() => setColors(colors.filter((item) => item !== color))}
                        className="flex size-6 items-center justify-center rounded-pill transition-colors hover:bg-gray-150"
                      >
                        <XIcon aria-hidden className="size-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          : null}
        <Input
          id="variant-color"
          type="text"
          variant="dashed"
          placeholder="Adicionar cor + Enter"
          maxLength={40}
          className="sm:w-48"
          value={colorText}
          onChange={(event) => setColorText(event.target.value)}
          onKeyDown={handleColorKey}
        />
        <ul aria-label="Sugestões de cor" className="flex flex-wrap gap-x-1 gap-y-1">
          {COLOR_SUGGESTIONS.filter(({ label }) => !colors.includes(normalizeColor(label))).map(({ label, swatch }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => addColor(label)}
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
        <p className="text-body text-ink-soft">
          {`${plural(orderedSizes.length, 'tamanho', 'tamanhos')} × ${plural(colorCount, 'cor', 'cores')} = `}
          {`${plural(orderedSizes.length * colorCount, 'variante', 'variantes')} · ${plural(generated.length, 'nova', 'novas')}`}
        </p>
        <Button
          type="button"
          variant="inverse"
          shape="pill"
          className="font-semibold"
          disabled={generated.length === 0}
          onClick={() => append(generated)}
        >
          <ZapIcon data-icon="inline-start" aria-hidden />
          Gerar variantes
        </Button>
      </div>
      <FormMessage control={control} name="variants" />
      {fields.length > 0
        ? <VariantsTable fields={fields} onRemove={remove} />
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
