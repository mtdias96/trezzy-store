'use client';

import { Checkbox } from '@/components/ui/checkbox';

export type FilterChecklistOption = {
  value: string;
  label: string;
  count: number;
};

type FilterChecklistProps = {
  labelledBy: string;
  options: readonly FilterChecklistOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
};

const rowClass = {
  enabled: 'flex cursor-pointer items-center gap-3 py-2 text-body-lg text-ink',
  disabled: 'flex cursor-not-allowed items-center gap-3 py-2 text-body-lg text-gray-500',
} satisfies Record<'enabled' | 'disabled', string>;

// Opção sem produto no recorte fica desabilitada, porque marcá-la só levaria a uma lista vazia. A que já está
// marcada continua ativa, para dar para desmarcar.
export function FilterChecklist({ labelledBy, options, selected, onToggle }: FilterChecklistProps) {
  return (
    <div role="group" aria-labelledby={labelledBy}>
      <ul className="flex flex-col">
        {options.map(({ value, label, count }) => {
          const checked = selected.includes(value);
          const disabled = count === 0 && !checked;

          return (
            <li key={value}>
              <label className={disabled ? rowClass.disabled : rowClass.enabled}>
                <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => onToggle(value)} />
                {label}
                <span className="ml-auto text-caption text-gray-700 tabular-nums">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
