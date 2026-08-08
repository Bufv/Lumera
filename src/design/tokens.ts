/**
 * Sistem desain Lumera.
 *
 * Mekanikanya (skala, bobot, elevasi, anatomi komponen) diturunkan dari
 * `docs/sample/brilliant/`; identitasnya (rona, bahasa, maskot) milik Lumera.
 * Alasan tiap keputusan ada di `docs/desain-fondasi.md` — baca itu dulu sebelum
 * mengubah angka di sini.
 *
 * Kembaran CSS-nya ada di `src/index.css`. Kalau salah satu berubah, ubah keduanya.
 */

/* ------------------------------------------------------------ tangga rona */

/**
 * Sebelas langkah per rona. 500 adalah warna merek; komponen tidak pernah
 * menyetel hex sendiri, melainkan menyusun dari langkah-langkah ini lewat
 * `peran` di bawah.
 */
export const ramp = {
  /** Netral akromatik — sengaja tanpa rona sama sekali. */
  gray: {
    50: '#FAF9F6',
    100: '#F4F3F0',
    200: '#E4E6EE',
    300: '#D3D6DF',
    400: '#A4A8B5',
    500: '#8B90A0',
    600: '#7A8193',
    700: '#667085',
    800: '#3E4557',
    900: '#25293A',
    950: '#15172A',
  },
  violet: {
    50: '#FAF9FF',
    100: '#F0EEFF',
    200: '#DED9FB',
    300: '#BDB4F5',
    400: '#8B7DEC',
    500: '#6D5CE7',
    600: '#5143C8',
    700: '#4135A6',
    800: '#3A2793',
    900: '#23175C',
    950: '#100A26',
  },
  amber: {
    50: '#FFFAF0',
    100: '#FFF7DC',
    200: '#FFEBAF',
    300: '#FDCF72',
    400: '#F8C84E',
    500: '#F4B725',
    600: '#D99A0B',
    700: '#99660A',
    800: '#85500F',
    900: '#543210',
    950: '#241505',
  },
  green: {
    50: '#F2FDF5',
    100: '#E0FAE9',
    200: '#BDF2CE',
    300: '#86E5A7',
    400: '#4ED07C',
    500: '#2EAD68',
    600: '#178F3C',
    700: '#147132',
    800: '#14592B',
    900: '#0B3018',
    950: '#04140A',
  },
  blue: {
    50: '#F2F7FF',
    100: '#E4EEFF',
    200: '#C7DCFF',
    300: '#99C1FF',
    400: '#62A0FB',
    500: '#3B82F6',
    600: '#2668D6',
    700: '#1D51AB',
    800: '#1B4285',
    900: '#112953',
    950: '#071023',
  },
  rose: {
    50: '#FFF5F5',
    100: '#FFE6E6',
    200: '#FFCACA',
    300: '#FFA1A1',
    400: '#F97070',
    500: '#D65A5A',
    600: '#D02B2B',
    700: '#A72020',
    800: '#841C1C',
    900: '#4F1010',
    950: '#210606',
  },
} as const;

export type NamaRona = keyof typeof ramp;

/**
 * Rumus komposisi: satu rona → satu set peran. Komponen berwarna cukup memilih
 * rona, bukan memilih tujuh hex.
 */
export function peran(rona: NamaRona) {
  const r = ramp[rona];
  return {
    tint: r[100],
    soft: r[200],
    border: r[400],
    borderBold: r[500],
    fill: r[500],
    depth: r[600],
    text: r[700],
  } as const;
}

/* -------------------------------------------------------- lapisan semantik */

export const color = {
  bgPrimary: ramp.gray[50],
  bgSecondary: '#FFFFFF',
  bgTertiary: ramp.gray[100],
  bgHover: 'rgba(0, 0, 0, 0.04)',
  bgActive: 'rgba(0, 0, 0, 0.08)',
  bgDisabled: 'rgba(0, 0, 0, 0.05)',

  textPrimary: '#15172A',
  textSecondary: '#667085',
  textTertiary: '#7A8193',
  textDisabled: '#A4A8B5',
  textOnColor: '#FFFFFF',

  borderSolid: ramp.gray[200],
  borderHover: '#B8BDCA',
  borderSubtle: 'rgba(21, 23, 42, 0.08)',
  borderSelect: ramp.violet[400],

  violet: ramp.violet[500],
  violetText: ramp.violet[700],
  violetTint: ramp.violet[100],
  amber: ramp.amber[500],
  amberText: ramp.amber[700],
  amberTint: ramp.amber[100],
  green: ramp.green[500],
  greenText: ramp.green[700],
  greenTint: ramp.green[100],
  blue: ramp.blue[500],
  blueText: ramp.blue[700],
  blueTint: ramp.blue[100],
  rose: ramp.rose[500],
  roseText: ramp.rose[700],
  roseTint: ramp.rose[100],

  /**
   * Alias kompatibilitas untuk layar pelajaran yang belum dipindah ke sistem
   * baru. Semuanya menunjuk peran di atas — tidak ada hex liar yang tersisa.
   */
  ivory: ramp.gray[50],
  ivoryDeep: ramp.gray[100],
  surface: '#FFFFFF',
  surfaceMuted: ramp.gray[50],
  ink: '#15172A',
  inkMuted: '#667085',
  inkFaint: '#7A8193',
  border: ramp.gray[200],
  violetDeep: ramp.violet[600],
  violetSoft: ramp.violet[100],
  violetBorder: ramp.violet[400],
  amberDeep: ramp.amber[600],
  amberSoft: ramp.amber[100],
  amberBorder: ramp.amber[400],
  navMarker: ramp.amber[500],
  orange: ramp.violet[500],
  orangeHover: ramp.violet[600],
  orangeSoft: ramp.violet[100],
  orangeBorder: ramp.violet[400],
  teal: ramp.green[500],
  tealSoft: ramp.green[100],
  emerald: ramp.green[500],
  cobalt: ramp.blue[500],
  cobaltSoft: ramp.blue[100],
  indigo: ramp.violet[500],
  indigoSoft: ramp.violet[100],
  purple: ramp.violet[400],
  purpleSoft: ramp.violet[100],
  lime: ramp.green[400],
  gold: ramp.amber[500],
  goldSoft: ramp.amber[100],
  kuat: ramp.green[500],
  stabil: ramp.amber[500],
  pudar: ramp.amber[600],
  lemah: ramp.rose[500],
  correct: ramp.green[500],
  correctSoft: ramp.green[100],
  incorrect: ramp.rose[500],
  incorrectSoft: ramp.rose[100],
} as const;

/* ------------------------------------------------------------- tipografi */

const FONT = "'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/**
 * Hanya tiga bobot yang dipakai: 400, 500, 700.
 * Judul besar (`display`) berbobot 500 — bukan 800. Itu yang membuat halaman
 * terasa tenang meski hurufnya besar.
 */
export const text = {
  displayLg: { fontSize: '24px', fontWeight: 500, lineHeight: 1.1, letterSpacing: '0' },
  displayXl: { fontSize: '30px', fontWeight: 500, lineHeight: 1.1, letterSpacing: '0' },
  display2xl: { fontSize: '36px', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.36px' },
  display3xl: { fontSize: '40px', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.4px' },

  headingXs: { fontSize: '14px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0' },
  headingSm: { fontSize: '16px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0' },
  headingMd: { fontSize: '20px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '0' },
  headingLg: { fontSize: '24px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '0' },
  headingXl: { fontSize: '30px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '0' },

  bodyXs: { fontSize: '12px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
  bodySm: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
  bodyBase: { fontSize: '16px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
  bodyLg: { fontSize: '20px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },

  /** Satu-satunya teks huruf besar di aplikasi: eyebrow dan label level. */
  actionSm: {
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '0.48px',
    textTransform: 'uppercase' as const,
  },
  actionBase: { fontSize: '16px', fontWeight: 500, lineHeight: 1.25, letterSpacing: '0' },
} as const;

export const typography = {
  fontFamily: FONT,
  fontFamilyUI: FONT,
  size: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '30px',
    display: '36px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 500,
    bold: 700,
    extrabold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
  },
} as const;

/* ---------------------------------------------------- spasi, radius, gerak */

/** Kelipatan 4px. */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const radius = {
  sm: '2px',
  base: '4px',
  xs: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '32px',
  pill: '9999px',
} as const;

export const motion = {
  /** Gerak keycap — harus terasa mekanis, bukan mengambang. */
  press: '100ms',
  fast: '150ms',
  base: '200ms',
  slow: '320ms',
  easing: 'ease-out',
} as const;

/** Bayangan difus tanpa offset vertikal — bukan drop shadow berarah. */
export const shadow = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.04)',
  base: '0 0 15px rgba(0, 0, 0, 0.08)',
  md: '0 0 25px rgba(0, 0, 0, 0.12)',
  outline: `0 0 0 3px ${ramp.violet[400]}`,
  /** Alias lama. */
  soft: '0 1px 3px rgba(0, 0, 0, 0.04)',
  lifted: '0 0 15px rgba(0, 0, 0, 0.08)',
  floating: '0 0 25px rgba(0, 0, 0, 0.12)',
  violet: '0 0 20px rgba(108, 79, 248, 0.24)',
} as const;

/**
 * Keycap: permukaan terangkat 4px dengan "sisi" setebal 4px. Nilai 4px ini
 * kontrak lintas layar — mengubahnya mengubah rasa seluruh aplikasi.
 */
export const keycap = {
  tinggi: '4px',
  sisiKartu: `0 4px 0 0 ${ramp.gray[200]}`,
  sisiKartuHover: '0 4px 0 0 rgba(0, 0, 0, 0.40)',
  sisiTombol: (rona: NamaRona) => `0 4px 0 0 ${ramp[rona][600]}`,
} as const;

/** Lebar kontainer konten. */
export const layout = {
  konten: '1216px',
  kolomPelajaran: '392px',
} as const;
