import '@/styles/globals.css';

import type { Metadata } from 'next';

import { cn } from '@/lib/utils';
import { fontVariables } from '@/styles/fonts';

export const metadata: Metadata = {
  title: { default: 'Trezzy', template: '%s | Trezzy' },
  description: 'Loja online Trezzy.',
};

// scroll-pt-20: o header da loja é sticky (até 68px). Sem o respiro, o elemento que recebe o foco ao voltar com
// Shift+Tab, e o destino de uma âncora, rolam para trás dele (WCAG 2.4.11).
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={cn(fontVariables, 'h-full scroll-pt-20 antialiased')}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
