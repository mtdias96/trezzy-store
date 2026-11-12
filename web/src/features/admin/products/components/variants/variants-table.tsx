'use client';

import { Trash2Icon } from 'lucide-react';

import { MoneyInput } from '@/components/admin/forms/money-input';
import { FormField, FormMessage } from '@/components/common/forms/form-field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ProductFormInput } from '@/features/admin/products/model/schema';
import { colorSuggestionOf, type VariantDraft } from '@/features/admin/products/model/variants';
import { useFormContext } from '@/lib/form';

import { ColorSwatch } from './color-swatch';

type VariantField = Pick<VariantDraft, 'size' | 'color'> & { id: string };

type VariantsTableProps = {
  fields: readonly VariantField[];
  onRemove: (index: number) => void;
};

export function VariantsTable({ fields, onRemove }: VariantsTableProps) {
  const { control } = useFormContext<ProductFormInput>();

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-2xl border-collapse text-left">
        <thead className="bg-gray-25 text-micro font-semibold text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="py-3 pr-3 pl-4">Variante</th>
            <th scope="col" className="py-3 pr-3">SKU</th>
            <th scope="col" className="py-3 pr-3">Preço</th>
            <th scope="col" className="py-3 pr-3">Estoque</th>
            <th scope="col" className="py-3 pr-3">Ativa</th>
            <th scope="col" className="py-3 pr-4"><span className="sr-only">Remover</span></th>
          </tr>
        </thead>
        <tbody>
          {fields.map(({ id, size, color }, index) => {
            const suggestion = colorSuggestionOf(color);
            const colorLabel = suggestion?.label ?? color;
            const label = colorLabel === '' ? size : `${size} · ${colorLabel}`;

            return (
              <tr key={id} className="border-t border-border align-top">
                <td className="py-2 pr-3 pl-4">
                  <span className="flex h-ctl-sm items-center gap-2 text-body">
                    <ColorSwatch swatch={suggestion?.swatch} />
                    <span className="font-semibold">{size}</span>
                    <span className="text-muted-foreground">{colorLabel}</span>
                  </span>
                  <FormMessage control={control} name={`variants.${index}.size`} />
                </td>
                <td className="py-2 pr-3">
                  <FormField
                    control={control}
                    name={`variants.${index}.sku`}
                    render={({ field, controlProps }) => (
                      <Input
                        {...field}
                        {...controlProps}
                        variant="compact"
                        placeholder="Gerado ao salvar"
                        aria-label={`SKU de ${label}`}
                        className="w-48 font-mono uppercase"
                      />
                    )}
                  />
                </td>
                <td className="py-2 pr-3">
                  <FormField
                    control={control}
                    name={`variants.${index}.priceInCents`}
                    render={({ field, controlProps }) => (
                      <MoneyInput
                        {...controlProps}
                        compact
                        ref={field.ref}
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        aria-label={`Preço de ${label}`}
                        className="w-32"
                      />
                    )}
                  />
                </td>
                <td className="py-2 pr-3">
                  <FormField
                    control={control}
                    name={`variants.${index}.stock`}
                    render={({ field, controlProps }) => (
                      <Input
                        {...controlProps}
                        ref={field.ref}
                        name={field.name}
                        onBlur={field.onBlur}
                        // Campo apagado fica vazio na tela e NaN no formulário: o schema pede o número no envio.
                        value={Number.isFinite(field.value) ? field.value : ''}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        variant="compact"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        aria-label={`Estoque de ${label}`}
                        className="w-20 font-mono"
                      />
                    )}
                  />
                </td>
                <td className="py-2 pr-3">
                  <FormField
                    control={control}
                    name={`variants.${index}.active`}
                    className="h-ctl-sm justify-center"
                    render={({ field, controlProps }) => (
                      <Switch
                        {...controlProps}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        inputRef={field.ref}
                        aria-label={`${label} ativa`}
                      />
                    )}
                  />
                </td>
                <td className="py-2 pr-4">
                  <button
                    type="button"
                    aria-label={`Remover ${label}`}
                    onClick={() => onRemove(index)}
                    className="
                      flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors
                      hover:bg-gray-150 hover:text-danger-600
                    "
                  >
                    <Trash2Icon aria-hidden className="size-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
