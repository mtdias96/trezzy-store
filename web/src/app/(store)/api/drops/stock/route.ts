import { getLiveDropStock } from '@/features/store/drops/data/queries';

// O HTML da home vale por horas, e o estoque muda com os pedidos. Estática como a página, mas com vida de minutos: a
// CDN responde quase sempre, e cada regeneração é uma chamada à API, em vez das 17 de refazer a home.
export async function GET() {
  return Response.json({ drops: await getLiveDropStock() });
}
