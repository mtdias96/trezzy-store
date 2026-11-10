import type { StorePerk } from './types';

export const STREET_TAGLINE = 'Feito pra rua · Skate · Sneakers · Eyewear';

export const DEPARTMENTS_HEADING = {
  eyebrow: 'Categorias',
  title: 'Escolha seu corre',
  description: 'Do tênis ao óculos, tudo original, com nota fiscal e primeira troca grátis.',
};

export const NEW_ARRIVALS_SECTION = {
  eyebrow: 'Novidades',
  title: 'Chegou agora',
};

export const OUTLET_SECTION = {
  eyebrow: 'Outlet',
  title: 'Preço de rua',
  description: 'Peças selecionadas com desconto. Corre antes que acabe o seu tamanho.',
};

export const COLLECTIONS_SECTION = {
  eyebrow: 'Coleções',
  title: 'Coleções em alta',
  description: 'Recortes montados pelo time da loja. Muda conforme a rua muda.',
  featuredBadge: 'Coleção da semana',
  featuredLinkLabel: 'Ver coleção',
};

export const DROP_CALENDAR_SECTION = {
  eyebrow: 'Calendário',
  title: 'Próximos drops',
  description: 'Lançamentos toda sexta às 19h. Ativa o lembrete e a gente avisa 1h antes.',
};

export const BEST_SELLERS_SECTION = {
  eyebrow: 'Top 10 da semana',
  title: 'Mais vendidos',
};

export const PIECES_SECTION = {
  title: 'Compre por peça',
};

export const PRICE_BANDS_SECTION = {
  eyebrow: 'Faixa de preço',
  title: 'Cabe no bolso',
  description: 'Parcela em até 10x sem juros ou leva 10% off pagando no PIX.',
};

export const BRANDS_SECTION = {
  eyebrow: 'Curadoria',
  title: 'Marcas da casa',
  description: 'Oito marcas independentes, escolhidas a dedo pelo time da loja.',
};

export const HERO_CAROUSEL_LABEL = 'Destaques';

export const STORE_PERKS: readonly StorePerk[] = [
  { title: '10x sem juros', description: 'Em todos os cartões' },
  { title: '10% off no Pix', description: 'Desconto direto no checkout' },
  { title: 'Frete grátis', description: 'Acima de R$ 299, todo o Brasil' },
  { title: 'Troca grátis', description: 'Primeira troca em até 30 dias' },
];
