import Link from 'next/link';

import { MessageScreen } from '@/components/common/message-screen';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <MessageScreen
      title="Página não encontrada"
      description="O endereço pode ter mudado ou não existe mais."
      action={(
        <Link href="/" className={buttonVariants({ size: 'lg' })}>
          Voltar para a loja
        </Link>
      )}
    />
  );
}
