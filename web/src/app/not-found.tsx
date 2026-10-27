import type { Route } from 'next';
import Link from 'next/link';

import { MessageScreen } from '@/components/common/feedback/message-screen';
import { buttonVariants } from '@/components/ui/button';

const STORE_HOME: Route = '/';

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
