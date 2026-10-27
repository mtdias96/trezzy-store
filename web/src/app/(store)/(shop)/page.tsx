import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Trezzy Store: streetwear, sneakers e eyewear' },
  description: 'Streetwear, sneakers e óculos das marcas que fazem a rua. Drops semanais, frete grátis acima de R$ 299.',
};

// As seções da home entram uma a uma, a partir do hero. Até lá, o título da página fica só para leitor de tela.
export default function Page() {
  return <h1 className="sr-only">Trezzy Store</h1>;
}
