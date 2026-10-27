import type { MediaUploader } from '@/features/admin/products/model/media';

// Roda no browser: a foto vai direto para o S3 por uma URL pré-assinada da API, sem passar pelo Next.
// PRÉVIA (não commitar): simula o envio com progresso até a API emitir a URL. Sem a prévia, todo envio falha.
export const uploadProductImage: MediaUploader = (_file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 3 + Math.round(Math.random() * 6));
      onProgress(progress);

      if (progress === 100) {
        clearInterval(timer);
        resolve();
      }
    }, 120);

    signal.addEventListener('abort', () => {
      clearInterval(timer);
      reject(new DOMException('Envio cancelado.', 'AbortError'));
    }, { once: true });
  });
