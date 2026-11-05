import type { Route } from 'next';
import Link from 'next/link';

export type FilterLinkItem = {
  label: string;
  href: Route;
  // null: sem a contagem (API fora do ar), o link continua.
  count: number | null;
  active: boolean;
};

type FilterLinksProps = {
  labelledBy: string;
  items: readonly FilterLinkItem[];
  // Prefetch completo (dados da URL inclusos) em vez do App Shell: custa uma invocação do servidor por link visível.
  prefetch?: boolean;
};

const linkClass = {
  idle: 'flex h-11 items-center gap-3 rounded-xl px-2.5 text-body-lg text-ink transition-colors duration-base hover:bg-paper-stone',
  active: 'flex h-11 items-center gap-3 rounded-xl bg-paper-stone px-2.5 text-body-lg font-bold text-ink',
} satisfies Record<'idle' | 'active', string>;

// Filtro que troca de página (departamento), e não de parâmetro: é link, e funciona sem JavaScript.
export function FilterLinks({ labelledBy, items, prefetch = false }: FilterLinksProps) {
  return (
    <ul aria-labelledby={labelledBy} className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            prefetch={prefetch ? true : 'auto'}
            aria-current={item.active ? 'page' : undefined}
            className={item.active ? linkClass.active : linkClass.idle}
          >
            {item.label}
            {item.count === null
              ? null
              : <span className="ml-auto text-caption font-normal text-gray-700 tabular-nums">{item.count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
