'use client';

import { Switch } from '@/components/ui/switch';

type FilterSwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// Filtro de liga e desliga, sem título de seção: o rótulo é o próprio texto da linha.
export function FilterSwitch({ label, checked, onCheckedChange }: FilterSwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-paper-line pt-5 text-body-lg font-bold text-ink first:border-t-0 first:pt-0">
      {label}
      <Switch checked={checked} onCheckedChange={(next) => onCheckedChange(next)} />
    </label>
  );
}
