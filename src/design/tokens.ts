/**
 * Design token Lumera — arah desain berdasarkan visual Brilliant (white background,
 * vibrant orange CTA, clean sans-serif, 3D pathway ring disks, top bar navigation).
 */

export const color = {
  // Latar & permukaan (Clean White & Soft Grey Backdrop)
  ivory: '#FFFFFF', // Body / backdrop utama
  ivoryDeep: '#F8F9FA',
  surface: '#FFFFFF', // Card permukaan
  surfaceMuted: '#F3F4F6', // Container card section backdrop

  // Teks (Tegas & Kontras Tinggi)
  ink: '#111827',
  inkMuted: '#4B5563',
  inkFaint: '#9CA3AF',

  // Aksen Utama (Brilliant Vibrant Orange)
  orange: '#FF8300',
  orangeHover: '#E67600',
  orangeSoft: '#FFF7ED',
  orangeBorder: '#FFD8A8',

  // Legacy compatibility tokens
  teal: '#FF8300',
  tealSoft: '#FFF7ED',
  emerald: '#10B981',

  // Aksen Sekunder
  cobalt: '#3B82F6',
  cobaltSoft: '#EFF6FF',
  indigo: '#4F46E5',
  indigoSoft: '#EEF2FF',
  purple: '#8B5CF6',
  purpleSoft: '#F3E8FF',
  lime: '#8FA82E',
  gold: '#F59E0B',
  goldSoft: '#FEF3C7',

  // Status
  correct: '#10B981',
  correctSoft: '#D1FAE5',
  incorrect: '#EF4444',
  incorrectSoft: '#FEE2E2',

  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
} as const;

export const typography = {
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyUI:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    bold: 700,
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
  sm: '8px',
  md: '12px',
  lg: '16px',
  pill: '9999px',
} as const;

export const motion = {
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

export const shadow = {
  soft: '0 1px 3px rgba(0, 0, 0, 0.06)',
  lifted: '0 4px 16px rgba(0, 0, 0, 0.08)',
  floating: '0 12px 32px rgba(0, 0, 0, 0.12)',
} as const;
