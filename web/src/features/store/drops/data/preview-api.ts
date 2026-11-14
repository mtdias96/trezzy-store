import 'server-only';

import type { CalendarDropDto, DropDto } from './api';

// PRÉVIA (não commitar): os drops de exemplo do design, com a foto em public/preview/, até as rotas existirem. O
// queries.ts importa daqui em vez do api.ts.

const DROP: DropDto = {
  number: 1,
  brand: 'Treezy',
  title: 'Treezy Core Tee',
  description:
    'Algodão pesado, modelagem oversize e a estética das ruas. Tipografia original em roxo envelhecido. Edição limitada — poucas peças produzidas.',
  startsAt: '2026-10-30T19:00:00-03:00',
  imageUrl: '/preview/treezy-core-tee.jpg',
  imageAlt: 'Coleção Treezy Skate Street: camisetas preta e branca com a marca em roxo, vestidas por skatistas na rua.',
  sticker: 'Edição limitada!',
};

export async function fetchNextDrop(): Promise<DropDto | null> {
  return DROP;
}

const CALENDAR: CalendarDropDto[] = [
  { number: 7, brand: 'Forte Athletics', title: 'Runner 03 “Lima Ácida”', startsAt: '2026-11-13T19:00:00-03:00', priceInCents: 119990, priceIsFrom: false, imageUrl: null, href: '/produtos', status: 'upcoming', quantity: 400, unit: 'pair' },
  { number: 8, brand: 'Pátio 9 × Vândalo', title: 'Cápsula Pátio 9 × Vândalo', startsAt: '2026-11-27T19:00:00-03:00', priceInCents: 24990, priceIsFrom: true, imageUrl: null, href: '/produtos', status: 'upcoming', quantity: 12, unit: 'piece' },
  { number: 6, brand: 'Lente Crua', title: 'Órbita Metal Prata', startsAt: '2026-10-30T19:00:00-03:00', priceInCents: 109990, priceIsFrom: false, imageUrl: null, href: '/produtos', status: 'available', remaining: 38 },
  { number: 5, brand: 'KAIRO', title: 'Low Court “Giz”', startsAt: '2026-10-16T19:00:00-03:00', priceInCents: 89990, priceIsFrom: false, imageUrl: null, href: '/produtos', status: 'sold-out', soldOutAfterMinutes: 6 },
];

export async function fetchDropCalendar(limit: number): Promise<CalendarDropDto[]> {
  return CALENDAR.slice(0, limit);
}
