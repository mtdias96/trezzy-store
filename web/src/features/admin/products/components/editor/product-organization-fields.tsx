import { FormCard } from '@/components/admin/forms/form-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SelectOption } from '@/features/admin/products/model/types';

type ProductOrganizationFieldsProps = {
  brands: readonly SelectOption[];
  categories: readonly SelectOption[];
  defaultBrandId?: string;
  defaultCategoryId?: string;
};

type OptionSelectProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  emptyPlaceholder: string;
  options: readonly SelectOption[];
  defaultValue?: string;
};

function OptionSelect({ id, name, label, placeholder, emptyPlaceholder, options, defaultValue }: OptionSelectProps) {
  const isEmpty = options.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select name={name} items={options} defaultValue={defaultValue} disabled={isEmpty}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={isEmpty ? emptyPlaceholder : placeholder} />
        </SelectTrigger>
        {/* O popup renderiza no <body>, fora do container do painel, e voltaria às superfícies da loja. */}
        <SelectContent data-area="admin" alignItemWithTrigger={false}>
          {options.map(({ value, label: optionLabel }) => (
            <SelectItem key={value} value={value}>{optionLabel}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProductOrganizationFields({
  brands,
  categories,
  defaultBrandId,
  defaultCategoryId,
}: ProductOrganizationFieldsProps) {
  return (
    <FormCard title="Organização">
      <OptionSelect
        id="product-brand"
        name="brandId"
        label="Marca"
        placeholder="Selecione a marca"
        emptyPlaceholder="Nenhuma marca cadastrada"
        options={brands}
        defaultValue={defaultBrandId}
      />
      <OptionSelect
        id="product-category"
        name="categoryId"
        label="Categoria"
        placeholder="Selecione a categoria"
        emptyPlaceholder="Nenhuma categoria cadastrada"
        options={categories}
        defaultValue={defaultCategoryId}
      />
    </FormCard>
  );
}
