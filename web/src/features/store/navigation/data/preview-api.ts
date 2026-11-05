import 'server-only';

import type { FeaturedProductDto } from './api';

// PRÉVIA (não commitar): a rota da vitrine com os produtos de exemplo do design, até a API existir. O queries.ts
// importa daqui em vez do api.ts.

function product(slug: string, title: string, brandName: string, priceInCents: number): FeaturedProductDto {
  return { id: slug, slug, title, brandName, priceInCents, coverUrl: null };
}

// Os mesmos slugs do catálogo de exemplo: o card do menu abre a página do produto.
const FEATURED: Record<string, FeaturedProductDto[]> = {
  streetwear: [
    product('camiseta-pesada-galeria', 'Camiseta Pesada “Galeria”', 'Pátio 9', 27990),
    product('jaqueta-coach-norte', 'Jaqueta Coach “Norte”', 'Norte/Sul', 63990),
  ],
  sneakers: [
    product('tenis-low-court-couro-branco', 'Tênis Low Court Couro Branco', 'KAIRO', 64990),
    product('tenis-runner-03-lima-acida', 'Tênis Runner 03 “Lima Ácida”', 'Forte Athletics', 119990),
  ],
  eyewear: [
    product('oculos-shield-lima', 'Óculos Shield “Lima”', 'Lente Crua', 42990),
    product('oculos-vidro-02-acetato-preto', 'Óculos Vidro 02 Acetato Preto', 'Lente Crua', 59990),
  ],
  brands: [
    product('moletom-heavyweight-patio', 'Moletom Heavyweight “Pátio”', 'Pátio 9', 48990),
    product('tenis-runner-03-lima-acida', 'Tênis Runner 03 “Lima Ácida”', 'Forte Athletics', 119990),
  ],
};

export async function fetchFeaturedProducts(department: string, limit: number): Promise<FeaturedProductDto[]> {
  return (FEATURED[department] ?? []).slice(0, limit);
}
