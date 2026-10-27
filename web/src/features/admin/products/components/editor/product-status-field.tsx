import { FormCard } from '@/components/admin/forms/form-card';
import { Switch } from '@/components/ui/switch';

type ProductStatusFieldProps = {
  defaultActive: boolean;
  hint?: string;
};

export function ProductStatusField({ defaultActive, hint }: ProductStatusFieldProps) {
  return (
    <FormCard title="Status">
      <label
        className="
          flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-250 px-3.5 py-2.5
          has-focus-visible:border-ring
        "
      >
        <Switch name="active" defaultChecked={defaultActive} aria-describedby="product-status-hint" />
        <span className="flex flex-col gap-0.5">
          <span className="text-body-lg font-semibold">Ativo</span>
          <span id="product-status-hint" className="text-body-sm text-muted-foreground">Visível na loja e na busca</span>
        </span>
      </label>
      {hint ? <p className="text-body-sm text-muted-foreground">{hint}</p> : null}
    </FormCard>
  );
}
