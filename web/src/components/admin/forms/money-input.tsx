'use client';

import { type ComponentProps, useState } from 'react';
import { cn } from 'cn';

import { Input } from '@/components/ui/input';
import { formatAmount, parsePriceInput } from '@/lib/money';

type MoneyInputProps = Omit<
  ComponentProps<typeof Input>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'inputMode' | 'placeholder' | 'autoComplete' | 'variant'
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (cents: number) => void;
  compact?: boolean;
};

// Centavos, com 0 como campo vazio. Sem preço, o input oculto envia vazio, e não 0, para o "obrigatório" valer.
export function MoneyInput({
  value,
  defaultValue = 0,
  onValueChange,
  compact = false,
  name,
  className,
  ...props
}: MoneyInputProps) {
  const [uncontrolledCents, setUncontrolledCents] = useState(defaultValue);
  const cents = value ?? uncontrolledCents;

  function handleChange(text: string) {
    const next = parsePriceInput(text);

    if (next === null) {
      return;
    }

    setUncontrolledCents(next);
    onValueChange?.(next);
  }

  return (
    <div className="relative">
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 flex items-center font-mono text-body-sm text-muted-foreground',
          compact ? 'left-2.5' : 'left-4',
        )}
      >
        R$
      </span>
      <Input
        {...props}
        variant={compact ? 'compact' : 'outline'}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        value={cents > 0 ? formatAmount(cents) : ''}
        onChange={(event) => handleChange(event.target.value)}
        className={cn(compact ? 'pl-8 font-mono' : 'pl-11 font-mono', className)}
      />
      {name ? <input type="hidden" name={name} value={cents > 0 ? cents : ''} /> : null}
    </div>
  );
}
