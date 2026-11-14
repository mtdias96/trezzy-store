'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { FormCard } from '@/components/admin/forms/form-card';
import { FormField } from '@/components/common/forms/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colorwayOptions } from '@/features/admin/products/model/colorway';
import type { ProductFormInput } from '@/features/admin/products/model/schema';
import type { ColorwayCandidate, ProductColorway } from '@/features/admin/products/model/types';
import { useFormContext, useWatch } from '@/lib/form';

const NO_MODEL = '';

// Só na edição: a ligação salva por conta própria, sem a edição do produto.
export type ColorwayEditing = {
  productId: string;
  colorways: readonly ProductColorway[];
  isSaving: boolean;
  error?: string;
  onSave: () => void;
};

type ProductColorwayFieldsProps = {
  candidates: readonly ColorwayCandidate[];
  editing?: ColorwayEditing;
};

export function ProductColorwayFields({ candidates, editing }: ProductColorwayFieldsProps) {
  const { control } = useFormContext<ProductFormInput>();
  const [brandId, categoryId] = useWatch({ control, name: ['brandId', 'categoryId'] });
  const ready = brandId !== '' && categoryId !== '';
  const options = ready ? colorwayOptions(candidates, { brandId, categoryId, productId: editing?.productId ?? null }) : [];
  const items = [{ value: NO_MODEL, label: 'Nenhum: cor única', disabled: false }, ...options];

  return (
    <FormCard title="Cores do modelo">
      <FormField
        control={control}
        name="colorName"
        label="Nome desta cor"
        description="Aparece no seletor de cores da loja, como “Reflective Black”."
        render={({ field, controlProps }) => <Input {...field} {...controlProps} maxLength={60} />}
      />
      <FormField
        control={control}
        name="familyOf"
        label="Mesmo modelo de"
        description={ready ? 'Produtos da mesma marca e categoria.' : 'Escolha a marca e a categoria antes.'}
        render={({ field, controlProps }) => (
          <Select items={items} value={field.value} onValueChange={(value) => field.onChange(value ?? NO_MODEL)} disabled={!ready}>
            <SelectTrigger {...controlProps} ref={field.ref} onBlur={field.onBlur}>
              <SelectValue />
            </SelectTrigger>
            {/* O popup renderiza no <body>, fora do container do painel, e voltaria às superfícies da loja. */}
            <SelectContent data-area="admin" alignItemWithTrigger={false}>
              {items.map(({ value, label, disabled }) => (
                <SelectItem key={value} value={value} disabled={disabled}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {editing ? <ColorwayEditingActions editing={editing} /> : null}
    </FormCard>
  );
}

function ColorwayEditingActions({ editing }: { editing: ColorwayEditing }) {
  const { productId, colorways, isSaving, error, onSave } = editing;

  return (
    <div className="flex flex-col gap-3">
      {colorways.length > 0
        ? (
            <ul aria-label="Outras cores deste modelo" className="flex flex-col gap-2">
              {colorways.map(({ id, title, colorName, coverUrl }) => (
                <li key={id}>
                  <Link href={`/admin/produtos/${id}` as Route} className="flex items-center gap-3 rounded-card text-body text-foreground hover:bg-muted">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-card bg-muted">
                      {coverUrl ? <Image src={coverUrl} alt="" fill sizes="40px" className="object-cover" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{colorName ?? 'Sem nome de cor'}</span>
                      <span className="block truncate text-caption text-muted-foreground">{title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        : null}
      {error ? <p role="alert" className="text-body-sm text-danger-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Salvando…' : 'Salvar cores'}
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href={`/admin/produtos/novo?modelo=${productId}` as Route} />}>
          Cadastrar outra cor
        </Button>
      </div>
    </div>
  );
}
