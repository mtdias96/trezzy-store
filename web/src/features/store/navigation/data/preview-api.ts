import 'server-only';

import type { DropDto, FeaturedProductDto } from './api';

// PRÉVIA (não commitar): as rotas da vitrine com os dados de exemplo do design, até a API existir. O queries.ts
// importa daqui em vez do api.ts.

function product(slug: string, title: string, brandName: string, priceInCents: number): FeaturedProductDto {
  return { id: slug, slug, title, brandName, priceInCents, coverUrl: null };
}

const FEATURED: Record<string, FeaturedProductDto[]> = {
  streetwear: [
    product('camiseta-pesada-galeria', 'Camiseta Pesada “Galeria”', 'Pátio 9', 27990),
    product('jaqueta-coach-norte', 'Jaqueta Coach “Norte”', 'Norte/Sul', 63990),
  ],
  sneakers: [
    product('runner-02-grafite', 'Runner 02 “Grafite”', 'Forte Athletics', 79990),
    product('court-low-off-white', 'Court Low “Off-White”', 'Pátio 9', 54990),
  ],
  eyewear: [
    product('oculos-shield-lima', 'Óculos Shield “Lima”', 'Norte/Sul', 42990),
    product('armacao-redonda-fume', 'Armação Redonda “Fumê”', 'Pátio 9', 38990),
  ],
  brands: [
    product('moletom-canguru-patio', 'Moletom Canguru “Pátio”', 'Pátio 9', 45990),
    product('runner-02-grafite', 'Runner 02 “Grafite”', 'Forte Athletics', 79990),
  ],
};

const DROP: DropDto = { number: 7, title: 'Runner 03 Lima Ácida', startsAt: '2026-10-30T19:00:00-03:00' };

export async function fetchFeaturedProducts(department: string, limit: number): Promise<FeaturedProductDto[]> {
  return (FEATURED[department] ?? []).slice(0, limit);
}

export async function fetchNextDrop(): Promise<DropDto | null> {
  return DROP;
}
