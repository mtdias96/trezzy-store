import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// 1376px de conteúdo: o max-w-360 (1440px) inclui o respiro lateral do lg.
export function PageContainer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-360 px-4 sm:px-6 lg:px-8', className)} {...props} />;
}
