import Image from 'next/image';

type DropHeroPhotoProps = {
  src: string;
  alt: string;
  sticker: string | null;
};

// A maior imagem acima da dobra no desktop (LCP): carrega já, com prioridade alta. O card tem no mínimo a proporção
// das fotos de drop (15/16), para a foto aparecer inteira; se o texto ao lado for mais alto, ele estica junto
// (self-stretch) e corta as laterais, e o w-full impede a proporção de alargá-lo além da coluna.
// No celular, o selo encolhe inteiro (scale): o text-hand já é o menor tamanho da fonte manuscrita.
export function DropHeroPhoto({ src, alt, sticker }: DropHeroPhotoProps) {
  return (
    <div className="relative aspect-15/16 w-full overflow-hidden rounded-block bg-brand-900 lg:self-stretch">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1440px) 680px, (min-width: 1100px) 50vw, 100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover"
      />
      {sticker
        ? (
            <p className="absolute top-3 right-3 flex size-28 origin-top-right scale-80 rotate-sticker items-center justify-center rounded-pill bg-gray-0 p-2 text-center font-hand text-hand text-ink uppercase shadow-pop sm:scale-100 lg:top-6 lg:right-6">
              {sticker}
            </p>
          )
        : null}
    </div>
  );
}
