import type { Route } from 'next';

import { pendingRoute } from '@/lib/route';

type ShopLink = {
  label: string;
  href: Route;
};

type ExternalLink = {
  label: string;
  href: string;
};

type StoreContact = {
  whatsapp: ExternalLink;
  email: string;
  hours: readonly { days: string; time: string }[];
};

type StoreCompany = {
  name: string;
  cnpj: string;
  address: string;
};

export const PRIVACY_HREF = pendingRoute('/privacidade');

// Contatos, redes e dados da empresa vêm do dono da loja: sem eles, o rodapé esconde o bloco.
// PRÉVIA (não commitar): os valores de exemplo abaixo.
const CONTACT: StoreContact | null = {
  whatsapp: { label: '(11) 90000-0000', href: 'https://wa.me/5511900000000?text=Oi%2C%20vim%20pelo%20site%20da%20Trezzy' },
  email: 'sac@trezzy.com.br',
  hours: [
    { days: 'Segunda a sexta', time: '9h às 18h' },
    { days: 'Sábado', time: '9h às 13h' },
  ],
};

// PRÉVIA (não commitar): as contas de exemplo.
const SOCIAL: readonly ExternalLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/trezzystore' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@trezzystore' },
  { label: 'YouTube', href: 'https://www.youtube.com/@trezzystore' },
];

// Razão social, CNPJ e endereço visíveis: o Decreto 7.962/2013 exige esses dados em toda loja online.
// PRÉVIA (não commitar): a empresa de exemplo.
const COMPANY: StoreCompany | null = {
  name: 'Trezzy Comércio de Vestuário Ltda.',
  cnpj: '00.000.000/0001-00',
  address: 'Rua Exemplo, 100, São Paulo, SP, 01000-000',
};

const HELP_LINKS = [
  { label: 'Rastrear pedido', href: pendingRoute('/conta/pedidos') },
  { label: 'Trocas e devoluções', href: pendingRoute('/ajuda/trocas-e-devolucoes') },
  { label: 'Cancelar compra', href: pendingRoute('/ajuda/cancelamento') },
  { label: 'Frete e prazos', href: pendingRoute('/ajuda/frete-e-prazos') },
  { label: 'Guia de tamanhos', href: pendingRoute('/ajuda/guia-de-tamanhos') },
  { label: 'Minha conta', href: pendingRoute('/conta') },
  { label: 'Central de ajuda', href: pendingRoute('/ajuda') },
];

const COMPANY_LINKS = [
  { label: 'Sobre a Trezzy', href: pendingRoute('/sobre') },
  { label: 'Revenda e atacado', href: pendingRoute('/revenda') },
  { label: 'Trabalhe com a gente', href: pendingRoute('/trabalhe-conosco') },
];

// A coluna Loja segue a ordem do header: Novidades, os departamentos do catálogo, Marcas, Drops e Outlet.
export function storeFooter(departments: readonly ShopLink[]) {
  return {
    tagline: 'Roupas, tênis e óculos das marcas que fazem a rua. Drop novo toda sexta, às 19h.',
    newsletter: {
      eyebrow: 'Newsletter',
      title: 'Chega primeiro no próximo drop',
      description: 'Lançamentos, restocks e cupons no seu e-mail antes de todo mundo.',
    },
    contact: CONTACT,
    columns: [
      { title: 'Ajuda', links: HELP_LINKS },
      {
        title: 'Loja',
        links: [
          { label: 'Novidades', href: pendingRoute('/novidades') },
          ...departments.map(({ label, href }) => ({ label, href })),
          { label: 'Marcas', href: pendingRoute('/marcas') },
          { label: 'Drops', href: pendingRoute('/drops') },
          { label: 'Outlet', href: pendingRoute('/outlet') },
        ],
      },
      { title: 'A Trezzy', links: COMPANY_LINKS },
    ],
    social: SOCIAL,
    company: COMPANY,
    paymentHighlight: 'Pix com 10% off · Até 10x sem juros no cartão',
    payments: ['Pix', 'Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Boleto'],
    guarantees: [
      { kind: 'original', label: 'Produtos 100% originais' },
      { kind: 'invoice', label: 'Nota fiscal em todo pedido' },
      { kind: 'exchange', label: 'Primeira troca grátis em 30 dias' },
      { kind: 'shipping', label: 'Frete grátis acima de R$ 299' },
    ],
    // O ano é o da primeira publicação, como pede o aviso de copyright: não muda a cada ano.
    copyright: '© 2026 Trezzy Store. Todos os direitos reservados.',
    legal: [
      { label: 'Política de privacidade', href: PRIVACY_HREF },
      { label: 'Termos de uso', href: pendingRoute('/termos-de-uso') },
    ],
  } as const;
}
