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
 * Approved local artwork is mapped to stable product keys here so page
 * components never need to import presentation assets directly.
 */
export const artworkManifest: ArtworkManifest = {
  'course-algebra': {
    src: '/assets/courses/algebra-cover.webp',
    alt: 'Diorama balok variabel dan pola ubin yang bertumbuh',
    objectPosition: 'center',
  },
  'course-calculus': {
    src: '/assets/courses/calculus-cover.webp',
    alt: 'Diorama kurva, garis singgung, dan area perubahan',
    objectPosition: 'center',
  },
  'course-integers': {
    src: '/assets/math_banner.png',
    alt: 'Ilustrasi alat belajar Matematika',
    objectPosition: 'center',
  },
};
