import 'server-only';

import type { HomeBannerDto, HomeCollectionDto } from './api';

// PRÉVIA (não commitar): banner de teste do carrossel, com a imagem em public/preview/, e as coleções do design, até
// as rotas existirem. O queries.ts importa daqui em vez do api.ts.

const BANNERS: HomeBannerDto[] = [
  {
    id: 'santa-cruz-classics',
    imageUrl: '/preview/banner-santa-cruz.webp',
    imageAlt: 'Santa Cruz: veja as novidades, as clássicas voltaram. Camisetas com a Screaming Hand em verde e azul.',
    href: '/produtos',
  },
];

export async function fetchHomeBanners(): Promise<HomeBannerDto[]> {
  return BANNERS;
}

const COLLECTIONS: HomeCollectionDto[] = [
  { id: 'runner-series', title: 'Runner Series', caption: 'Forte Athletics · 3 modelos', imageUrl: null, href: '/sneakers/corrida' },
  { id: 'camisetas-boxy', title: 'Camisetas Boxy', caption: 'A partir de R$ 189,90', imageUrl: null, href: '/streetwear/camisetas' },
  { id: 'skate', title: 'Skate', caption: 'Tênis de skate', imageUrl: null, href: '/sneakers/skate' },
  { id: 'lentes-de-metal', title: 'Lentes de metal', caption: 'UV400 · Lente Crua', imageUrl: null, href: '/eyewear/metal' },
  { id: 'outlet', title: 'Outlet até -20%', caption: 'Preços de/por', imageUrl: null, href: '/produtos?promocao=true' },
];

export async function fetchHomeCollections(): Promise<HomeCollectionDto[]> {
  return COLLECTIONS;
}
