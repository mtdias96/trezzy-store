import type { Route } from 'next';
import Link from 'next/link';

import type { PieceIconName } from '@/features/store/catalog/model/types';

import { PIECE_ICONS } from './piece-icons';

type PieceTileTone = 'regular' | 'outlet';

type PieceTileProps = {
  href: Route;
  name: string;
  detail: string;
  icon: PieceIconName;
  tone?: PieceTileTone;
};

const toneClass = {
  regular: {
    tile: 'border-line hover:border-ink',
    badge: 'bg-surface',
    name: 'text-ink',
    detail: 'font-medium text-gray-700',
  },
  outlet: {
    tile: 'border-ink bg-ink hover:border-ink-soft hover:bg-ink-soft',
    badge: 'bg-lime',
    name: 'text-gray-0',
    detail: 'font-semibold text-lime',
  },
} satisfies Record<PieceTileTone, Record<'tile' | 'badge' | 'name' | 'detail', string>>;

// O círculo não encolhe: com nome em duas linhas, quem cede é o respiro entre ele e o texto. O @xs vem da lista: abaixo
// de 352px de tela, "acessórios" não cabe em três colunas no tamanho normal.
export function PieceTile({ href, name, detail, icon, tone = 'regular' }: PieceTileProps) {
  const Icon = PIECE_ICONS[icon];
  const classes = toneClass[tone];

  return (
    <Link
      href={href}
      className={`flex h-full min-h-34 flex-col justify-between gap-1 rounded-tile border p-2.5 transition-colors duration-base @xs:p-3 @7xl:p-4 @7xl:pb-3.25 ${classes.tile}`}
    >
      <span aria-hidden className={`flex size-11 shrink-0 items-center justify-center rounded-pill text-ink ${classes.badge}`}>
        <Icon className="size-6" strokeWidth={1.5} />
      </span>
      <span>
        <span className={`block text-body-sm leading-4.25 font-semibold @xs:text-body-lg ${classes.name}`}>{name}</span>
        <span className={`mt-1 block text-caption ${classes.detail}`}>{detail}</span>
      </span>
    </Link>
  );
}
