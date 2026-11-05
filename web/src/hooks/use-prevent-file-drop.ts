import { useEffect } from 'react';

function hasFiles(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('Files') ?? false;
}

// Arquivo solto fora de uma área de upload faz o browser abrir o arquivo no lugar da página, e o formulário se perde.
// A área de upload cancela o evento antes de ele chegar à janela: o que chega aqui sem cancelar caiu fora dela.
export function usePreventFileDrop() {
  useEffect(() => {
    function handleDragOver(event: DragEvent) {
      if (hasFiles(event) && !event.defaultPrevented) {
        event.preventDefault();

        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = 'none';
        }
      }
    }

    function handleDrop(event: DragEvent) {
      if (hasFiles(event)) {
        event.preventDefault();
      }
    }

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);
}
