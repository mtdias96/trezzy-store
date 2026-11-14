import * as z from 'zod';

import { slugify } from '@shared/utils/slugify';
import { PRODUCT_MAX_MEDIA } from '@application/entities/Product';

const PG_INTEGER_MAX = 2_147_483_647;

// Nome comercial da cor no seletor da loja ("Reflective Black").
export const colorNameSchema = z.string().trim().min(1).max(60).nullable().default(null);

// Normaliza antes de validar: os checks de `product_variants` recusam outro formato com 500.
const variantSchema = z.object({
  size: z.string().trim().toUpperCase().min(1).max(10),
  color: z.string().trim().toLowerCase().max(40).default(''),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .max(64)
    .regex(/^[A-Z0-9]+(-[A-Z0-9]+)*$/, 'SKU must contain only letters, numbers and single hyphens.')
    // Sem SKU, o `Product.create` gera um.
    .optional(),
  priceInCents: z.number().int().positive().max(PG_INTEGER_MAX),
  stock: z.number().int().nonnegative().max(PG_INTEGER_MAX).default(0),
  active: z.boolean().default(true),
});

export const createProductSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .refine((title) => slugify(title) !== '', 'Title must contain a letter or a number.'),
  description: z.string().trim().max(5000).default(''),
  // inactive e archived só existem depois do cadastro.
  status: z.enum(['draft', 'active']).default('draft'),
  brandId: z.uuid(),
  categoryId: z.uuid(),
  colorName: colorNameSchema,
  // Um produto da mesma marca e categoria: o novo entra na família de cores dele.
  familyOf: z.uuid().transform((productId) => productId.toLowerCase()).nullable().default(null),
  variants: z
    .array(variantSchema)
    .min(1)
    .max(100)
    .superRefine((variants, ctx) => {
      const skus = new Set<string>();
      const combinations = new Set<string>();

      variants.forEach(({ sku, size, color }, index) => {
        if (sku !== undefined) {
          if (skus.has(sku)) {
            ctx.addIssue({ code: 'custom', path: [index, 'sku'], message: 'SKU is repeated in this product.' });
          }

          skus.add(sku);
        }

        if (combinations.has(`${size}|${color}`)) {
          ctx.addIssue({ code: 'custom', path: [index, 'size'], message: 'Size and color are repeated in this product.' });
        }

        combinations.add(`${size}|${color}`);
      });
    }),
  // A ordem é a da galeria: o primeiro é a capa.
  // Minúsculas: o use case procura cada id no que o Postgres devolve, que vem sempre em minúsculas.
  mediaIds: z
    .array(z.uuid().transform((mediaId) => mediaId.toLowerCase()))
    .max(PRODUCT_MAX_MEDIA)
    .default([])
    .superRefine((mediaIds, ctx) => {
      mediaIds.forEach((mediaId, index) => {
        if (mediaIds.indexOf(mediaId) !== index) {
          ctx.addIssue({ code: 'custom', path: [index], message: 'Photo is repeated in this product.' });
        }
      });
    }),
});

export type CreateProductBody = z.infer<typeof createProductSchema>;
