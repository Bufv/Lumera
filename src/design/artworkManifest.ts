/**
 * A replaceable artwork entry. Product pages refer to the stable key rather
 * than importing a temporary icon or final PNG directly.
 */
export type ArtworkAsset = {
  src: string;
  alt?: string;
  objectPosition?: string;
};

export type ArtworkManifest = Readonly<Record<string, ArtworkAsset | string>>;

/**
 * The Batch 1 manifest deliberately starts empty. Add approved PNG assets here
 * later; every ArtworkFrame with the matching assetKey will pick them up.
 */
export const artworkManifest: ArtworkManifest = {};
