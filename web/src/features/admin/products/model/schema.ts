import * as z from 'zod';

import { MEDIA_ACCEPTED_TYPES, MEDIA_MAX_BYTES, PRODUCT_MAX_MEDIA } from './media';

// Os mesmos limites da tabela `media` da API: o pedido de upload é recusado antes de chegar a ela.
export const mediaUploadSchema = z.object({
  contentType: z.enum(MEDIA_ACCEPTED_TYPES),
  sizeBytes: z.number().int().positive().max(MEDIA_MAX_BYTES),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;

export const mediaIdSchema = z.string().min(1);

const PG_INTEGER_MAX = 2_147_483_647;

const priceSchema = z.number().int().positive('Informe o preço.').max(PG_INTEGER_MAX);
const stockSchema = z.number({ error: 'Informe o estoque.' }).int('Use um número inteiro.').nonnegative('O estoque não pode ser negativo.').max(PG_INTEGER_MAX);

// O que o editor guarda enquanto o admin preenche. O preço base só serve de padrão para as variantes geradas.
const TITLE_NEEDS_TEXT = 'Use pelo menos uma letra ou um número.';
// Título vazio já tem o "Informe o título.": a regra só olha o que foi digitado.
const hasLetterOrNumber = (title: string) => title === '' || /[\p{L}\p{N}]/u.test(title);
const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .max(64, 'Use até 64 caracteres.')
  .regex(/^([A-Z0-9]+(-[A-Z0-9]+)*)?$/, 'Use letras, números e hífens.');

export const productFormSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(120, 'Use até 120 caracteres.').refine(hasLetterOrNumber, TITLE_NEEDS_TEXT),
  description: z.string().trim().max(5000, 'Use até 5.000 caracteres.'),
  active: z.boolean(),
  brandId: z.string().min(1, 'Escolha a marca.'),
  categoryId: z.string().min(1, 'Escolha a categoria.'),
  basePriceInCents: z.number().int().nonnegative(),
  variants: z
    .array(z.object({
      size: z.string().min(1).max(10),
      color: z.string().max(40, 'Use até 40 caracteres.'),
      sku: skuSchema,
      priceInCents: priceSchema,
      stock: stockSchema,
      active: z.boolean(),
    }))
    .min(1, 'Gere pelo menos uma variante.')
    .max(100, 'Use até 100 variantes.'),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;

// O corpo do POST /admin/products: a action valida de novo, porque Server Action é endpoint público.
export const productCreateSchema = z
  .object({
    title: z.string().trim().min(1, 'Informe o título.').max(120).refine(hasLetterOrNumber, TITLE_NEEDS_TEXT),
    description: z.string().trim().max(5000),
    status: z.enum(['draft', 'active']),
    brandId: z.uuid('Escolha a marca.'),
    categoryId: z.uuid('Escolha a categoria.'),
    variants: z
      .array(z.object({
        size: z.string().min(1).max(10),
        color: z.string().max(40),
        sku: skuSchema.pipe(z.string().min(1)).optional(),
        priceInCents: priceSchema,
        stock: stockSchema,
        active: z.boolean(),
      }))
      .min(1, 'Gere pelo menos uma variante.')
      .max(100),
    mediaIds: z.array(z.uuid()).max(PRODUCT_MAX_MEDIA, `Use até ${PRODUCT_MAX_MEDIA} fotos.`),
  })
  .refine(({ status, mediaIds }) => status !== 'active' || mediaIds.length > 0, {
    path: ['mediaIds'],
    message: 'Produto ativo precisa de pelo menos uma foto.',
  });

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export function toProductCreateInput(values: ProductFormValues, mediaIds: readonly string[]): ProductCreateInput {
  return {
    title: values.title,
    description: values.description,
    status: values.active ? 'active' : 'draft',
    brandId: values.brandId,
    categoryId: values.categoryId,
    variants: values.variants.map(({ size, color, sku, priceInCents, stock, active }) => ({
      size,
      color,
      sku: sku === '' ? undefined : sku,
      priceInCents,
      stock,
      active,
    })),
    mediaIds: [...mediaIds],
  };
}
