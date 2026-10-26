import type { ComponentProps } from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

// 16px no celular (text-base): abaixo disso, o iOS dá zoom ao focar o campo.
function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-field w-full min-w-0 rounded-2xl border border-transparent bg-gray-50 px-4 text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-gray-0 focus-visible:shadow-focus-brand disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-500 md:text-body-lg',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
