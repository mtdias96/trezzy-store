type UploadOptions = {
  onProgress: (percent: number) => void;
  signal: AbortSignal;
};

// PUT direto para uma URL pré-assinada (S3). XMLHttpRequest, e não fetch: só ele informa o progresso do envio.
export function uploadWithProgress(url: string, file: File, { onProgress, signal }: UploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(99, Math.floor((event.loaded / event.total) * 100)));
      }
    });
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload recusado (HTTP ${request.status}).`));
      }
    });
    request.addEventListener('error', () => reject(new Error('Falha de rede no upload.')));
    request.addEventListener('abort', () => reject(new DOMException('Envio cancelado.', 'AbortError')));
    signal.addEventListener('abort', () => request.abort(), { once: true });

    request.open('PUT', url);
    request.setRequestHeader('Content-Type', file.type);
    request.send(file);
  });
}
