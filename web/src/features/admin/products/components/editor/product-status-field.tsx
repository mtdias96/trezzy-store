'use client';

import { FormCard } from '@/components/admin/forms/form-card';
import { FormField } from '@/components/common/forms/form-field';
import { Switch } from '@/components/ui/switch';
import type { ProductFormInput } from '@/features/admin/products/model/schema';
import { useFormContext } from '@/lib/form';

type ProductStatusFieldProps = {
  hint?: string;
};

export function ProductStatusField({ hint }: ProductStatusFieldProps) {
  const { control } = useFormContext<ProductFormInput>();

  return (
    <FormCard title="Status">
      <FormField
        control={control}
        name="active"
        description={hint}
        render={({ field, controlProps }) => (
          <label
            className="
              flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-250 px-3.5 py-2.5
              has-focus-visible:border-ring
            "
          >
            <Switch {...controlProps} checked={field.value} onCheckedChange={field.onChange} inputRef={field.ref} />
            <span className="flex flex-col gap-0.5">
              <span className="text-body-lg font-semibold">Ativo</span>
              <span className="text-body-sm text-muted-foreground">Visível na loja e na busca</span>
            </span>
          </label>
        )}
      />
    </FormCard>
  );
}
