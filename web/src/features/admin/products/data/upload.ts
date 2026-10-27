import type { MediaUploader } from '@/features/admin/products/model/media';

// Roda no browser: a foto vai direto para o S3 por uma URL pré-assinada da API, sem passar pelo Next.
// A rota que emite a URL ainda não existe, então todo envio termina em "Falha no envio".
export const uploadProductImage: MediaUploader = () =>
  Promise.reject(new Error('O envio de imagens ainda não está disponível.'));
