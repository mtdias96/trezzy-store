import './globals.css';

import type { Metadata } from 'next';

import { fontVariables } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: { default: 'Trezzy', template: '%s | Trezzy' },
  description: 'Loja online Trezzy.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={cn(fontVariables, 'h-full antialiased')}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
