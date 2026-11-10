import type { HomeCollection, HomeCollections } from './types';

export const COLLECTION_TILES = 5;

// O mosaico é desenhado para cinco peças: com menos, a seção some em vez de abrir buraco na grade.
export function toHomeCollections(collections: readonly HomeCollection[]): HomeCollections | null {
  const [featured, ...others] = collections.slice(0, COLLECTION_TILES);

  return featured && others.length === COLLECTION_TILES - 1 ? { featured, others } : null;
}
