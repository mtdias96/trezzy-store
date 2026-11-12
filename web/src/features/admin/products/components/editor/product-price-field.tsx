'use client';

import { FormCard } from '@/components/admin/forms/form-card';
import { MoneyInput } from '@/components/admin/forms/money-input';
import { FormField } from '@/components/common/forms/form-field';
import type { ProductFormInput } from '@/features/admin/products/model/schema';
import { useFormContext } from '@/lib/form';

export function ProductPriceField() {
  const { control } = useFormContext<ProductFormInput>();

  return (
    <FormCard title="Preço base">
      <FormField
        control={control}
        name="basePriceInCents"
        label="Preço base"
        hideLabel
        description="Usado como padrão nas variantes novas."
        render={({ field, controlProps }) => (
          <MoneyInput {...controlProps} ref={field.ref} value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} />
        )}
      />
    </FormCard>
  );
}
