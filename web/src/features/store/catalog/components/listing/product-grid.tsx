import { ProductCard } from '@/components/store/data-display/product-card';
import type { ProductSummary } from '@/features/store/catalog/model/types';

type ProductGridProps = {
  products: readonly ProductSummary[];
};

// Largura da foto: 3 colunas ao lado do painel no lg (340px no xl), 3 sem o painel no md e 2 no celular.
const CARD_IMAGE_SIZES = '(min-width: 1440px) 340px, (min-width: 1100px) 25vw, (min-width: 960px) 31vw, 46vw';

// A primeira linha abre a página visível, e uma das fotos dela é o LCP: carrega sem esperar a rolagem.
const EAGER_CARDS = 3;

// O <h2> oculto separa a lista dos filtros no sumário da página: sem ele, os cards (<h3>) ficariam sob "Marca".
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <section aria-labelledby="catalog-products-title">
      <h2 id="catalog-products-title" className="sr-only">Produtos</h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              imageSizes={CARD_IMAGE_SIZES}
              imageLoading={index < EAGER_CARDS ? 'eager' : 'lazy'}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
