// A variante é o mesmo contrato na lista e no detalhe do produto.
export type VariantResponse = {
  id: string;
  size: string;
  color: string;
  sku: string;
  priceInCents: number;
  stock: number;
  active: boolean;
};
