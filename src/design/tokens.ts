/** Sistem visual Lumera yang diturunkan langsung dari seluruh referensi di docs/sample. */
export const color = {
  ivory: '#F8F8FC',
  ivoryDeep: '#F1F0F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5FA',

  ink: '#101936',
  inkMuted: '#626984',
  inkFaint: '#9A9FB3',

  violet: '#6C4FF8',
  violetDeep: '#5131D6',
  violetSoft: '#F1EDFF',
  violetBorder: '#DCD3FF',

  amber: '#FFB51B',
  amberDeep: '#E58E00',
  amberSoft: '#FFF8E5',
  amberBorder: '#F8D987',
  navMarker: '#FFC928',

  // Alias untuk layar pelajaran yang masih memakai nama token lama.
  orange: '#6C4FF8',
  orangeHover: '#5131D6',
  orangeSoft: '#F1EDFF',
  orangeBorder: '#DCD3FF',
  teal: '#16B7AD',
  tealSoft: '#E5F8F6',
  emerald: '#22C55E',

  cobalt: '#3B82F6',
  cobaltSoft: '#EAF2FE',
  indigo: '#6C4FF8',
  indigoSoft: '#F1EDFF',
  purple: '#8B5CF6',
  purpleSoft: '#F3EEFE',
  lime: '#84CC16',
  gold: '#FFB51B',
  goldSoft: '#FFF8E5',

  kuat: '#28B873',
  stabil: '#F5B81B',
  pudar: '#F57B36',
  lemah: '#EA5262',

  correct: '#28B873',
  correctSoft: '#E3F8EC',
  incorrect: '#EA5262',
  incorrectSoft: '#FDE8EB',

  border: '#E7E7F0',
  borderSubtle: '#F0EFF6',
} as const;

export const typography = {
  fontFamily:
    "'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyUI:
    "'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.375rem',
    xxl: '1.75rem',
    display: '2.125rem',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
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
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '24px',
  pill: '9999px',
} as const;

export const motion = {
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

export const shadow = {
  soft: '0 2px 7px rgba(29, 27, 72, 0.05)',
  lifted: '0 8px 24px rgba(29, 27, 72, 0.07)',
  floating: '0 18px 48px rgba(29, 27, 72, 0.13)',
  violet: '0 8px 18px rgba(91, 63, 222, 0.28)',
} as const;
