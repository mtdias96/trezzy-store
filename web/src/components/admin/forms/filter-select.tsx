'use client';

import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { matchesSearch } from '@/lib/text';

export type FilterSelectOption = {
  value: string;
  label: string;
  count: number;
};

type FilterTriggerProps = {
  label: string;
  value: string;
};

function FilterTrigger({ label, value }: FilterTriggerProps) {
  return (
    <PopoverTrigger
      aria-label={`${label}: ${value}`}
      className="
        flex h-ctl shrink-0 items-center gap-1.5 rounded-pill border border-gray-250 bg-card px-4 text-body
        transition-colors
        hover:bg-gray-25
        focus-visible:border-ring focus-visible:shadow-focus-brand focus-visible:outline-none
        data-popup-open:border-ring
      "
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
      <ChevronDownIcon aria-hidden className="size-4 text-ink-soft" />
    </PopoverTrigger>
  );
}

function OptionCount({ count }: { count: number }) {
  return <span className="ml-auto text-caption text-muted-foreground tabular-nums">{count}</span>;
}

type FilterMultiSelectProps = {
  label: string;
  allLabel: string;
  options: readonly FilterSelectOption[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  searchPlaceholder?: string;
};

export function FilterMultiSelect({
  label,
  allLabel,
  options,
  value,
  onValueChange,
  searchPlaceholder,
}: FilterMultiSelectProps) {
  const [query, setQuery] = useState('');
  const visible = options.filter((option) => matchesSearch(option.label, query));
  const [first] = value;
  let summary = allLabel;

  if (value.length === 1) {
    summary = options.find((option) => option.value === first)?.label ?? allLabel;
  } else if (value.length > 1) {
    summary = `${value.length} selecionadas`;
  }

  function toggle(optionValue: string, checked: boolean) {
    onValueChange(checked ? [...value, optionValue] : value.filter((item) => item !== optionValue));
  }

  return (
    <Popover onOpenChange={(open) => !open && setQuery('')}>
      <FilterTrigger label={label} value={summary} />
      {/* O popup renderiza no <body>, fora do container do painel, e voltaria às superfícies da loja. */}
      <PopoverContent data-area="admin" align="start" className="w-64">
        {searchPlaceholder
          ? (
              <Input
                variant="compact"
                type="search"
                autoFocus
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            )
          : null}
        <ul aria-label={label} className="flex max-h-64 flex-col overflow-y-auto">
          {visible.map((option) => (
            <li key={option.value}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-body hover:bg-gray-50">
                <Checkbox
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) => toggle(option.value, checked)}
                />
                {option.label}
                <OptionCount count={option.count} />
              </label>
            </li>
          ))}
        </ul>
        {visible.length === 0 ? <p className="px-2.5 py-2 text-body-sm text-muted-foreground">Nada encontrado.</p> : null}
      </PopoverContent>
    </Popover>
  );
}

type FilterSingleSelectProps<Value extends string> = {
  label: string;
  options: readonly (FilterSelectOption & { value: Value })[];
  value: Value;
  onValueChange: (value: Value) => void;
};

export function FilterSingleSelect<Value extends string>({
  label,
  options,
  value,
  onValueChange,
}: FilterSingleSelectProps<Value>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <FilterTrigger label={label} value={selected?.label ?? ''} />
      <PopoverContent data-area="admin" align="start" className="w-56">
        <RadioGroup
          aria-label={label}
          value={value}
          onValueChange={(next) => {
            const option = options.find((item) => item.value === next);

            if (option) {
              onValueChange(option.value);
              setOpen(false);
            }
          }}
          className="gap-0"
        >
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-body hover:bg-gray-50"
            >
              <RadioGroupItem variant="check" value={option.value} />
              {option.label}
              <OptionCount count={option.count} />
            </label>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
}
