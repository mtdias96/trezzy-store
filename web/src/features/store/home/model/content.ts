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

export const HERO_CAROUSEL_LABEL = 'Destaques';

export const STORE_PERKS: readonly StorePerk[] = [
  { title: '10x sem juros', description: 'Em todos os cartões' },
  { title: '10% off no Pix', description: 'Desconto direto no checkout' },
  { title: 'Frete grátis', description: 'Acima de R$ 299, todo o Brasil' },
  { title: 'Troca grátis', description: 'Primeira troca em até 30 dias' },
];
