import type { ProductStatus } from './types';

export const PRODUCT_STATUS_LABELS = {
  draft: 'Rascunho',
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
} satisfies Record<ProductStatus, string>;
