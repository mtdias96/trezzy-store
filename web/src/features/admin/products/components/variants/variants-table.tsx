import { MoneyInput } from '@/components/admin/forms/money-input';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ProductVariant } from '@/features/admin/products/model/types';
import { colorSuggestionOf } from '@/features/admin/products/model/variants';

import { ColorSwatch } from './color-swatch';

type VariantsTableProps = {
  variants: readonly ProductVariant[];
};

export function VariantsTable({ variants }: VariantsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-2xl border-collapse text-left">
        <thead className="bg-gray-25 text-micro font-semibold text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="py-3 pr-3 pl-4">Variante</th>
            <th scope="col" className="py-3 pr-3">SKU</th>
            <th scope="col" className="py-3 pr-3">Preço</th>
            <th scope="col" className="py-3 pr-3">Estoque</th>
            <th scope="col" className="py-3 pr-4">Ativa</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => {
            const suggestion = colorSuggestionOf(variant.color);
            const name = `${variant.size} · ${suggestion?.label ?? variant.color}`;

            return (
              <tr key={variant.id} className="border-t border-border">
                <td className="py-2 pr-3 pl-4">
                  <span className="flex items-center gap-2 text-body">
                    <ColorSwatch swatch={suggestion?.swatch} />
                    <span className="font-semibold">{variant.size}</span>
                    <span className="text-muted-foreground">{suggestion?.label ?? variant.color}</span>
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <Input variant="compact" defaultValue={variant.sku} aria-label={`SKU de ${name}`} className="w-48 font-mono uppercase" />
                </td>
                <td className="py-2 pr-3">
                  <MoneyInput compact defaultValue={variant.priceInCents} aria-label={`Preço de ${name}`} className="w-32" />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    variant="compact"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    defaultValue={variant.stock}
                    aria-label={`Estoque de ${name}`}
                    className="w-20 font-mono"
                  />
                </td>
                <td className="py-2 pr-4">
                  <Switch defaultChecked={variant.active} aria-label={`${name} ativa`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
