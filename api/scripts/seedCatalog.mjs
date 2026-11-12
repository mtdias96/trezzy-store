// Cria as marcas da loja e as categorias até existir o cadastro delas no painel.
// Pode rodar de novo: o que já existe, pelo nome ou pelo slug, fica como está.
// Uso: pnpm db:seed (lê o DATABASE_URL do api/.env)
import { Pool } from '@neondatabase/serverless';

const BRANDS = ['Grizzly', 'Lost', 'RVCA', 'Vans'];

const CATEGORIES = [
  { name: 'Tênis', grid: 'num' },
  { name: 'Camisetas', grid: 'apparel' },
  { name: 'Moletons', grid: 'apparel' },
  { name: 'Calças', grid: 'num' },
  { name: 'Bonés', grid: 'one' },
  { name: 'Óculos', grid: 'one' },
  { name: 'Shapes & Skate', grid: 'one' },
];

// Mesmo resultado do slugify da API: sem acento, minúsculas, hífen entre palavras.
const slugify = (value) =>
  value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definido: crie o api/.env a partir do .env.example.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log(`Banco: ${new URL(process.env.DATABASE_URL).host}`);

try {
  for (const name of BRANDS) {
    const { rowCount } = await pool.query(
      'insert into brands (name, slug) values ($1, $2) on conflict do nothing',
      [name, slugify(name)],
    );
    console.log(`marca     ${rowCount ? 'criada   ' : 'já existe'} ${name}`);
  }

  for (const { name, grid } of CATEGORIES) {
    const { rowCount } = await pool.query(
      'insert into categories (name, slug, grid) values ($1, $2, $3) on conflict do nothing',
      [name, slugify(name), grid],
    );
    console.log(`categoria ${rowCount ? 'criada   ' : 'já existe'} ${name}`);
  }
} finally {
  await pool.end();
}
