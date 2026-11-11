import 'server-only';

import type { HomeBannerDto, HomeCollectionDto, HomeEditorialDto, ResalePanelDto } from './api';

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

const EDITORIAL: HomeEditorialDto = {
  badge: 'Editorial · Eyewear',
  eyebrow: 'Lente Crua',
  title: 'Ver a cidade sem filtro',
  description: 'Coleção Órbita, da Lente Crua: metal escovado, lente mineral e UV400. Pra quem passa o dia na rua.',
  highlights: [
    { value: 'UV400', label: 'Proteção' },
    { value: 'Mineral', label: 'Lente' },
    { value: 'Metal', label: 'Escovado' },
  ],
  imageUrl: null,
  imageAlt: '',
  linkLabel: 'Explorar eyewear',
  href: '/eyewear',
};

export async function fetchHomeEditorial(): Promise<HomeEditorialDto | null> {
  return EDITORIAL;
}

// O segundo painel não aparece aberto nos prints: o título e o texto dele são provisórios.
const RESALE_PANELS: ResalePanelDto[] = [
  { id: 'revenda-oficial', eyebrow: 'Revenda oficial', title: 'Sua loja com selo Trezzy', description: 'Expositor, sacolas e fotos oficiais pra sua vitrine conversar com a nossa.', imageUrl: null, imageAlt: '' },
  { id: 'produtos-exclusivos', eyebrow: 'Produtos exclusivos', title: 'Peças que só a rede tem', description: 'Modelos e cores separados pra quem revende. Sua loja chega na frente.', imageUrl: null, imageAlt: '' },
  { id: 'lojas-parceiras', eyebrow: 'Lojas parceiras', title: 'Do interior às capitais', description: 'Uma rede de lojas de rua que vende o que a rua usa. Bora fazer parte.', imageUrl: null, imageAlt: '' },
];

export async function fetchResalePanels(): Promise<ResalePanelDto[]> {
  return RESALE_PANELS;
}
