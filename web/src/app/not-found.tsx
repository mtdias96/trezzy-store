import type { Route } from 'next';
import Link from 'next/link';

import { MessageScreen } from '@/components/common/message-screen';
import { buttonVariants } from '@/components/ui/button';

// A home da loja ainda não existe, e o typedRoutes só aceita rota com página: tirar o cast quando ela entrar.
const STORE_HOME = '/' as Route;

export default function NotFound() {
  return (
    <MessageScreen
      title="Página não encontrada"
      description="O endereço pode ter mudado ou não existe mais."
      action={(
        <Link href={STORE_HOME} className={buttonVariants({ size: 'lg' })}>
          Voltar para a loja
        </Link>
      )}
    />
  );
}
