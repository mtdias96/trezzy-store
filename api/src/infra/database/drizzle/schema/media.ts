import { sql } from 'drizzle-orm';
import { check, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Arquivo no S3. A URL não é guardada: sai da `key` + domínio do CDN (configuração), então nunca diverge.
// Fica fora do catálogo porque vai servir também a marcas e banners.
export const media = pgTable('media', {
  id: uuid().primaryKey().defaultRandom(),
  key: text().notNull().unique('media_key_unique'),
  contentType: text({ enum: ['image/jpeg', 'image/png', 'image/webp'] }).notNull(),
  sizeBytes: integer().notNull(),
  // Nulo enquanto a URL pré-assinada foi emitida mas o upload não foi confirmado.
  uploadedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check('media_content_type_check', sql`${t.contentType} in ('image/jpeg', 'image/png', 'image/webp')`),
  check('media_size_check', sql`${t.sizeBytes} > 0 and ${t.sizeBytes} <= 10485760`),
]);
