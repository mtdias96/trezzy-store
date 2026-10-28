import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

// Conteúdo da loja com 1376px no máximo (1440px com o respiro lateral), que cresce com a tela.
export function PageContainer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-360 px-4 sm:px-6 lg:px-8', className)} {...props} />;
}
