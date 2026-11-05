'use client';

import '@/styles/globals.css';

import { RouteError } from '@/components/common/feedback/route-error';
import { cn } from '@/lib/utils';
import { fontVariables } from '@/styles/fonts';

// Substitui o layout raiz quando ele falha: por isso traz o próprio <html>, o CSS e as fontes.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR" className={cn(fontVariables, 'h-full antialiased')}>
      <body className="flex min-h-full flex-col">
        <title>Erro | Trezzy</title>
        <RouteError retry={retry} />
      </body>
    </html>
  );
}
