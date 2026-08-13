import { useEffect, useState, type HTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import {
  artworkManifest,
  type ArtworkAsset,
  type ArtworkManifest,
} from './artworkManifest';
import './ArtworkFrame.css';

export type ArtworkRatio = 'square' | 'wide' | 'portrait';
export type ArtworkVariant = 'plain' | 'violet' | 'amber';

type AccessibleArtwork =
  | { decorative: true; alt?: string }
  | { decorative?: false; alt: string };

type ArtworkFrameBaseProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Stable product key used when a placeholder is replaced by final artwork. */
  assetKey: string;
  ratio?: ArtworkRatio;
  variant?: ArtworkVariant;
  placeholderIcon: IconName;
  /** Optional page-specific manifest; the central manifest is used by default. */
  manifest?: ArtworkManifest;
};

export type ArtworkFrameProps = ArtworkFrameBaseProps & AccessibleArtwork;

function normalizeAsset(asset: ArtworkAsset | string | undefined): ArtworkAsset | undefined {
  return typeof asset === 'string' ? { src: asset } : asset;
}

export function ArtworkFrame({
  assetKey,
  ratio = 'square',
  variant = 'plain',
  placeholderIcon,
  manifest = artworkManifest,
  decorative = false,
  alt,
  className,
  ...props
}: ArtworkFrameProps) {
  const asset = normalizeAsset(manifest[assetKey]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [asset?.src]);

  const showImage = Boolean(asset?.src) && !imageFailed;
  const accessibleName = alt || asset?.alt || '';
  const classes = [
    'lumera-artwork',
    `lumera-artwork--${ratio}`,
    `lumera-artwork--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...props}
      className={classes}
      data-asset-key={assetKey}
      aria-hidden={decorative || undefined}
      role={!decorative && !showImage ? 'img' : undefined}
      aria-label={!decorative && !showImage ? accessibleName : undefined}
    >
      {showImage ? (
        <img
          className="lumera-artwork__image"
          src={asset?.src}
          alt={decorative ? '' : accessibleName}
          style={{ objectPosition: asset?.objectPosition }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Icon name={placeholderIcon} className="lumera-artwork__placeholder" />
      )}
    </div>
  );
}
