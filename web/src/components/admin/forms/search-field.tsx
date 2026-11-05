import type { ComponentProps } from 'react';
import { cn } from 'cn';
import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

type SearchFieldProps = Omit<ComponentProps<typeof Input>, 'type' | 'variant'>;

export function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-muted-foreground"
      />
      <Input {...props} type="search" variant="pill" className="pl-10" />
    </div>
  );
}
