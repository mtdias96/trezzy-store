'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import { CheckIcon } from 'lucide-react';

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  );
}

// `dot` é o radio dos cards (bolinha preta); `check`, o das listas de filtro (círculo roxo com check).
const radioGroupItemVariants = cva(
  'group/radio-group-item peer relative flex aspect-square size-4.5 shrink-0 rounded-full border-[1.5px] border-gray-500 bg-card outline-none group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:shadow-focus-brand disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      variant: {
        dot: 'data-checked:border-ink group-has-[:focus-visible]/field-label:data-checked:border-ink',
        check: 'border-gray-300 data-checked:border-brand data-checked:bg-brand',
      },
    },
    defaultVariants: {
      variant: 'dot',
    },
  },
);

function RadioGroupItem({
  className,
  variant = 'dot',
  ...props
}: RadioPrimitive.Root.Props & VariantProps<typeof radioGroupItemVariants>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ variant, className }))}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        {variant === 'check'
          ? <CheckIcon aria-hidden className="size-3 text-gray-0" strokeWidth={3} />
          : <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />}
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
