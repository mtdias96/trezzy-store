import { BoldIcon, LinkIcon, ListIcon, type LucideIcon } from 'lucide-react';

import { FormCard } from '@/components/admin/forms/form-card';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';

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
  return (
    <FormCard title="Informações">
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-title">Título</Label>
        <Input id="product-title" name="title" variant="outline" placeholder="Ex.: Dunk Low Pro “Black/White”" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-description">Descrição</Label>
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
            id="product-description"
            name="description"
            placeholder="Materiais, caimento, detalhes da collab..."
            className="min-h-35"
          />
        </InputGroup>
      </div>
    </FormCard>
  );
}
