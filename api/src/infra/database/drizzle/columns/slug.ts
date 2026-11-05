import { sql } from 'drizzle-orm';
import { type AnyPgColumn, check } from 'drizzle-orm/pg-core';

// Slug é o pedaço da URL (trezzy.com.br/marcas/nike-sb): minúsculas, números e hífens entre palavras.
// O servidor gera a partir do nome (sem acento, espaço vira hífen); o banco só garante o formato.
export const slugFormatCheck = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`);
