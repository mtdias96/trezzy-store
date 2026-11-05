import type { ComponentProps } from 'react';
import { cn } from 'cn';

// Sem cor de texto: o cn não conhece os tokens e descartaria o text-body-sm ao lado dela. A cor vem do pai.
function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-body-sm leading-none font-semibold select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
