import 'server-only';

import type { DepartmentDto, ProductDetailDto, ProductDto, ProductPage, ProductQuery, ReviewDto } from './api';

// PRÉVIA (não commitar): o catálogo de exemplo do design, até as rotas existirem. O queries.ts importa daqui em vez
// do api.ts. As contagens dos departamentos batem com os produtos abaixo.

const DEPARTMENTS: DepartmentDto[] = [
  { slug: 'streetwear', name: 'Streetwear', productCount: 8, imageUrl: null },
  { slug: 'sneakers', name: 'Sneakers', productCount: 4, imageUrl: null },
  { slug: 'eyewear', name: 'Eyewear', productCount: 4, imageUrl: null },
];

type Seed = {
  slug: string;
  title: string;
  brandName: string;
  department: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  rating?: number;
  tag?: ProductDto['tag'];
  coverUrl?: string;
};

// Simula as regras de pagamento da API: até 10x sem juros e 10% de desconto no Pix.
function product({ slug, department, compareAtPriceInCents, rating, tag, coverUrl, ...seed }: Seed): ProductDto & { department: string } {
  return {
    ...seed,
    id: slug,
    slug,
    department,
    compareAtPriceInCents: compareAtPriceInCents ?? null,
    installments: { count: 10, valueInCents: Math.ceil(seed.priceInCents / 10) },
    pixPriceInCents: Math.round(seed.priceInCents * 0.9),
    rating: rating ?? null,
    tag: tag ?? null,
    coverUrl: coverUrl ?? null,
  };
}

// Do mais novo para o mais antigo.
const PRODUCTS = [
  product({ slug: 'camiseta-treezy-core-tee', title: 'Camiseta Treezy Core Tee', brandName: 'Treezy', department: 'streetwear', priceInCents: 17990, rating: 4.8, tag: 'drop', coverUrl: '/preview/treezy-core-tee.jpg' }),
  product({ slug: 'camiseta-boxy-concreto', title: 'Camiseta Boxy “Concreto”', brandName: 'Mormaço', department: 'streetwear', priceInCents: 22990, rating: 4.7, tag: 'new' }),
  product({ slug: 'oculos-orbita-metal-prata', title: 'Óculos Órbita Metal Prata', brandName: 'Lente Crua', department: 'eyewear', priceInCents: 109990, rating: 4.6, tag: 'drop' }),
  product({ slug: 'moletom-heavyweight-patio', title: 'Moletom Heavyweight “Pátio”', brandName: 'Pátio 9', department: 'streetwear', priceInCents: 48990, compareAtPriceInCents: 58990, rating: 4.9 }),
  product({ slug: 'jaqueta-coach-norte', title: 'Jaqueta Coach “Norte”', brandName: 'Norte/Sul', department: 'streetwear', priceInCents: 63990, rating: 4.8, tag: 'last-units' }),
  product({ slug: 'tenis-court-low-off-white', title: 'Tênis Court Low “Off-White”', brandName: 'Forte Athletics', department: 'sneakers', priceInCents: 54990, rating: 4.5, tag: 'new' }),
  product({ slug: 'oculos-shield-lima', title: 'Óculos Shield “Lima”', brandName: 'Lente Crua', department: 'eyewear', priceInCents: 42990, rating: 4.4, tag: 'new' }),
  product({ slug: 'bermuda-cargo-asfalto', title: 'Bermuda Cargo “Asfalto”', brandName: 'Mormaço', department: 'streetwear', priceInCents: 25990, compareAtPriceInCents: 32490, rating: 4.6 }),
  product({ slug: 'tenis-runner-03-lima-acida', title: 'Tênis Runner 03 “Lima Ácida”', brandName: 'Forte Athletics', department: 'sneakers', priceInCents: 119990, rating: 4.6 }),
  product({ slug: 'tenis-skate-vulc-preto', title: 'Tênis Skate Vulc “Preto”', brandName: 'Forte Athletics', department: 'sneakers', priceInCents: 39990, compareAtPriceInCents: 44990, rating: 4.7 }),
  product({ slug: 'armacao-redonda-fume', title: 'Armação Redonda “Fumê”', brandName: 'Lente Crua', department: 'eyewear', priceInCents: 38990, rating: 4.3, tag: 'last-units' }),
  product({ slug: 'bone-6-panel-patio', title: 'Boné 6-Panel “Pátio”', brandName: 'Pátio 9', department: 'streetwear', priceInCents: 15990, rating: 4.8, tag: 'new' }),
  product({ slug: 'calca-wide-leg-grafite', title: 'Calça Wide Leg “Grafite”', brandName: 'Norte/Sul', department: 'streetwear', priceInCents: 34990, rating: 4.5 }),
  product({ slug: 'tenis-runner-02-grafite', title: 'Tênis Runner 02 “Grafite”', brandName: 'Forte Athletics', department: 'sneakers', priceInCents: 79990, compareAtPriceInCents: 89990, rating: 4.6 }),
  product({ slug: 'oculos-sport-wrap-cinza', title: 'Óculos Sport Wrap “Cinza”', brandName: 'Lente Crua', department: 'eyewear', priceInCents: 49990, rating: 4.2 }),
  product({ slug: 'kit-meias-cano-alto', title: 'Kit Meias Cano Alto', brandName: 'Mormaço', department: 'streetwear', priceInCents: 8990, rating: 4.9 }),
];

export async function fetchDepartments(): Promise<DepartmentDto[]> {
  return DEPARTMENTS;
}

export async function fetchNewestProducts({ limit, department }: ProductQuery): Promise<ProductPage> {
  const matching = PRODUCTS.filter((item) => department === undefined || item.department === department);

  return { products: matching.slice(0, limit), total: matching.length };
}

type Grid = Pick<ProductDetailDto, 'colors' | 'sizes' | 'sizeChart' | 'composition'> & { description: string };

const BLACK = { id: 'preto', name: 'Preto', swatch: 'black' } as const;
const OFF_WHITE = { id: 'off-white', name: 'Off-white', swatch: 'off-white' } as const;
const WHITE = { id: 'branco', name: 'Branco', swatch: 'white' } as const;

const GRIDS: Record<string, Grid> = {
  streetwear: {
    colors: [BLACK, OFF_WHITE],
    sizes: ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
    composition: ['100% algodão, malha 30.1 penteada', 'Gramatura 240 g/m²', 'Lavar à mão ou na máquina, do avesso'],
    description: 'Modelagem ampla, caimento pesado e acabamento reforçado nas costuras: feita para o uso de todo dia na rua.',
    sizeChart: {
      headers: ['Tamanho', 'Largura (cm)', 'Comprimento (cm)', 'Manga (cm)'],
      rows: [['PP', '50', '68', '20'], ['P', '53', '70', '21'], ['M', '56', '72', '22'], ['G', '59', '74', '23'], ['GG', '62', '76', '24'], ['XGG', '65', '78', '25']],
    },
  },
  sneakers: {
    colors: [BLACK, WHITE],
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    composition: ['Cabedal em camurça e lona', 'Entressola de EVA', 'Solado de borracha vulcanizada'],
    description: 'Cabedal resistente, palmilha macia e solado com aderência para o skate e para a cidade.',
    sizeChart: {
      headers: ['Tamanho', 'Comprimento do pé (cm)'],
      rows: [['37', '24,0'], ['38', '24,7'], ['39', '25,3'], ['40', '26,0'], ['41', '26,7'], ['42', '27,3'], ['43', '28,0']],
    },
  },
  eyewear: {
    colors: [BLACK],
    sizes: ['U'],
    composition: ['Armação em acetato', 'Lentes com proteção UV400', 'Acompanha estojo e flanela'],
    description: 'Lentes com proteção UV400 e armação leve, que não aperta depois de horas na rua.',
    sizeChart: null,
  },
};

// Categoria da trilha, pelo começo do slug.
const CATEGORIES: [prefix: string, slug: string, name: string][] = [
  ['camiseta', 'camisetas', 'Camisetas'],
  ['moletom', 'moletons', 'Moletons'],
  ['jaqueta', 'jaquetas', 'Jaquetas'],
  ['bermuda', 'shorts', 'Shorts'],
  ['calca', 'calcas', 'Calças'],
  ['bone', 'acessorios', 'Acessórios'],
  ['kit', 'acessorios', 'Acessórios'],
  ['tenis-skate', 'skate', 'Skate'],
  ['tenis-runner', 'corrida', 'Corrida'],
  ['tenis', 'casual', 'Casual'],
  ['armacao', 'armacoes', 'Armações'],
  ['oculos', 'oculos-de-sol', 'Óculos de sol'],
];

// Mais de uma foto só na camiseta do drop: recortes da colagem, para ver a coluna de miniaturas.
const GALLERIES: Record<string, ProductDetailDto['images']> = {
  'camiseta-treezy-core-tee': [
    { url: '/preview/treezy-core-tee.jpg', alt: 'Coleção Treezy Skate Street: camisetas preta e branca, vestidas na rua' },
    { url: '/preview/treezy-core-tee-camisetas.jpg', alt: 'Camisetas Treezy Core Tee branca e preta, com a estampa roxa' },
    { url: '/preview/treezy-core-tee-modelo.jpg', alt: 'Costas da camiseta preta, com a estampa Treezy Skate Street' },
    { url: '/preview/treezy-core-tee-skate.jpg', alt: 'Camiseta preta vestida, com o skate na mão' },
  ],
};

const DROP_DESCRIPTION = 'Algodão pesado, modelagem oversize e a estética das ruas. Tipografia original em roxo envelhecido. Edição limitada — poucas peças produzidas.';

function reviewCountOf(index: number, rating: number | null): number {
  return rating === null ? 0 : 62 - index * 3;
}

// Distribuição que dá a nota do produto: o que passa de 4 vai para as 5 estrelas, e uma ponta fica nas notas baixas.
function reviewSummaryOf(index: number, rating: number | null, department: string): ProductDetailDto['reviewSummary'] {
  const total = reviewCountOf(index, rating);
  const low = Math.round(total * 0.08);
  const five = Math.round((total - low) * ((rating ?? 4) - 4));
  const shares: ProductDetailDto['reviewSummary']['distribution'] = [five, total - low - five, Math.ceil(low / 2), Math.floor(low / 4), low - Math.ceil(low / 2) - Math.floor(low / 4)];

  return { distribution: shares, fit: department === 'eyewear' ? null : 'true-to-size' };
}

export async function fetchProduct(slug: string): Promise<ProductDetailDto | null> {
  const index = PRODUCTS.findIndex((item) => item.slug === slug);
  const seed = PRODUCTS[index];

  if (!seed) {
    return null;
  }

  const { coverUrl, department: departmentSlug, ...product } = seed;
  const grid = GRIDS[departmentSlug];
  const department = DEPARTMENTS.find(({ slug: id }) => id === departmentSlug);

  if (!grid || !department) {
    return null;
  }

  const category = CATEGORIES.find(([prefix]) => slug.startsWith(prefix));
  // Estoque de exemplo: o menor tamanho esgotou em todas as cores, e a segunda cor só tem os do meio.
  const variants = grid.colors.flatMap((color, colorIndex) =>
    grid.sizes.map((size, sizeIndex) => ({
      id: `${slug}-${color.id}-${size}`.toLowerCase(),
      colorId: color.id,
      size,
      inStock: grid.sizes.length === 1 || (sizeIndex > 0 && (colorIndex === 0 || sizeIndex < grid.sizes.length - 1)),
    })),
  );

  return {
    ...product,
    description: [slug === 'camiseta-treezy-core-tee' ? DROP_DESCRIPTION : grid.description, `${product.title}, da ${product.brandName}.`],
    composition: grid.composition,
    reviewCount: reviewCountOf(index, product.rating),
    reviewSummary: reviewSummaryOf(index, product.rating, departmentSlug),
    department: { slug: department.slug, name: department.name },
    category: category ? { slug: category[1], name: category[2] } : null,
    images: GALLERIES[slug] ?? (coverUrl ? [{ url: coverUrl, alt: `${product.title}: foto da coleção` }] : []),
    colors: grid.colors,
    sizes: grid.sizes,
    variants,
    sizeChart: grid.sizeChart,
  };
}

// Data das avaliações de exemplo: dias antes de 27/10/2026.
const daysBefore = (days: number) => new Date(Date.UTC(2026, 9, 27 - days, 15)).toISOString().replace('Z', '+00:00');

const REVIEWS: Record<string, Omit<ReviewDto, 'id'>[]> = {
  sneakers: [
    { rating: 5, title: 'Conforto pra andar o dia inteiro', body: 'Usei numa sessão de rolê pelo centro e voltei sem dor no pé. Forma normal, peguei meu número de sempre.', createdAt: daysBefore(3), size: '41', verified: true, author: 'Lucas M.', location: 'Recife, PE' },
    { rating: 4, title: 'O verde é mais bonito pessoalmente', body: 'Chegou em 3 dias, caixa impecável. Só achei o cadarço um pouco longo.', createdAt: daysBefore(7), size: '42', verified: true, author: 'Bia R.', location: 'Curitiba, PR' },
    { rating: 5, title: 'Valeu cada parcela', body: 'Comprei no Pix com desconto. Material de primeira, nada de cola aparecendo.', createdAt: daysBefore(15), size: '43', verified: true, author: 'Diego S.', location: 'São Paulo, SP' },
  ],
  streetwear: [
    { rating: 5, title: 'Malha pesada de verdade', body: 'Caimento oversize sem ficar sobrando. Lavei três vezes e a estampa continua igual.', createdAt: daysBefore(3), size: 'M', verified: true, author: 'Lucas M.', location: 'Recife, PE' },
    { rating: 4, title: 'A estampa é mais bonita pessoalmente', body: 'Chegou em 3 dias, bem embalada. Só achei a gola um pouco justa no começo.', createdAt: daysBefore(7), size: 'G', verified: true, author: 'Bia R.', location: 'Curitiba, PR' },
    { rating: 5, title: 'Valeu cada parcela', body: 'Comprei no Pix com desconto. Costura reforçada e tecido que não amassa.', createdAt: daysBefore(15), size: 'GG', verified: false, author: 'Diego S.', location: 'São Paulo, SP' },
  ],
  eyewear: [
    { rating: 5, title: 'Leve e não aperta', body: 'Uso o dia inteiro na rua e não marca o nariz. A lente escurece bem no sol forte.', createdAt: daysBefore(3), size: null, verified: true, author: 'Lucas M.', location: 'Recife, PE' },
    { rating: 4, title: 'Estojo caprichado', body: 'Chegou em 3 dias. A armação é mais fina do que parece na foto.', createdAt: daysBefore(7), size: null, verified: true, author: 'Bia R.', location: 'Curitiba, PR' },
    { rating: 5, title: 'Valeu cada parcela', body: 'Comprei no Pix com desconto. Proteção UV de verdade, testei na ótica.', createdAt: daysBefore(15), size: null, verified: true, author: 'Diego S.', location: 'São Paulo, SP' },
  ],
};

export async function fetchRecentReviews(slug: string, limit: number): Promise<ReviewDto[]> {
  const product = PRODUCTS.find((item) => item.slug === slug);

  if (!product || product.rating === null) {
    return [];
  }

  return (REVIEWS[product.department] ?? []).slice(0, limit).map((review, index) => ({ ...review, id: `${slug}-${index}` }));
}
