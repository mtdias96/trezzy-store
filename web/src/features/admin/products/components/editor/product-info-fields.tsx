'use client';

import { BoldIcon, LinkIcon, ListIcon, type LucideIcon } from 'lucide-react';

import { FormCard } from '@/components/admin/forms/form-card';
import { FormField } from '@/components/common/forms/form-field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group';
import type { ProductFormInput } from '@/features/admin/products/model/schema';
import { useFormContext } from '@/lib/form';

type FormatTool = {
  label: string;
  icon: LucideIcon;
};

const FORMAT_TOOLS: readonly FormatTool[] = [
  { label: 'Negrito', icon: BoldIcon },
  { label: 'Lista', icon: ListIcon },
  { label: 'Link', icon: LinkIcon },
];

export function ProductInfoFields() {
  const { control } = useFormContext<ProductFormInput>();

  return (
    <FormCard title="Informações">
      <FormField
        control={control}
        name="title"
        label="Título"
        render={({ field, controlProps }) => (
          <Input {...field} {...controlProps} variant="outline" placeholder="Ex.: Dunk Low Pro “Black/White”" />
        )}
      />
      <FormField
        control={control}
        name="description"
        label="Descrição"
        render={({ field, controlProps }) => (
          <InputGroup className="overflow-hidden">
            <InputGroupAddon
              align="block-start"
              role="toolbar"
              aria-label="Formatação"
              className="gap-1 border-b border-gray-150 bg-gray-25 p-1.5"
            >
              {FORMAT_TOOLS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-lg text-ink transition-colors hover:bg-gray-150"
                >
                  <Icon aria-hidden className="size-4" />
                </button>
              ))}
            </InputGroupAddon>
            <InputGroupTextarea
              {...field}
              {...controlProps}
              placeholder="Materiais, caimento, detalhes da collab..."
              className="min-h-35"
            />
          </InputGroup>
        )}
      />
    </FormCard>
  );
}
