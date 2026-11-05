import 'server-only';

import type { DropDto } from './api';

// PRÉVIA (não commitar): o drop de exemplo do design, com a foto em public/preview/, até a rota existir. O
// queries.ts importa daqui em vez do api.ts.

const DROP: DropDto = {
  number: 1,
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
