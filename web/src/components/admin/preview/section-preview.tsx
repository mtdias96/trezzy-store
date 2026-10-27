// PRÉVIA (não commitar): corpo das seções que ainda não existem, só para ver o breadcrumb e o item ativo no menu.
export function SectionPreview({ title }: { title: string }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 sm:px-8">
      <h1 className="type-display text-display-lg">{title}</h1>
      <p className="text-body text-muted-foreground">Seção em construção.</p>
    </div>
  );
}
