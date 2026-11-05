import Link from 'next/link';

import { MessageScreen } from '@/components/common/feedback/message-screen';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <MessageScreen
      as="div"
      title="Produto não encontrado"
      description="Ele pode ter saído do catálogo ou o endereço mudou."
      action={(
        <Link href="/" className={buttonVariants({ size: 'lg', shape: 'pill' })}>
          Voltar para a loja
        </Link>
      )}
    />
  );
}
