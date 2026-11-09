import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';
import { internalPathSchema } from '@/lib/internal-path';

// Contrato da rota pública dos banners do carrossel da home. Ainda não existe na API (web/AGENTS.md, Pendências).

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
