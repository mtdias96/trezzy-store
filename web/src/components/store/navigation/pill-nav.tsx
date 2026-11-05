import type { Route } from 'next';
import Link from 'next/link';

export type PillNavItem = {
  label: string;
  href: Route;
  active: boolean;
};

type PillNavProps = {
  label: string;
  items: readonly PillNavItem[];
  // Prefetch completo (dados da URL inclusos) em vez do App Shell: custa uma invocação do servidor por link visível.
  prefetch?: boolean;
};

// Mesma cara das abas em pílula (TabsTrigger, components/ui/tabs.tsx), mas cada item é uma página. A classe não sai
// de lá: o tabs.tsx é 'use client', e uma constante dele chegaria aqui como referência de client, não como texto.
const pillClass = {
  idle: 'inline-flex h-ctl-lg shrink-0 items-center rounded-pill border border-paper-line bg-gray-0 px-4 text-body font-semibold whitespace-nowrap text-ink transition-colors duration-base hover:border-ink lg:h-ctl',
  active: 'inline-flex h-ctl-lg shrink-0 items-center rounded-pill border border-ink bg-ink px-4 text-body font-semibold whitespace-nowrap text-gray-0 lg:h-ctl',
} satisfies Record<'idle' | 'active', string>;

// py-1 e -mx-1 na lista: o contorno do foco fica fora do corte do overflow.
export function PillNav({ label, items, prefetch = false }: PillNavProps) {
  return (
    <nav aria-label={label}>
      <ul className="-mx-1 scrollbar-none flex gap-2 overflow-x-auto px-1 py-1">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              prefetch={prefetch ? true : 'auto'}
              aria-current={item.active ? 'page' : undefined}
              className={item.active ? pillClass.active : pillClass.idle}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
