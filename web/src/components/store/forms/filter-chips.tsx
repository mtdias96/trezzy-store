'use client';

type FilterChipsProps = {
  labelledBy: string;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
};

// Botões de alternar (aria-pressed): cada chip liga e desliga sozinho, vários ao mesmo tempo.
export function FilterChips({ labelledBy, options, selected, onToggle }: FilterChipsProps) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={selected.includes(option)}
          onClick={() => onToggle(option)}
          className="flex h-ctl-lg items-center justify-center rounded-xl border border-paper-line bg-gray-0 px-2 text-body font-bold text-ink transition-colors duration-base hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-gray-0"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
