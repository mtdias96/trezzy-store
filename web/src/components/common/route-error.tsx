'use client';

import { MessageScreen } from '@/components/common/message-screen';
import { Button } from '@/components/ui/button';

type RouteErrorProps = {
  retry: () => void;
};

// Tela dos error.tsx e do global-error. O detalhe do erro não aparece: em produção, o Next só
// manda ao browser uma mensagem genérica e o digest, que casa com o log do servidor.
export function RouteError({ retry }: RouteErrorProps) {
  return (
    <MessageScreen
      title="Algo deu errado"
      description="Tente de novo em instantes."
      action={(
        <Button size="lg" onClick={retry}>
          Tentar de novo
        </Button>
      )}
    />
  );
}
