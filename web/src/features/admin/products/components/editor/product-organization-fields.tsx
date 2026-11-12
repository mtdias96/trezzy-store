'use client';

import { FormCard } from '@/components/admin/forms/form-card';
import { FormField } from '@/components/common/forms/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductFormInput } from '@/features/admin/products/model/schema';
import type { SelectOption } from '@/features/admin/products/model/types';
import { useFormContext } from '@/lib/form';

type ProductOrganizationFieldsProps = {
  brands: readonly SelectOption[];
  categories: readonly SelectOption[];
};

type OptionSelectProps = {
  name: 'brandId' | 'categoryId';
  label: string;
  placeholder: string;
  emptyPlaceholder: string;
  options: readonly SelectOption[];
};

function OptionSelect({ name, label, placeholder, emptyPlaceholder, options }: OptionSelectProps) {
  const { control } = useFormContext<ProductFormInput>();
  const isEmpty = options.length === 0;

  return (
    <FormField
      control={control}
      name={name}
      label={label}
      render={({ field, controlProps }) => (
        <Select
          items={options}
          value={field.value === '' ? null : field.value}
          onValueChange={(value) => field.onChange(value ?? '')}
          disabled={isEmpty}
        >
          <SelectTrigger {...controlProps} ref={field.ref} onBlur={field.onBlur}>
            <SelectValue placeholder={isEmpty ? emptyPlaceholder : placeholder} />
          </SelectTrigger>
          {/* O popup renderiza no <body>, fora do container do painel, e voltaria às superfícies da loja. */}
          <SelectContent data-area="admin" alignItemWithTrigger={false}>
            {options.map(({ value, label: optionLabel }) => (
              <SelectItem key={value} value={value}>{optionLabel}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

export function ProductOrganizationFields({ brands, categories }: ProductOrganizationFieldsProps) {
  return (
    <FormCard title="Organização">
      <OptionSelect
        name="brandId"
        label="Marca"
        placeholder="Selecione a marca"
        emptyPlaceholder="Nenhuma marca cadastrada"
        options={brands}
      />
      <OptionSelect
        name="categoryId"
        label="Categoria"
        placeholder="Selecione a categoria"
        emptyPlaceholder="Nenhuma categoria cadastrada"
        options={categories}
      />
    </FormCard>
  );
}
