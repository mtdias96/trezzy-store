import type { ComponentProps } from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

// 16px no celular (text-base): abaixo disso, o iOS dá zoom ao focar o campo.
const inputVariants = cva(
  'w-full min-w-0 border text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-focus-brand disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-500',
  {
    variants: {
      variant: {
        filled: 'h-field rounded-2xl border-transparent bg-gray-50 px-4 focus-visible:bg-gray-0 md:text-body-lg',
        outline: 'h-ctl-lg rounded-xl border-gray-250 bg-card px-4 md:text-body-lg',
        dashed: 'h-ctl rounded-pill border-dashed border-gray-300 bg-card px-4 md:text-body',
      },
    },
    defaultVariants: {
      variant: 'filled',
    },
  },
);

function Input({ className, type, variant, ...props }: ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Input };
