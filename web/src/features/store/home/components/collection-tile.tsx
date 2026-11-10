import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRightIcon, ImageIcon } from 'lucide-react';

import type { HomeCollection } from '@/features/store/home/model/types';

type CollectionTileProps = {
  collection: HomeCollection;
  imageSizes: string;
};

type FeaturedCollectionTileProps = CollectionTileProps & {
  badge: string;
  linkLabel: string;
};

function TilePhoto({ imageUrl, imageSizes }: Pick<HomeCollection, 'imageUrl'> & { imageSizes: string }) {
  return (
    <>
      <div className="absolute inset-0 transition-transform duration-slow ease-out group-hover:scale-105">
        {imageUrl
          ? <Image src={imageUrl} alt="" fill sizes={imageSizes} className="object-cover" />
          : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-7 text-gray-500/60" />}
      </div>
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent to-50%" />
    </>
  );
}

// A seta some nas peças estreitas (@3xs), para o texto caber.
function TileFooter({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-gray-0 @3xs:inset-x-6 @3xs:bottom-6">
      <div className="min-w-0">
        <p className="text-body-sm font-medium text-gray-0/85">{caption}</p>
        {children}
      </div>
      <span aria-hidden className="hidden size-10 shrink-0 items-center justify-center rounded-pill bg-gray-0 text-ink @3xs:flex">
        <ArrowUpRightIcon className="size-4" />
      </span>
    </div>
  );
}

export function CollectionTile({ collection, imageSizes }: CollectionTileProps) {
  const { title, caption, imageUrl, href } = collection;

  return (
    <Link href={href} className="group @container relative block size-full overflow-hidden rounded-tile bg-surface-media">
      <TilePhoto imageUrl={imageUrl} imageSizes={imageSizes} />
      <TileFooter caption={caption}>
        <h3 className="text-price leading-tight text-gray-0">{title}</h3>
      </TileFooter>
    </Link>
  );
}

export function FeaturedCollectionTile({ collection, imageSizes, badge, linkLabel }: FeaturedCollectionTileProps) {
  const { title, caption, imageUrl, href } = collection;

  return (
    <Link href={href} className="group @container relative block size-full overflow-hidden rounded-tile bg-brand-950">
      <TilePhoto imageUrl={imageUrl} imageSizes={imageSizes} />
      <div className="absolute inset-x-6 top-6">
        <span className="block w-fit rounded-pill bg-brand px-2.5 py-1.5 text-overline text-gray-0 uppercase">{badge}</span>
        <h3 className="mt-3.5 text-feature text-gray-0">{title}</h3>
      </div>
      <TileFooter caption={caption}>
        <p className="mt-0.5 text-subtitle font-bold text-gray-0">{linkLabel}</p>
      </TileFooter>
    </Link>
  );
}
