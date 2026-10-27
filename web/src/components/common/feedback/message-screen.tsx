import type { ReactNode } from 'react';

type MessageScreenProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

// Mensagem de tela inteira (erro, página não encontrada). Só recebe props.
export function MessageScreen({ title, description, action }: MessageScreenProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="type-display text-display-md">{title}</h1>
      <p className="text-body text-muted-foreground">{description}</p>
      {action}
    </main>
  );
}
