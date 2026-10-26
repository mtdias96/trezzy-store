import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { moneyInCents } from '@infra/database/drizzle/columns/money';
import { slugFormatCheck } from '@infra/database/drizzle/columns/slug';
import { timestamps } from '@infra/database/drizzle/columns/timestamps';

import { media } from './media';

// Id em UUID e slug à parte: renomear a marca muda o slug, nunca as referências.
export const brands = pgTable('brands', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique('brands_slug_unique'),
  // Logo é um arquivo em `media`, como as fotos de produto. Apagar o arquivo só tira o logo da marca.
  logoMediaId: uuid().references(() => media.id, { onDelete: 'set null' }),
  // Inativa some da vitrine (/marcas e /marcas/<slug>), mas segue ligada aos produtos que já tem.
  active: boolean().notNull().default(true),
  ...timestamps,
}, (t) => [
  // "Nike" e "nike" são a mesma marca.
  uniqueIndex('brands_name_unique').on(sql`lower(${t.name})`),
  slugFormatCheck('brands_slug_format_check', t.slug),
]);

export const categories = pgTable('categories', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique('categories_slug_unique'),
  // A grade é da categoria, e o produto a herda: numérica (34–46), vestuário (PP–XGG) ou tamanho único (U).
  grid: text({ enum: ['num', 'apparel', 'one'] }).notNull(),
  // Inativa some da vitrine (menu e /categorias/<slug>), mas segue ligada aos produtos que já tem.
  active: boolean().notNull().default(true),
  ...timestamps,
}, (t) => [
  uniqueIndex('categories_name_unique').on(sql`lower(${t.name})`),
  slugFormatCheck('categories_slug_format_check', t.slug),
  check('categories_grid_check', sql`${t.grid} in ('num', 'apparel', 'one')`),
]);

// Preço, tamanho, cor e estoque moram na variante. Tamanhos/cores do produto e "a partir de R$" são derivados dela.
export const products = pgTable('products', {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique('products_slug_unique'),
  title: text().notNull(),
  // HTML já sanitizado no servidor (allowlist), pronto para renderizar.
  description: text().notNull().default(''),
  // Produto com pedido nunca é apagado: vai para `archived`.
  status: text({ enum: ['draft', 'active', 'inactive', 'archived'] }).notNull().default('draft'),
  brandId: uuid().notNull().references(() => brands.id, { onDelete: 'restrict' }),
  // Uma categoria só: é ela que define a grade (e os tamanhos válidos) das variantes.
  categoryId: uuid().notNull().references(() => categories.id, { onDelete: 'restrict' }),
  // Preenchido na primeira ativação: "novidades" ordena por aqui, não pela criação do rascunho.
  publishedAt: timestamp({ withTimezone: true }),
  ...timestamps,
}, (t) => [
  slugFormatCheck('products_slug_format_check', t.slug),
  check('products_status_check', sql`${t.status} in ('draft', 'active', 'inactive', 'archived')`),
  check('products_published_check', sql`${t.status} <> 'active' or ${t.publishedAt} is not null`),
  // "Mais novos" = ORDER BY published_at DESC, id DESC: índice crescente lido de trás para frente, sem Sort.
  // Não use .desc() aqui: ele gera NULLS LAST, que não casa com o DESC (NULLS FIRST) da query.
  // O id desempata datas iguais (cadastro em lote) e permite paginar por cursor (published_at, id).
  // Os dois primeiros também cobrem as FKs (restrict) de categories e brands.
  index('products_category_status_published_idx').on(t.categoryId, t.status, t.publishedAt, t.id),
  index('products_brand_status_published_idx').on(t.brandId, t.status, t.publishedAt, t.id),
  index('products_status_published_idx').on(t.status, t.publishedAt, t.id),
  // Busca por trecho do nome ("dunk", "low pro"): ILIKE '%…%' usa o índice de trigramas.
  index('products_title_trgm_idx').using('gin', t.title.op('gin_trgm_ops')),
]);

export const productVariants = pgTable('product_variants', {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid().notNull().references(() => products.id, { onDelete: 'cascade' }),
  size: text().notNull(),
  // Minúsculas e sem espaços nas pontas (a API normaliza, o front formata). Sem cor = '' (não null),
  // para a unicidade de (produto, tamanho, cor) valer.
  color: text().notNull().default(''),
  sku: text().notNull(),
  priceInCents: moneyInCents().notNull(),
  stock: integer().notNull().default(0),
  active: boolean().notNull().default(true),
  ...timestamps,
}, (t) => [
  // Uma variante por combinação na grade; também é o índice da FK para products.
  unique('product_variants_product_size_color_unique').on(t.productId, t.size, t.color),
  // SKU único na loja inteira, em maiúsculas e só com letras, números e hífens (a API normaliza antes de gravar).
  unique('product_variants_sku_unique').on(t.sku),
  check('product_variants_sku_format_check', sql`${t.sku} ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'`),
  check('product_variants_color_check', sql`${t.color} = lower(btrim(${t.color}))`),
  check('product_variants_price_check', sql`${t.priceInCents} > 0`),
  check('product_variants_stock_check', sql`${t.stock} >= 0`),
  // Filtros da vitrine só olham variantes ativas: índices parciais ficam menores e mais rápidos.
  index('product_variants_size_idx').on(t.size, t.productId).where(sql`${t.active}`),
  index('product_variants_color_idx').on(t.color, t.productId).where(sql`${t.active}`),
]);

// Galeria: um produto tem N fotos; o media_id como PK garante que cada foto pertence a um produto só.
export const productMedia = pgTable('product_media', {
  mediaId: uuid().primaryKey().references(() => media.id, { onDelete: 'cascade' }),
  productId: uuid().notNull().references(() => products.id, { onDelete: 'cascade' }),
  // A capa é a de menor posição. Reordenar = regravar a galeria numa transação (o unique é checado linha a linha).
  position: smallint().notNull(),
}, (t) => [
  // Uma posição por produto; também serve a busca da galeria em ordem e a FK para products.
  unique('product_media_position_unique').on(t.productId, t.position),
  check('product_media_position_check', sql`${t.position} >= 0`),
]);
