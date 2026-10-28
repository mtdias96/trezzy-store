import 'server-only';

import type {
  CatalogPageDto,
  CatalogPageQuery,
  DepartmentDto,
  ProductDetailDto,
  ProductDto,
  ProductPage,
  ProductQuery,
  ReviewDto,
} from './api';

// PRÉVIA (não commitar): o catálogo de exemplo do design, até as rotas existirem. O queries.ts importa daqui em vez
// do api.ts. As contagens dos departamentos batem com os produtos abaixo, e os nomes da vitrine vêm da taxonomia.

const DEPARTMENTS: DepartmentDto[] = [
  { slug: 'streetwear', name: 'Streetwear', productCount: 8, imageUrl: null },
  { slug: 'sneakers', name: 'Sneakers', productCount: 4, imageUrl: null },
  { slug: 'eyewear', name: 'Eyewear', productCount: 4, imageUrl: null },
];

// Todas as marcas ativas, na ordem do filtro do design.
const BRANDS = [
  { slug: 'mormaco', name: 'Mormaço' },
  { slug: 'patio-9', name: 'Pátio 9' },
  { slug: 'vandalo', name: 'Vândalo' },
  { slug: 'kairo', name: 'KAIRO' },
  { slug: 'lente-crua', name: 'Lente Crua' },
  { slug: 'forte-athletics', name: 'Forte Athletics' },
  { slug: 'casa-ocio', name: 'Casa Ócio' },
  { slug: 'norte-sul', name: 'Norte/Sul' },
  { slug: 'treezy', name: 'Treezy' },
] as const;

type BrandSlug = (typeof BRANDS)[number]['slug'];

type Seed = {
  slug: string;
  title: string;
  brand: BrandSlug;
  department: string;
  category: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  rating?: number;
  tag?: ProductDto['tag'];
  coverUrl?: string;
};

type PreviewProduct = ProductDto & { brand: BrandSlug; department: string; category: string };

// Simula as regras de pagamento da API: até 10x sem juros e 10% de desconto no Pix.
function product({ slug, brand, compareAtPriceInCents, rating, tag, coverUrl, ...seed }: Seed): PreviewProduct {
  return {
    ...seed,
    id: slug,
    slug,
    brand,
    brandName: BRANDS.find((item) => item.slug === brand)?.name ?? brand,
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
  product({ slug: 'camiseta-treezy-core-tee', title: 'Camiseta Treezy Core Tee', brand: 'treezy', department: 'streetwear', category: 'camisetas', priceInCents: 17990, rating: 4.8, tag: 'drop', coverUrl: '/preview/treezy-core-tee.jpg' }),
  product({ slug: 'camiseta-boxy-concreto', title: 'Camiseta Boxy “Concreto”', brand: 'mormaco', department: 'streetwear', category: 'camisetas', priceInCents: 22990, rating: 4.7, tag: 'new' }),
  product({ slug: 'oculos-orbita-metal-prata', title: 'Óculos Órbita Metal Prata', brand: 'lente-crua', department: 'eyewear', category: 'metal', priceInCents: 109990, rating: 4.6, tag: 'drop' }),
  product({ slug: 'moletom-heavyweight-patio', title: 'Moletom Heavyweight “Pátio”', brand: 'patio-9', department: 'streetwear', category: 'moletons', priceInCents: 48990, compareAtPriceInCents: 58990, rating: 4.9 }),
  product({ slug: 'camiseta-pesada-galeria', title: 'Camiseta Pesada “Galeria”', brand: 'patio-9', department: 'streetwear', category: 'camisetas', priceInCents: 27990, rating: 4.6, tag: 'new' }),
  product({ slug: 'tenis-runner-03-lima-acida', title: 'Tênis Runner 03 “Lima Ácida”', brand: 'forte-athletics', department: 'sneakers', category: 'corrida', priceInCents: 119990, rating: 4.6, tag: 'drop' }),
  product({ slug: 'jaqueta-coach-norte', title: 'Jaqueta Coach “Norte”', brand: 'norte-sul', department: 'streetwear', category: 'jaquetas', priceInCents: 63990, rating: 4.8, tag: 'last-units' }),
  product({ slug: 'oculos-vidro-02-acetato-preto', title: 'Óculos Vidro 02 Acetato Preto', brand: 'lente-crua', department: 'eyewear', category: 'acetato', priceInCents: 59990, rating: 4.8, tag: 'new' }),
  product({ slug: 'tenis-low-court-couro-branco', title: 'Tênis Low Court Couro Branco', brand: 'kairo', department: 'sneakers', category: 'casual', priceInCents: 64990, rating: 4.7, tag: 'last-units' }),
  product({ slug: 'bermuda-cargo-asfalto', title: 'Bermuda Cargo “Asfalto”', brand: 'mormaco', department: 'streetwear', category: 'shorts', priceInCents: 25990, compareAtPriceInCents: 32490, rating: 4.6 }),
  product({ slug: 'oculos-recorte-tartaruga', title: 'Óculos Recorte Tartaruga', brand: 'kairo', department: 'eyewear', category: 'solar', priceInCents: 48990, compareAtPriceInCents: 58990, rating: 4.9 }),
  product({ slug: 'calca-wide-leg-grafite', title: 'Calça Wide Leg “Grafite”', brand: 'vandalo', department: 'streetwear', category: 'calcas', priceInCents: 34990, rating: 4.5 }),
  product({ slug: 'tenis-trail-mid-grafite', title: 'Tênis Trail Mid Grafite', brand: 'forte-athletics', department: 'sneakers', category: 'trail', priceInCents: 89990, rating: 4.8, tag: 'sold-out' }),
  product({ slug: 'oculos-shield-lima', title: 'Óculos Shield “Lima”', brand: 'lente-crua', department: 'eyewear', category: 'esportivo', priceInCents: 42990, rating: 4.4 }),
  product({ slug: 'tenis-skate-vulc-preto', title: 'Tênis Skate Vulc “Preto”', brand: 'forte-athletics', department: 'sneakers', category: 'skate', priceInCents: 39990, compareAtPriceInCents: 44990, rating: 4.7 }),
  product({ slug: 'kit-meias-cano-alto', title: 'Kit Meias Cano Alto', brand: 'mormaco', department: 'streetwear', category: 'acessorios', priceInCents: 8990, rating: 4.9 }),
];

function toDto(item: PreviewProduct): ProductDto {
  const { id, slug, title, brandName, priceInCents, compareAtPriceInCents, installments, pixPriceInCents, rating, tag, coverUrl } = item;

  return { id, slug, title, brandName, priceInCents, compareAtPriceInCents, installments, pixPriceInCents, rating, tag, coverUrl };
}

export async function fetchDepartments(): Promise<DepartmentDto[]> {
  return DEPARTMENTS;
}

export async function fetchNewestProducts({ limit, department }: ProductQuery): Promise<ProductPage> {
  const matching = PRODUCTS.filter((item) => department === undefined || item.department === department);

  return { products: matching.slice(0, limit).map(toDto), total: matching.length };
}

type Grid = Pick<ProductDetailDto, 'colors' | 'sizes' | 'sizeChart' | 'composition'> & { description: string };

const BLACK = { id: 'preto', name: 'Preto', swatch: 'black' } as const;
const OFF_WHITE = { id: 'off-white', name: 'Off-white', swatch: 'off-white' } as const;
const WHITE = { id: 'branco', name: 'Branco', swatch: 'white' } as const;

const GRIDS: Record<string, Grid> = {
  streetwear: {
    colors: [BLACK, OFF_WHITE],
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    composition: ['100% algodão, malha 30.1 penteada', 'Gramatura 240 g/m²', 'Lavar à mão ou na máquina, do avesso'],
    description: 'Modelagem ampla, caimento pesado e acabamento reforçado nas costuras: feita para o uso de todo dia na rua.',
    sizeChart: {
      headers: ['Tamanho', 'Largura (cm)', 'Comprimento (cm)', 'Manga (cm)'],
      rows: [['P', '53', '70', '21'], ['M', '56', '72', '22'], ['G', '59', '74', '23'], ['GG', '62', '76', '24'], ['XG', '65', '78', '25']],
    },
  },
  sneakers: {
    colors: [BLACK, WHITE],
    sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
    composition: ['Cabedal em camurça e lona', 'Entressola de EVA', 'Solado de borracha vulcanizada'],
    description: 'Cabedal resistente, palmilha macia e solado com aderência para o skate e para a cidade.',
    sizeChart: {
      headers: ['Tamanho', 'Comprimento do pé (cm)'],
      rows: [['37', '24,0'], ['38', '24,7'], ['39', '25,3'], ['40', '26,0'], ['41', '26,7'], ['42', '27,3'], ['43', '28,0'], ['44', '28,7']],
    },
  },
  eyewear: {
    colors: [BLACK],
    sizes: ['Único'],
    composition: ['Armação em acetato', 'Lentes com proteção UV400', 'Acompanha estojo e flanela'],
    description: 'Lentes com proteção UV400 e armação leve, que não aperta depois de horas na rua.',
    sizeChart: null,
  },
};

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

// Estoque de exemplo: a primeira cor tem tudo, e a segunda esgotou o menor e o maior tamanho.
function inStock(seed: PreviewProduct, grid: Grid, colorIndex: number, sizeIndex: number): boolean {
  if (seed.tag === 'sold-out') {
    return false;
  }

  return grid.sizes.length === 1 || colorIndex === 0 || (sizeIndex > 0 && sizeIndex < grid.sizes.length - 1);
}

export async function fetchProduct(slug: string): Promise<ProductDetailDto | null> {
  const index = PRODUCTS.findIndex((item) => item.slug === slug);
  const seed = PRODUCTS[index];
  const grid = seed && GRIDS[seed.department];

  if (!seed || !grid) {
    return null;
  }

  const { coverUrl, ...product } = toDto(seed);
  const variants = grid.colors.flatMap((color, colorIndex) =>
    grid.sizes.map((size, sizeIndex) => ({
      id: `${slug}-${color.id}-${size}`.toLowerCase(),
      colorId: color.id,
      size,
      inStock: inStock(seed, grid, colorIndex, sizeIndex),
    })),
  );

  return {
    ...product,
    description: [slug === 'camiseta-treezy-core-tee' ? DROP_DESCRIPTION : grid.description, `${product.title}, da ${product.brandName}.`],
    composition: grid.composition,
    reviewCount: reviewCountOf(index, product.rating),
    reviewSummary: reviewSummaryOf(index, product.rating, seed.department),
    // A trilha usa os nomes da taxonomia: os daqui só aparecem para slug que ela não conhece.
    department: { slug: seed.department, name: seed.department },
    category: { slug: seed.category, name: seed.category },
    images: GALLERIES[slug] ?? (coverUrl ? [{ url: coverUrl, alt: `${product.title}: foto da coleção` }] : []),
    colors: grid.colors,
    sizes: grid.sizes,
    variants,
    sizeChart: grid.sizeChart,
  };
}

const SORTS: Record<CatalogPageQuery['sort'], (a: PreviewProduct, b: PreviewProduct) => number> = {
  // Drops na frente, esgotados no fim; o resto na ordem da vitrine.
  relevance: (a, b) => weight(b) - weight(a),
  newest: () => 0,
  'best-selling': (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  'price-asc': (a, b) => a.priceInCents - b.priceInCents,
  'price-desc': (a, b) => b.priceInCents - a.priceInCents,
};

function weight({ tag }: PreviewProduct): number {
  if (tag === 'drop') {
    return 1;
  }

  return tag === 'sold-out' ? -1 : 0;
}

function hasSize(item: PreviewProduct, size: string): boolean {
  return item.tag !== 'sold-out' && (GRIDS[item.department]?.sizes.includes(size) ?? false);
}

// Como a API: cada contagem ignora o próprio filtro.
function inPriceRange({ priceInCents }: PreviewProduct, above: number | null, upTo: number | null): boolean {
  return (above === null || priceInCents > above) && (upTo === null || priceInCents <= upTo);
}

const isOnSale = ({ priceInCents, compareAtPriceInCents }: PreviewProduct) => (compareAtPriceInCents ?? 0) > priceInCents;

export async function fetchCatalogPage(query: CatalogPageQuery): Promise<CatalogPageDto> {
  const { department, category, sizes, brands, priceAboveInCents, priceUpToInCents, onSale, sort, page, limit } = query;
  // Preço e promoção não têm contagem: entram no recorte de todas as outras.
  const scoped = PRODUCTS.filter((item) =>
    (department === null || item.department === department)
    && (category === null || item.category === category)
    && inPriceRange(item, priceAboveInCents, priceUpToInCents)
    && (!onSale || isOnSale(item)));
  const bySize = (item: PreviewProduct) => sizes.length === 0 || sizes.some((size) => hasSize(item, size));
  const byBrand = (item: PreviewProduct) => brands.length === 0 || brands.includes(item.brand);
  const matching = scoped.filter((item) => bySize(item) && byBrand(item)).sort(SORTS[sort]);
  const sizeOrder = [...new Set(scoped.flatMap((item) => GRIDS[item.department]?.sizes ?? []))];

  return {
    products: matching.slice((page - 1) * limit, page * limit).map(toDto),
    total: matching.length,
    facets: {
      sizes: sizeOrder
        .map((value) => ({ value, count: scoped.filter((item) => byBrand(item) && hasSize(item, value)).length }))
        .filter(({ count }) => count > 0),
      brands: BRANDS.map(({ slug, name }) => ({
        slug,
        name,
        count: scoped.filter((item) => bySize(item) && item.brand === slug).length,
      })),
    },
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
