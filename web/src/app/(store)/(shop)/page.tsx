import type { Metadata } from 'next';

import { DropHeroContainer } from '@/features/store/drops/containers/drop-hero-container';
import { DropRibbonContainer } from '@/features/store/drops/containers/drop-ribbon-container';
import { STREET_TAGLINE } from '@/features/store/home/model/content';

export const metadata: Metadata = {
  title: { absolute: 'Trezzy Store: streetwear, sneakers e eyewear' },
  description: 'Streetwear, sneakers e óculos das marcas que fazem a rua. Drops semanais, frete grátis acima de R$ 299.',
};

// O <h1> é o nome da loja, só para leitor de tela e buscadores: o maior texto visível é o título do drop (<h2>).
export default function Page() {
  return (
    <>
      <h1 className="sr-only">Trezzy Store: streetwear, sneakers e eyewear</h1>
      <DropHeroContainer />
      <DropRibbonContainer tagline={STREET_TAGLINE} />
    </>
  );
}
