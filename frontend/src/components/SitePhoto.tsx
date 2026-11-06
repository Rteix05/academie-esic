import type { Photo } from '@/lib/photos';

/**
 * Photographie du site, dans un cadre aux coins arrondis (le cadre fixe le format, l'image le remplit).
 * `priority` : photo du premier écran, chargée tout de suite.
 */
export default function SitePhoto({ photo, sizes, priority = false, className = '' }: {
  photo: Photo;
  /** Largeur affichée, pour que le navigateur choisisse le bon fichier */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-4xl bg-brand-mint ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fichiers déjà déclinés en plusieurs largeurs (srcset) */}
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
