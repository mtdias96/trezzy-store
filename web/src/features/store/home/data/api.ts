import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';
import { internalPathSchema } from '@/lib/internal-path';

// Contrato das rotas públicas da home: banners do carrossel, coleções e editorial. Ainda não existem na API
// (web/AGENTS.md, Pendências).

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

const editorialSchema = z.object({
  badge: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  highlights: z.array(z.object({ value: z.string(), label: z.string() })),
  imageUrl: z.url().nullable(),
  imageAlt: z.string(),
  linkLabel: z.string(),
  href: internalPathSchema,
});

export type HomeEditorialDto = z.infer<typeof editorialSchema>;

// GET /store/editorial → { editorial }, null quando não há editorial no ar
export async function fetchHomeEditorial(): Promise<HomeEditorialDto | null> {
  const { editorial } = await http('/store/editorial', { schema: z.object({ editorial: editorialSchema.nullable() }) });

  return editorial;
}
