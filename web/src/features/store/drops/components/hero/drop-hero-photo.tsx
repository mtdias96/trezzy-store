import Image from 'next/image';

type DropHeroPhotoProps = {
  src: string;
  alt: string;
  number: string;
  sticker: string | null;
  caption: string;
};

// Celular: a foto vem antes do texto e escurece para baixo. lg: sai do fluxo, ocupa 3/5 à direita e escurece para a
// esquerda, onde o texto passa por cima. O número vazado vem depois do degradê, para não sumir no escuro.
// No celular o selo encolhe inteiro (scale): o text-hand é o menor tamanho manuscrito.
export function DropHeroPhoto({ src, alt, number, sticker, caption }: DropHeroPhotoProps) {
  return (
    <div className="@container relative aspect-square w-full overflow-hidden sm:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-3/5">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1440px) 864px, (min-width: 1100px) 60vw, 100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-brand-950 via-brand-950/40 via-30% to-transparent to-60% lg:bg-linear-to-r"
      />
      <p aria-hidden className="absolute bottom-0 left-1/5 translate-y-1/5 type-display text-display-numeral text-gray-0/50">
        {number}
      </p>
      {sticker
        ? (
            <p className="absolute top-3 right-3 flex size-28 origin-top-right scale-80 rotate-sticker items-center justify-center rounded-pill bg-gray-0 p-2 text-center font-hand text-hand text-ink uppercase shadow-pop sm:right-12 sm:scale-100 lg:top-16 lg:right-16">
              {sticker}
            </p>
          )
        : null}
      <p className="absolute top-16 right-3 hidden text-caption font-bold tracking-widest text-gray-0/80 uppercase text-vertical sm:block lg:right-5">
        {caption}
      </p>
    </div>
  );
}
