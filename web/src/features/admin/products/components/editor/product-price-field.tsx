import { FormCard } from '@/components/admin/forms/form-card';
import { MoneyInput } from '@/components/admin/forms/money-input';
import { Label } from '@/components/ui/label';

type ProductPriceFieldProps = {
  defaultValue?: number;
};

export function ProductPriceField({ defaultValue }: ProductPriceFieldProps) {
  return (
    <FormCard title="Preço base">
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-base-price" className="sr-only">Preço base</Label>
        <MoneyInput
          id="product-base-price"
          name="basePriceInCents"
          defaultValue={defaultValue}
          aria-describedby="product-base-price-hint"
        />
        <p id="product-base-price-hint" className="text-body-sm text-muted-foreground">
          Usado como padrão nas variantes novas.
        </p>
      </div>
    </FormCard>
  );
}
