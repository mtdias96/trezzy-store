import type { ReactNode } from 'react';

type MessageScreenProps = {
  title: string;
  description: string;
  action?: ReactNode;
  as?: 'main' | 'div';
};

// Mensagem de tela inteira (erro, página não encontrada). Só recebe props.
// Dentro do painel, `as="div"`: o layout já tem o <main>.
export function MessageScreen({ title, description, action, as: Element = 'main' }: MessageScreenProps) {
  return (
    <Element className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="type-display text-display-md">{title}</h1>
      <p className="text-body text-muted-foreground">{description}</p>
      {action}
    </Element>
  );
}
