import Image from 'next/image';

type DropHeroPhotoProps = {
  src: string;
  alt: string;
  sticker: string | null;
};

// self-stretch: com o texto ao lado mais alto, o card estica e corta as laterais; o w-full impede a proporção de
// alargá-lo além da coluna. No celular o selo encolhe inteiro (scale): o text-hand é o menor tamanho manuscrito.
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
