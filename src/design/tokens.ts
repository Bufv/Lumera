/**
 * Design token Lumera — arah desain "Soft Academic Adventure" (FR-018, Prinsip V).
 *
 * Palet sengaja menghindari hijau terang jenuh ala mainan anak. Warna aksen bertumpu
 * pada teal/emerald teredam di atas ivory hangat, dengan gold dipakai hemat untuk
 * perayaan — bukan ledakan warna di setiap interaksi.
 */

export const color = {
  // Latar & permukaan
  ivory: '#FAF7F0',
  ivoryDeep: '#F2EDE1',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F3EC',

  // Teks
  ink: '#1F2933',
  inkMuted: '#5A6773',
  inkFaint: '#8A959F',

  // Aksen utama
  teal: '#1F7A6B',
  tealSoft: '#D7EAE5',
  emerald: '#2E8B6F',

  // Aksen sekunder
  cobalt: '#2B4C8C',
  cobaltSoft: '#DDE4F2',
  lime: '#8FA82E',
  gold: '#C99B2E',
  goldSoft: '#F5E9CC',

  // Status — teredam, bukan merah/hijau menyala
  correct: '#2E8B6F',
  correctSoft: '#DDEDE6',
  incorrect: '#B4542F',
  incorrectSoft: '#F6E3DA',

  border: '#E2DCD0',
} as const;

export const typography = {
  fontFamily:
    "'Source Serif 4', Georgia, 'Times New Roman', serif",
  fontFamilyUI:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.375rem',
    xxl: '1.75rem',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.6,
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
} as const;

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  pill: '999px',
} as const;

/**
 * Motion sengaja pendek dan halus. Prinsip V melarang perayaan meledak-ledak;
 * durasi panjang dengan easing memantul akan terasa seperti game anak.
 */
export const motion = {
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

export const shadow = {
  soft: '0 1px 3px rgba(31, 41, 51, 0.08)',
  lifted: '0 4px 16px rgba(31, 41, 51, 0.10)',
} as const;
