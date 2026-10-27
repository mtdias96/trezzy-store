import Link from 'next/link';

import { MessageScreen } from '@/components/common/feedback/message-screen';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <MessageScreen
      as="div"
      title="Produto não encontrado"
      description="Ele pode ter sido removido, ou o endereço está errado."
      action={(
        <Button size="lg" shape="pill" nativeButton={false} render={<Link href="/admin/produtos" />} className="font-semibold">
          Voltar para produtos
        </Button>
      )}
    />
  );
}
