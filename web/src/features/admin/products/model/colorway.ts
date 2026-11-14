import type { ProductFormInput } from './schema';
import type { ColorwayCandidate, ProductDetail, SelectOption } from './types';

export type ColorwayOption = SelectOption & {
  // Sem nome de cor, a API recusa a ligação: a opção aparece, mas não dá para escolher.
  disabled: boolean;
};

const byTitle = new Intl.Collator('pt-BR', { sensitivity: 'base' });

// "Mesmo modelo de": só produtos da mesma marca e categoria (a grade continua a mesma na troca de cor).
export function colorwayOptions(
  candidates: readonly ColorwayCandidate[],
  { brandId, categoryId, productId }: { brandId: string; categoryId: string; productId: string | null },
): ColorwayOption[] {
  return candidates
    .filter((candidate) => candidate.id !== productId && candidate.brandId === brandId && candidate.categoryId === categoryId)
    .sort((a, b) => byTitle.compare(a.title, b.title))
    .map(({ id, title, colorName }) => ({
      value: id,
      label: colorName ? `${title} · ${colorName}` : `${title} (sem nome de cor)`,
      disabled: colorName === null,
    }));
}

// "Cadastrar outra cor": o novo produto nasce ligado ao de origem. A grade não é copiada: as linhas viriam sem cor, e
// gerar a da cor nova duplicaria os tamanhos.
export function colorCopyDefaults(source: ProductDetail): ProductFormInput {
  const prices = source.variants.map(({ priceInCents }) => priceInCents);

  return {
    title: source.title,
    description: source.description,
    active: true,
    brandId: source.brandId,
    categoryId: source.categoryId,
    colorName: '',
    familyOf: source.id,
    basePriceInCents: prices.length > 0 ? Math.min(...prices) : 0,
    variants: [],
  };
}
