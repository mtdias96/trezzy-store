import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';
import { internalPathSchema } from '@/lib/internal-path';

// Contrato das rotas públicas da home: banners do carrossel e coleções. Ainda não existem na API (web/AGENTS.md,
// Pendências).

const bannerSchema = z.object({
  id: z.string(),
  imageUrl: z.url(),
  imageAlt: z.string(),
  href: internalPathSchema,
});

export type HomeBannerDto = z.infer<typeof bannerSchema>;

// GET /store/banners → { banners }, na ordem do carrossel
export async function fetchHomeBanners(): Promise<HomeBannerDto[]> {
  const { banners } = await http('/store/banners', { schema: z.object({ banners: z.array(bannerSchema) }) });

  return banners;
}

const collectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  caption: z.string(),
  imageUrl: z.url().nullable(),
  href: internalPathSchema,
});

export type HomeCollectionDto = z.infer<typeof collectionSchema>;

// GET /store/collections → { collections }, na ordem do mosaico: a primeira é a coleção da semana
export async function fetchHomeCollections(): Promise<HomeCollectionDto[]> {
  const { collections } = await http('/store/collections', { schema: z.object({ collections: z.array(collectionSchema) }) });

  return collections;
}
