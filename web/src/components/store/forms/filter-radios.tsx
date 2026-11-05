'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type FilterRadioOption = {
  value: string;
  label: string;
};

type FilterRadiosProps = {
  labelledBy: string;
  options: readonly FilterRadioOption[];
  // null: nenhum marcado.
  value: string | null;
  onValueChange: (value: string) => void;
};

// Uma opção por vez. O value vazio mantém o grupo controlado sem nenhuma marcada.
export function FilterRadios({ labelledBy, options, value, onValueChange }: FilterRadiosProps) {
  return (
    <RadioGroup
      aria-labelledby={labelledBy}
      value={value ?? ''}
      onValueChange={(next) => typeof next === 'string' && onValueChange(next)}
      className="gap-0"
    >
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-3 py-2 text-body-lg text-ink">
          <RadioGroupItem value={option.value} className="size-5" />
          {option.label}
        </label>
      ))}
    </RadioGroup>
  );
}
