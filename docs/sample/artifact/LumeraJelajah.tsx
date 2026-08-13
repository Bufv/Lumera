import { useState, type CSSProperties, type ReactNode } from 'react';

/**
 * LumeraJelajah — satu berkas contoh berisi seluruh hasil redesain alur "Belajar".
 *
 *   <Belajar />          daftar pelajaran + jalur yang sedang dipelajari
 *   <BilanganBulat />    detail course, dua tampilan: 'jalur' (peta) & 'daftar'
 *   <LumeraJelajah />    keduanya, dengan pemindah layar (dipakai di docs/sample)
 *
 * Catatan implementasi
 *  - Semua ilustrasi sudah vektor (SVG inline). Satu-satunya aset raster adalah
 *    kepala Lumo di peta: /assets/lumo_original_head.png
 *  - Kedalaman tombol & kartu memakai gaya "keycap" (lihat `depth` di bawah).
 *    Nilai ini adalah kontrak lintas layar — jangan dikecilkan jadi 4-5px.
 *  - Konten masih statis mengikuti mockup. Titik integrasi data ditandai TODO.
 *  - Lebar kanvas 1536px seperti mockup; belum ada breakpoint responsif.
 */

/* ------------------------------------------------------------------ tokens */

export const depth = {
  /** CTA utama violet */
  primary: '0 7px 0 #5B44CE, 0 14px 24px rgba(109,90,230,0.28)',
  /** CTA sekunder (outline / violet lembut) */
  secondary: '0 6px 0 #DFD7FC',
  /** CTA amber */
  amber: '0 6px 0 #EFBB3E',
  /** Kartu yang bisa ditekan — aktif / berikutnya / terkunci */
  cardActive: '0 10px 0 #A78FFB, 0 18px 26px -14px rgba(90,64,210,0.32)',
  cardNext: '0 10px 0 #C9C0F9, 0 18px 26px -16px rgba(90,64,210,0.20)',
  cardLocked: '0 8px 0 #EFEDF8',
  /** Panel statis / input / chip — tanpa keycap */
  panel: '0 1px 3px rgba(27,27,47,0.04)',
  panelFlat: '0 1px 3px rgba(27,27,47,0.03)',
} as const;

export const c = {
  page: '#FAF9FE',
  surface: '#FFFFFF',
  ink: '#1B1F35',
  inkSoft: '#4B5169',
  inkMuted: '#6B6F85',
  inkFaint: '#8A8DA0',
  inkDisabled: '#A8ABBC',
  border: '#EFEFF5',
  borderSoft: '#EDEDF4',
  violet: '#6D5AE6',
  violetSoft: '#F1EBFC',
  violetChip: '#EDE9FE',
  violetBorder: '#C9BDFB',
  green: '#22B04B',
  amberInk: '#E98625',
  navMarker: '#FFC72C',
} as const;

const font = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const CANVAS = 1536;

const gradPrimary = 'linear-gradient(180deg, #8E7BF7 0%, #7458EE 100%)';
const gradAmber = 'linear-gradient(180deg, #FDF2CE 0%, #FCE49B 100%)';

/* ----------------------------------------------------------------- helpers */

function useHover() {
  const [hover, setHover] = useState(false);
  return {
    hover,
    bind: { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) },
  };
}

const dash = (persen: number, r: number) => {
  const keliling = 2 * Math.PI * r;
  return `${(keliling * persen) / 100} ${keliling}`;
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/* -------------------------------------------------------------------- ikon */

const Arrow = ({ size = 18, color = '#FFFFFF', width = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const Chevron = ({ size = 16, color = c.inkFaint, dir = 'down' as 'down' | 'up' | 'right' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {dir === 'down' && <path d="M6 9.5 12 15.5 18 9.5" />}
    {dir === 'up' && <path d="M6 14.5 12 8.5 18 14.5" />}
    {dir === 'right' && <path d="M9 5.5 15.5 12 9 18.5" />}
  </svg>
);

const Clock = ({ size = 17, color = c.inkFaint }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.6V12l3.2 2" />
  </svg>
);

const Lock = ({ size = 16, color = c.inkFaint, width = 2.1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
    <path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" />
  </svg>
);

const Check = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 10 17.5 19 7.5" />
  </svg>
);

const Search = ({ size = 20, color = c.inkFaint }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 L21 21" />
  </svg>
);

const Bookmark = ({ size = 19, color = '#2A2F45' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 3.8h11a1 1 0 0 1 1 1v15.1l-6.5-4.1-6.5 4.1V4.8a1 1 0 0 1 1-1Z" />
  </svg>
);

const Flame = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 3c1.4 4.2-1.6 6.2-3.6 8.6-2.1 2.5-3.4 4.9-3.4 7.8C9 24.2 12.1 28 16.4 28c4.2 0 7.6-3.3 7.6-7.9 0-4.6-3-7.2-4.7-9.6-.4 1.9-1.3 3-2.4 3.7.6-3.9-.3-8.2-.9-11.2Z" fill="#F97316" />
    <path d="M16.2 15.4c1.2 2.4 3.1 3.4 3.1 6 0 2.2-1.5 3.8-3.4 3.8-2 0-3.4-1.6-3.4-3.6 0-2.6 2.4-3.6 3.7-6.2Z" fill="#FDBA4D" />
  </svg>
);

/* ------------------------------------------------------------------ chrome */

const NAV = ['Beranda', 'Belajar', 'Ulangi', 'Simpanan', 'Peta Ilmu'] as const;

/** Bilah atas global. `aktif` menandai tab bergaris amber. */
export function TopBar({ aktif = 'Belajar' }: { aktif?: (typeof NAV)[number] }) {
  return (
    <header
      style={{
        height: 102,
        background: c.surface,
        borderBottom: `1px solid ${c.border}`,
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ width: CANVAS, flex: 'none', height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 30px 0 35px' }}>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em', color: '#101B3E' }}>Lumera</span>

        <nav style={{ display: 'flex', alignItems: 'flex-start', gap: 41, marginLeft: 88, height: 102 }}>
          {NAV.map((item) => {
            const on = item === aktif;
            return (
              <span
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  borderBottom: `4px solid ${on ? c.navMarker : 'transparent'}`,
                  fontSize: 15,
                  fontWeight: on ? 700 : 500,
                  color: on ? c.ink : '#5B6079',
                  height: 97,
                  padding: '8px 3px 0',
                }}
              >
                {item}
              </span>
            );
          })}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 231, height: 44, boxSizing: 'border-box', background: '#F9FAFC', border: '1px solid #EDEEF3', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 0 14px' }}>
            <Search size={19} />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#9A9DB0' }}>Cari topik...</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: c.inkFaint }}>
              <span>⌘</span>
              <span>K</span>
            </span>
          </div>

          {/* TODO: ambil dari progress/store (streak harian) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginLeft: 40 }}>
            <Flame />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: c.ink, lineHeight: 1.1 }}>7</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: '#5B6079', lineHeight: 1.2 }}>Hari berturut-turut</span>
            </div>
          </div>

          <div style={{ position: 'relative', marginLeft: 42, display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2A2F45" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 0 1 12 0c0 4 1.2 5.5 1.8 6.2.4.5 0 1.3-.7 1.3H4.9c-.7 0-1.1-.8-.7-1.3C4.8 14.5 6 13 6 9Z" />
              <path d="M10 20a2.2 2.2 0 0 0 4 0" />
            </svg>
            <span style={{ position: 'absolute', top: -1, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#EF4444', border: '2px solid #FFFFFF', boxSizing: 'content-box' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 22 }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(180deg, #8B7BF5 0%, #6D5AE6 100%)', color: '#FFFFFF', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</span>
            <Chevron color="#5B6079" />
          </div>
        </div>
      </div>
    </header>
  );
}

const shell: CSSProperties = {
  width: '100%',
  minWidth: CANVAS,
  background: c.page,
  boxSizing: 'border-box',
  overflow: 'hidden',
  color: c.ink,
  fontFamily: font,
  WebkitFontSmoothing: 'antialiased',
};

/* =========================================================== layar: Belajar */

type Mapel = {
  nama: string;
  ringkas: string;
  ikon: ReactNode;
  ikonBg: string;
  lencana: { teks: string; bg: string; fg: string };
};

const segera = { teks: 'Segera hadir', bg: '#FEF3E0', fg: c.amberInk };
const dikembangkan = { teks: 'Dalam pengembangan', bg: '#E7F0FE', fg: '#3B6FE0' };

/** TODO: ganti dengan semuaModul() dari shell/registry saat mapel lain terdaftar. */
const MAPEL: Mapel[] = [
  {
    nama: 'IPA',
    ringkas: 'Mempelajari makhluk hidup, benda, energi, dan alam sekitar.',
    ikonBg: '#E9F8EC',
    lencana: segera,
    ikon: (
      <svg width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="#22A45D" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.2 3.6H14.8" />
        <path d="M10 3.6V9.3L5.4 17.4C4.6 19.2 5.9 21 8 21h8c2.1 0 3.4-1.8 2.6-3.6L14 9.3V3.6" />
        <path d="M7.5 15h9" />
      </svg>
    ),
  },
  {
    nama: 'Bahasa Indonesia',
    ringkas: 'Mengembangkan kemampuan berbahasa dan berpikir.',
    ikonBg: '#FDEAEF',
    lencana: dikembangkan,
    ikon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="3.6" width="12.4" height="16.8" rx="2.4" fill="#F5809F" />
        <rect x="7.9" y="5.6" width="8.6" height="12.8" rx="1.4" fill="#FDEAEF" />
        <path d="M6 3.6h2.1v16.8H6Z" fill="#EE6488" />
      </svg>
    ),
  },
  {
    nama: 'Bahasa Inggris',
    ringkas: 'Meningkatkan kemampuan berkomunikasi global.',
    ikonBg: '#EAF2FD',
    lencana: segera,
    ikon: <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: '#3B82F6' }}>Aa</span>,
  },
  {
    nama: 'IPS',
    ringkas: 'Memahami manusia, masyarakat, dan lingkungannya.',
    ikonBg: '#F1EBFC',
    lencana: segera,
    ikon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={1.9} strokeLinecap="round">
        <circle cx="12" cy="12" r="8.4" />
        <path d="M3.6 12h16.8" />
        <path d="M12 3.6c2.6 2.4 3.9 5.2 3.9 8.4s-1.3 6-3.9 8.4c-2.6-2.4-3.9-5.2-3.9-8.4s1.3-6 3.9-8.4Z" />
      </svg>
    ),
  },
  {
    nama: 'Informatika',
    ringkas: 'Memahami teknologi informasi dan cara kerjanya.',
    ikonBg: '#E8F0FD',
    lencana: dikembangkan,
    ikon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="4.8" y="5.2" width="14.4" height="9.6" rx="1.8" fill="#4B7BEC" />
        <rect x="6.6" y="7" width="10.8" height="6" rx="0.8" fill="#DCE7FB" />
        <path d="M2.6 16.4H21.4l.8 2.4c.2.7-.3 1.4-1.1 1.4H2.9c-.8 0-1.3-.7-1.1-1.4Z" fill="#4B7BEC" />
      </svg>
    ),
  },
  {
    nama: 'Koding & AI',
    ringkas: 'Belajar membuat program dan membangun solusi cerdas.',
    ikonBg: '#E8F7F6',
    lencana: segera,
    ikon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17AFAC" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.6 7.6 4 12l4.6 4.4" />
        <path d="M15.4 7.6 20 12l-4.6 4.4" />
        <path d="M13.4 5.4 10.6 18.6" />
      </svg>
    ),
  },
  {
    nama: 'Literasi Finansial',
    ringkas: 'Mengelola uang dengan bijak untuk masa depan.',
    ikonBg: '#FDF5E2',
    lencana: segera,
    ikon: <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', color: '#F0A31B' }}>Rp</span>,
  },
];

/** Ilustrasi garis bilangan pada kartu jalur aktif — vektor penuh. */
function GarisBilanganArt() {
  const tick = (i: number) => 42 + i * 46;
  const angka = ['−3', '−2', '−1', '0', '1', '2', '3'];
  return (
    <svg width="360" height="398" viewBox="0 0 360 398" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="gbMist">
          <stop offset="0" stopColor="#E4DCFA" stopOpacity="0.8" />
          <stop offset="1" stopColor="#E4DCFA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gbPad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EFEEF7" />
        </linearGradient>
      </defs>

      <ellipse cx="180" cy="292" rx="168" ry="58" fill="url(#gbMist)" />
      <ellipse cx="86" cy="118" rx="62" ry="26" fill="url(#gbMist)" />

      <g opacity="0.6" fill="#E3DBF8">
        <ellipse cx="292" cy="112" rx="34" ry="15" />
        <ellipse cx="266" cy="102" rx="21" ry="11" />
        <ellipse cx="64" cy="336" rx="26" ry="10" />
      </g>
      <path d="M300 46l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="#C9BDFB" opacity="0.85" />

      {/* kartu suhu: konteks dunia nyata untuk bilangan negatif */}
      <g transform="translate(58,96)">
        <rect x="0" y="0" width="86" height="104" rx="18" fill="#FFFFFF" stroke="#F0ECFB" />
        <rect x="38" y="18" width="10" height="58" rx="5" fill="#EDE9FB" />
        <rect x="38" y="44" width="10" height="32" rx="5" fill="#7458EE" />
        <circle cx="43" cy="82" r="11" fill="#7458EE" />
        <text x="43" y="-8" textAnchor="middle" fontFamily={font} fontSize="17" fontWeight="700" fill={c.ink}>
          −4°C
        </text>
      </g>

      {/* garis bilangan */}
      <g transform="translate(0,250)">
        <line x1="30" y1="0" x2="330" y2="0" stroke="#CFC6F4" strokeWidth="3.5" strokeLinecap="round" />
        {angka.map((n, i) => (
          <g key={n}>
            <line x1={tick(i)} y1={-9} x2={tick(i)} y2={9} stroke={i === 3 ? '#7458EE' : '#CFC6F4'} strokeWidth={i === 3 ? 3.5 : 2.4} strokeLinecap="round" />
            <text x={tick(i)} y={34} textAnchor="middle" fontFamily={font} fontSize="15" fontWeight={i === 3 ? 700 : 500} fill={i === 3 ? c.ink : c.inkFaint}>
              {n}
            </text>
          </g>
        ))}
        {/* penanda posisi saat ini */}
        <circle cx={tick(2)} cy="0" r="16" fill="#7458EE" opacity="0.16" />
        <circle cx={tick(2)} cy="0" r="8.5" fill="#7458EE" />
        <g transform={`translate(${tick(2)},-46)`}>
          <rect x="-26" y="-17" width="52" height="32" rx="11" fill="#7458EE" />
          <path d="M-5 15 0 22 5 15z" fill="#7458EE" />
          <text x="0" y="5" textAnchor="middle" fontFamily={font} fontSize="15" fontWeight="700" fill="#FFFFFF">
            −1
          </text>
        </g>
      </g>

      <g>
        <ellipse cx="180" cy="352" rx="82" ry="14" fill="url(#gbPad)" opacity="0.85" />
      </g>
    </svg>
  );
}

export function Belajar({
  progressJalur = 45,
  progressModul = 55,
  onBukaCourse,
}: {
  progressJalur?: number;
  progressModul?: number;
  onBukaCourse?: (courseId: string) => void;
}) {
  const jalur = clamp(progressJalur);
  const modul = clamp(progressModul);

  return (
    <div data-screen-label="Belajar" style={shell}>
      <TopBar aktif="Belajar" />

      <main style={{ width: CANVAS, boxSizing: 'border-box', padding: '34px 64px 46px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-0.022em', color: c.ink }}>Jelajahi pelajaran</h1>
            <p style={{ margin: '9px 0 0', fontSize: 15.5, lineHeight: 1.4, fontWeight: 500, color: c.inkMuted }}>Pilih jalur belajar dan kuasai setiap konsep secara bertahap.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 19, flex: 'none', paddingBottom: 2 }}>
            <div style={{ width: 218, height: 51, boxSizing: 'border-box', background: c.surface, border: `1px solid ${c.borderSoft}`, borderRadius: 16, boxShadow: depth.panel, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 0 19px', cursor: 'pointer' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2A2F45" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.6 8.6 12 4.3l9.4 4.3L12 12.9Z" />
                <path d="M6.6 10.7v4.6c0 1.7 2.4 3 5.4 3s5.4-1.3 5.4-3v-4.6" />
                <path d="M21.4 8.9v5.4" />
              </svg>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: c.ink }}>SMP Kelas VII</span>
              <Chevron size={18} color={c.inkMuted} />
            </div>
            <div style={{ width: 315, height: 51, boxSizing: 'border-box', background: c.surface, border: `1px solid ${c.borderSoft}`, borderRadius: 16, boxShadow: depth.panel, display: 'flex', alignItems: 'center', gap: 13, padding: '0 18px' }}>
              <Search />
              <span style={{ flex: 1, fontSize: 15.5, fontWeight: 500, color: '#9A9DB0' }}>Cari topik atau pelajaran</span>
            </div>
          </div>
        </div>

        <h2 style={{ margin: '32px 0 0', fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', color: c.ink }}>Sedang kamu pelajari</h2>

        <section
          style={{
            marginTop: 14,
            width: 1416,
            height: 398,
            boxSizing: 'border-box',
            border: '1px solid #F0EEF9',
            borderRadius: 22,
            background: 'linear-gradient(102deg, #F3EDFD 0%, #F8F5FE 34%, #FBFAFE 62%, #F5F5FB 100%)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
          }}
        >
          <GarisBilanganArt />

          <div style={{ position: 'relative', boxSizing: 'border-box', padding: '30px 32px 13px 1px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 800, letterSpacing: '0.085em', color: c.violet }}>MATEMATIKA &nbsp;·&nbsp; SMP KELAS VII</span>
            <h3 style={{ margin: '8px 0 0', fontSize: 31, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-0.015em', color: c.ink }}>Bilangan dalam Kehidupan</h3>
            <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.4, fontWeight: 500, color: c.inkMuted }}>Memahami bilangan dan menggunakannya dalam situasi sehari-hari.</p>

            <div style={{ position: 'absolute', top: 24, left: 831, width: 86, height: 86, borderRadius: '50%', background: `conic-gradient(${c.violet} ${jalur * 3.6}deg, #E1DCF3 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 68, height: 68, borderRadius: '50%', background: '#FBFAFE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', color: c.ink, lineHeight: 1.1 }}>{jalur}%</span>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: c.inkMuted }}>selesai</span>
              </span>
            </div>

            <div style={{ position: 'absolute', top: 22, left: 987, width: 40, height: 40, boxSizing: 'border-box', background: c.surface, border: '1px solid #EFEFF6', borderRadius: 12, boxShadow: '0 1px 3px rgba(27,27,47,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bookmark />
            </div>

            <div style={{ marginTop: 18, display: 'flex', alignItems: 'flex-start' }}>
              {/* modul 1 — sedang dipelajari */}
              <div
                onClick={() => onBukaCourse?.('bilangan-bulat')}
                style={{ width: 300, flex: 'none', height: 246, boxSizing: 'border-box', background: c.surface, border: '1px solid #EBE6FC', borderRadius: 16, boxShadow: depth.cardActive, padding: '19px 18px 17px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <span style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: '#EAE5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: c.violet }}>1</span>
                  <span style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 700, color: c.ink }}>Bilangan di Bawah Nol</span>
                </div>
                <span style={{ alignSelf: 'flex-start', margin: '10px 0 0 43px', padding: '5px 11px', borderRadius: 8, background: '#DAF3E0', fontSize: 12.5, fontWeight: 700, color: '#1F8C3F' }}>Sedang dipelajari</span>
                <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Positif, negatif, dan nol', 'Garis bilangan', 'Membandingkan bilangan', 'Nilai mutlak'].map((t) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13.5, fontWeight: 500, color: c.inkSoft }}>
                      <span style={{ width: 3, height: 3, flex: 'none', borderRadius: '50%', background: '#9A9DB0', transform: 'translateY(-4px)' }} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #F2F2F7', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: c.ink }}>{modul}%</span>
                    <span style={{ display: 'block', marginTop: 7, height: 7, borderRadius: 4, background: '#EBEBF0', overflow: 'hidden' }}>
                      <span style={{ display: 'block', width: `${modul}%`, height: '100%', borderRadius: 4, background: '#7458EE' }} />
                    </span>
                  </div>
                  <span style={{ width: 133, height: 40, flex: 'none', boxSizing: 'border-box', borderRadius: 20, background: gradPrimary, boxShadow: depth.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 0 19px' }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: '#FFFFFF' }}>Lanjutkan</span>
                    <Arrow size={17} width={2.3} />
                  </span>
                </div>
              </div>

              <div style={{ width: 31, flex: 'none', paddingTop: 110 }}>
                <span style={{ display: 'block', borderTop: '1.5px dashed #D6D2E9' }} />
              </div>

              {/* modul 2 — belum dimulai */}
              <div style={{ width: 325, flex: 'none', height: 246, boxSizing: 'border-box', background: c.surface, border: '1px solid #EDEAFC', borderRadius: 16, boxShadow: depth.cardNext, padding: '19px 18px 17px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                  <span style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: '#DDD7FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: c.violet }}>2</span>
                  <span style={{ fontSize: 16, lineHeight: 1.35, fontWeight: 700, color: c.ink }}>
                    Bergerak dengan
                    <br />
                    Bilangan Bulat
                  </span>
                </div>
                <span style={{ alignSelf: 'flex-start', margin: '9px 0 0 43px', padding: '5px 11px', borderRadius: 8, background: '#EDEEF3', fontSize: 12.5, fontWeight: 700, color: c.inkMuted }}>Belum dimulai</span>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Penjumlahan dan pengurangan', 'Perkalian dan pembagian', 'Operasi campuran', 'Masalah kontekstual'].map((t) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13.5, fontWeight: 500, color: c.inkSoft }}>
                      <span style={{ width: 3, height: 3, flex: 'none', borderRadius: '50%', background: '#9A9DB0', transform: 'translateY(-4px)' }} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'relative', marginTop: 'auto', height: 40, boxSizing: 'border-box', border: `1.5px solid ${c.violetBorder}`, borderRadius: 12, background: '#FCFBFF', boxShadow: depth.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: c.violet }}>Lihat modul</span>
                  <span style={{ position: 'absolute', right: 17, display: 'flex' }}>
                    <Arrow size={18} color={c.violet} />
                  </span>
                </div>
              </div>

              <div style={{ width: 39, flex: 'none', paddingTop: 103, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ flex: 1, borderTop: '1.5px dashed #D6D2E9' }} />
                <Lock size={13} color={c.inkDisabled} />
                <span style={{ flex: 1, borderTop: '1.5px dashed #D6D2E9' }} />
              </div>

              {/* tantangan — terkunci */}
              <div style={{ width: 328, flex: 'none', height: 246, boxSizing: 'border-box', background: '#FCFBFE', border: '1px solid #EFEDF8', borderRadius: 16, boxShadow: depth.cardLocked, padding: '19px 18px 17px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 11, background: '#EAE5FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={19} color={c.inkSoft} width={1.9} />
                  </span>
                  <span style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 700, color: c.ink }}>Tantangan Bilangan Bulat</span>
                </div>
                <span style={{ alignSelf: 'flex-start', margin: '10px 0 0 52px', padding: '5px 11px', borderRadius: 8, background: '#ECEDF3', fontSize: 12.5, fontWeight: 700, color: c.inkFaint }}>Terkunci</span>
                <p style={{ margin: '26px 0 0', fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: c.inkMuted }}>
                  Selesaikan kedua modul
                  <br />
                  sebelumnya untuk membuka.
                </p>
                <div style={{ position: 'relative', marginTop: 'auto', height: 40, boxSizing: 'border-box', borderRadius: 12, background: '#F2F3F7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                  <Lock color={c.inkDisabled} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: c.inkDisabled }}>Terkunci</span>
                  <span style={{ position: 'absolute', right: 17, display: 'flex' }}>
                    <Arrow size={18} color="#CFD1DC" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <h2 style={{ margin: '36px 0 0', fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', color: c.ink }}>Pelajaran lainnya</h2>
        <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 500, color: c.inkMuted }}>Lebih banyak jalur belajar sedang kami siapkan.</p>

        <div style={{ marginTop: 19, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '13px 15px' }}>
          {MAPEL.map((m) => (
            <div key={m.nama} style={{ height: 130, boxSizing: 'border-box', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, boxShadow: depth.panelFlat, padding: '20px 20px 0', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <span style={{ width: 58, height: 58, flex: 'none', borderRadius: 14, background: m.ikonBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.ikon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.ink }}>{m.nama}</div>
                <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.45, fontWeight: 500, color: c.inkMuted }}>{m.ringkas}</p>
                <span style={{ display: 'inline-flex', marginTop: 10, padding: '5px 11px', borderRadius: 8, background: m.lencana.bg, fontSize: 13, fontWeight: 600, color: m.lencana.fg }}>{m.lencana.teks}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ===================================================== layar: Bilangan Bulat */

type Pelajaran = {
  no: string;
  judul: string;
  ringkas: string;
  menit: string;
  jenis: 'pelajari' | 'tantangan';
  status: 'selesai' | 'aktif' | 'terkunci';
};

/** TODO: turunkan dari content/registry + progress/store. */
const PELAJARAN: Pelajaran[] = [
  { no: '01', judul: 'Mengapa Ada Bilangan Negatif?', ringkas: 'Pelajari alasan dan contoh bilangan negatif dalam kehidupan nyata.', menit: '5–7 menit', jenis: 'pelajari', status: 'selesai' },
  { no: '02', judul: 'Positif, Negatif, dan Nol', ringkas: 'Memahami bilangan positif, negatif, dan nol serta contohnya.', menit: '5–8 menit', jenis: 'pelajari', status: 'selesai' },
  { no: '03', judul: 'Menempatkan Bilangan pada Garis', ringkas: 'Menempatkan dan membaca posisi bilangan pada garis bilangan.', menit: '6–8 menit', jenis: 'pelajari', status: 'selesai' },
  { no: '04', judul: 'Mana yang Lebih Besar?', ringkas: 'Membandingkan bilangan bulat menggunakan garis bilangan.', menit: '6–10 menit', jenis: 'pelajari', status: 'aktif' },
  { no: '05', judul: 'Mengenal Nilai Mutlak', ringkas: 'Memahami arti dan cara menghitung nilai mutlak bilangan bulat.', menit: '6–8 menit', jenis: 'pelajari', status: 'terkunci' },
  { no: '06', judul: 'Tantangan Modul', ringkas: 'Uji pemahamanmu tentang Bilangan di Bawah Nol.', menit: '8–12 menit', jenis: 'tantangan', status: 'terkunci' },
];

function BarisPelajaran({ p, onBuka }: { p: Pelajaran; onBuka?: (no: string) => void }) {
  const { hover, bind } = useHover();
  const aktif = p.status === 'aktif';
  const bisaDiklik = p.status !== 'terkunci';

  if (aktif) {
    return (
      <div
        {...bind}
        onClick={() => onBuka?.(p.no)}
        style={{ position: 'relative', height: 76, boxSizing: 'border-box', background: '#F9F7FE', border: '1.5px solid #DED5FB', borderLeft: `4px solid ${c.violet}`, borderRadius: 13, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', cursor: 'pointer' }}
      >
        <span style={{ position: 'absolute', left: -9, top: '50%', width: 14, height: 14, marginTop: -7, boxSizing: 'border-box', borderRadius: '50%', background: c.surface, border: `3.4px solid ${c.violet}` }} />
        <span style={{ width: 32, flex: 'none', fontSize: 17, fontWeight: 700, color: c.violet }}>{p.no}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 18.5, fontWeight: 700, letterSpacing: '-0.005em', color: c.ink }}>{p.judul}</span>
          <span style={{ display: 'block', marginTop: 4, fontSize: 14.5, fontWeight: 500, color: c.inkMuted }}>{p.ringkas}</span>
        </span>
        <span style={{ flex: 'none', padding: '6px 12px', borderRadius: 8, background: '#EDE7FD', fontSize: 13.5, fontWeight: 600, color: c.violet }}>Pelajari</span>
        <span style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, fontWeight: 500, color: c.inkSoft }}>
          <Clock />
          {p.menit}
        </span>
        <span style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, fontWeight: 600, color: c.violet }}>
          Sedang dipelajari
          <Chevron size={17} color={c.violet} dir="right" />
        </span>
      </div>
    );
  }

  return (
    <div
      {...bind}
      onClick={() => bisaDiklik && onBuka?.(p.no)}
      style={{ height: 72, boxSizing: 'border-box', background: c.surface, border: `1px solid ${hover && bisaDiklik ? '#DCD3FF' : c.border}`, borderRadius: 13, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', cursor: bisaDiklik ? 'pointer' : 'default' }}
    >
      <span style={{ width: 32, flex: 'none', fontSize: 16, fontWeight: 700, color: p.status === 'selesai' ? c.violet : c.inkDisabled }}>{p.no}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 17.5, fontWeight: 700, letterSpacing: '-0.005em', color: c.ink }}>{p.judul}</span>
        <span style={{ display: 'block', marginTop: 4, fontSize: 14.5, fontWeight: 500, color: c.inkMuted }}>{p.ringkas}</span>
      </span>
      {p.jenis === 'tantangan' ? (
        <span style={{ flex: 'none', padding: '6px 12px', borderRadius: 8, background: '#FEF3E0', fontSize: 13.5, fontWeight: 600, color: c.amberInk }}>Tantangan</span>
      ) : (
        <span style={{ flex: 'none', padding: '6px 12px', borderRadius: 8, background: '#F0ECFD', fontSize: 13.5, fontWeight: 600, color: c.violet }}>Pelajari</span>
      )}
      <span style={{ width: 120, flex: 'none', display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, fontWeight: 500, color: c.inkSoft }}>
        <Clock />
        {p.menit}
      </span>
      <span style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', background: p.status === 'selesai' ? c.green : '#F1F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.status === 'selesai' ? <Check /> : <Lock size={13} width={2.2} />}</span>
    </div>
  );
}

/* peta jalur ------------------------------------------------------------- */

/** Podium isometrik. `y` = permukaan atas, `h` = tinggi sisi. */
function Podium({ cx, y, rx, ry, h }: { cx: number; y: number; rx: number; ry: number; h: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={y + h + 12} rx={rx + 9} ry={ry - 1} fill="url(#padGlow)" />
      <ellipse cx={cx} cy={y + h} rx={rx} ry={ry} fill="#C9C9D5" />
      <rect x={cx - rx} y={y} width={rx * 2} height={h} fill="url(#padSide)" />
      <ellipse cx={cx} cy={y} rx={rx} ry={ry} fill="url(#padTop)" />
    </g>
  );
}

const LencanaKunci = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke="#3E4358" strokeWidth={2.6} strokeLinecap="round">
    <rect x="-9" y="-2" width="18" height="13" rx="3.4" fill="#3E4358" stroke="none" />
    <path d="M-5 -2v-3.4a5 5 0 0 1 10 0v3.4" />
  </g>
);

const JALUR_PATH =
  'M258 200C300 230 350 245 400 258C460 275 520 285 575 300C620 320 626 356 618 386C609 420 560 440 500 447C460 452 430 456 415 462C395 486 382 520 380 560C378 601 392 628 430 648C480 672 545 662 601 660C630 690 628 730 612 762C592 795 520 808 460 806C435 805 425 808 417 820C400 846 392 876 396 910C400 946 440 972 495 983C530 990 550 986 569 985';

type LabelPeta = {
  key: string;
  left?: number;
  right?: number;
  top: number;
  judul: string[];
  menit?: string;
  sedang?: boolean;
  terkunci?: boolean;
};

const LABEL_PETA: LabelPeta[] = [
  { key: 'l1', left: 352, top: 114, judul: ['1. Mengapa Ada', 'Bilangan Negatif?'], menit: '5–7 menit' },
  { key: 'l2', left: 664, top: 255, judul: ['2. Positif, Negatif,', 'dan Nol'], menit: '5–8 menit' },
  { key: 'l3', right: 701, top: 417, judul: ['3. Menempatkan', 'Bilangan pada Garis'], menit: '6–8 menit' },
  { key: 'l4', left: 722, top: 591, judul: ['4. Mana yang', 'Lebih Besar?'], menit: '6–10 menit', sedang: true },
  { key: 'l5', right: 706, top: 765, judul: ['5. Mengenal', 'Nilai Mutlak'], menit: '6–8 menit' },
  { key: 'l6', left: 676, top: 927, judul: ['Tantangan Modul'], menit: '8–12 menit', terkunci: true },
];

const MODUL2_NODE = [
  { left: 0, width: 174, judul: ['1. Penjumlahan &', 'Pengurangan'] },
  { left: 191, width: 200, judul: ['2. Perkalian &', 'Pembagian'] },
  { left: 397, width: 200, judul: ['3. Operasi', 'Campuran'] },
  { left: 600, width: 200, judul: ['4. Masalah', 'Kontekstual'] },
  { left: 806, width: 200, judul: ['Tantangan', 'Modul'] },
];

function PetaJalur() {
  return (
    <div style={{ position: 'relative', width: 1021, height: 1551, boxSizing: 'border-box', borderRadius: 18, overflow: 'hidden', border: '1px solid #F0EEF9', background: 'linear-gradient(170deg, #F8F6FD 0%, #FBFAFE 38%, #F9F8FD 100%)' }}>
      <svg width="1021" height="1551" viewBox="0 0 1021 1551" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }}>
        <defs>
          <linearGradient id="padTop" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F0EFF6" />
          </linearGradient>
          <linearGradient id="padSide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9E9F0" />
            <stop offset="0.5" stopColor="#D6D6E0" />
            <stop offset="1" stopColor="#C6C6D3" />
          </linearGradient>
          <radialGradient id="padGlow">
            <stop offset="0" stopColor="#9C84F9" stopOpacity="0.40" />
            <stop offset="0.6" stopColor="#9C84F9" stopOpacity="0.13" />
            <stop offset="1" stopColor="#9C84F9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ribbon" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#CFC4FB" />
            <stop offset="1" stopColor="#B09DF5" />
          </linearGradient>
          <linearGradient id="leaf" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#F3F0FD" />
            <stop offset="1" stopColor="#DED6F8" />
          </linearGradient>
          <radialGradient id="mist">
            <stop offset="0" stopColor="#E9E4FA" stopOpacity="0.75" />
            <stop offset="0.6" stopColor="#EDE9FB" stopOpacity="0.35" />
            <stop offset="1" stopColor="#EDE9FB" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* latar: kabut, pohon, semak */}
        <g>
          <ellipse cx="95" cy="1012" rx="160" ry="38" fill="url(#mist)" />
          <ellipse cx="76" cy="832" rx="96" ry="20" fill="url(#mist)" />
          <ellipse cx="888" cy="222" rx="60" ry="14" fill="url(#mist)" />
          <ellipse cx="938" cy="890" rx="54" ry="13" fill="url(#mist)" />
          <g opacity="0.7">
            <path d="M886 104c14 40 26 68 36 92h-72c10-24 22-52 36-92z" fill="url(#leaf)" />
            <rect x="883" y="194" width="6" height="24" rx="3" fill="#DED7F6" />
          </g>
          <g opacity="0.58">
            <path d="M55 718c10 30 19 51 26 69H29c7-18 16-39 26-69z" fill="url(#leaf)" />
            <rect x="52" y="785" width="5" height="20" rx="2.5" fill="#DED7F6" />
          </g>
          <g opacity="0.5">
            <path d="M113 750c8 24 15 41 21 55H92c6-14 13-31 21-55z" fill="url(#leaf)" />
            <rect x="111" y="803" width="4" height="16" rx="2" fill="#DED7F6" />
          </g>
          <g opacity="0.6">
            <path d="M938 800c11 32 21 55 28 74h-56c7-19 17-42 28-74z" fill="url(#leaf)" />
            <rect x="935" y="872" width="5" height="18" rx="2.5" fill="#DED7F6" />
          </g>
          <g opacity="0.55" fill="url(#leaf)">
            <ellipse cx="131" cy="318" rx="23" ry="12" />
            <ellipse cx="112" cy="311" rx="14" ry="9" />
            <ellipse cx="66" cy="357" rx="18" ry="10" />
            <ellipse cx="278" cy="597" rx="20" ry="12" />
            <ellipse cx="201" cy="947" rx="24" ry="11" />
            <ellipse cx="905" cy="882" rx="18" ry="9" />
            <ellipse cx="925" cy="215" rx="20" ry="10" />
            <ellipse cx="852" cy="212" rx="14" ry="8" />
            <ellipse cx="56" cy="1052" rx="14" ry="7" />
            <ellipse cx="492" cy="1047" rx="16" ry="8" />
          </g>
          <path d="M197 133l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#C9BDFB" />
          <g fill="#C9BDFB" opacity="0.8">
            <ellipse cx="934" cy="1296" rx="7" ry="5" />
            <ellipse cx="946" cy="1303" rx="7" ry="5" />
            <ellipse cx="938" cy="1310" rx="6" ry="4" />
          </g>
          <g stroke="#DCD5F5" strokeWidth={2.5} strokeLinecap="round" opacity="0.7">
            <path d="M918 404h14M938 404h9" />
            <path d="M690 586h12M708 586h8" />
          </g>
        </g>

        {/* pita jalur + pola titik */}
        <path d={JALUR_PATH} fill="none" stroke="url(#ribbon)" strokeWidth={15} strokeLinecap="round" opacity="0.95" />
        <path d={JALUR_PATH} fill="none" stroke="#FFFFFF" strokeWidth={4.6} strokeLinecap="round" strokeDasharray="0.5 32" opacity="0.9" />

        {/* podium pelajaran */}
        <Podium cx={258} y={172} rx={58} ry={22} h={26} />
        <Podium cx={575} y={300} rx={62} ry={23} h={27} />
        <Podium cx={415} y={462} rx={63} ry={23} h={27} />
        <Podium cx={601} y={660} rx={77} ry={28} h={33} />
        <Podium cx={417} y={820} rx={72} ry={26} h={30} />
        <Podium cx={569} y={985} rx={61} ry={23} h={27} />

        {/* penanda status di atas podium */}
        {[
          [258, 150],
          [578, 278],
          [415, 440],
        ].map(([x, y]) => (
          <g key={`ok-${x}`} transform={`translate(${x},${y})`}>
            <circle r="21" fill="#22C55E" />
            <path d="M-8 1l6 6 10-12" fill="none" stroke="#FFFFFF" strokeWidth={3.3} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        <circle cx="415" cy="795" r="15" fill="#FDFDFE" stroke={c.inkSoft} strokeWidth={2.3} />
        <g transform="translate(569,963)" fill="none" stroke="#3E4358" strokeWidth={3} strokeLinecap="round">
          <rect x="-11" y="-3" width="22" height="16" rx="4" fill="#3E4358" stroke="none" />
          <path d="M-6 -3v-4a6 6 0 0 1 12 0v4" />
          <circle cx="0" cy="5" r="1.9" fill="#FFFFFF" stroke="none" />
        </g>

        {/* pembatas modul 2 */}
        <line x1="35" y1="1163" x2="288" y2="1163" stroke="#C4B8F5" strokeWidth={2.2} strokeDasharray="11 10" strokeLinecap="round" />
        <line x1="704" y1="1163" x2="968" y2="1163" stroke="#C4B8F5" strokeWidth={2.2} strokeDasharray="11 10" strokeLinecap="round" />
        <g transform="translate(497,1245)" fill="none" stroke="#8B74EE" strokeWidth={2.4} strokeLinecap="round">
          <rect x="-7" y="-2" width="14" height="11" rx="3" fill="#8B74EE" stroke="none" />
          <path d="M-4 -2v-3a4 4 0 0 1 8 0v3" />
        </g>

        {/* rantai podium modul 2 */}
        <g fill="none" stroke="#CFC4F7" strokeWidth={2.2} strokeDasharray="8 9" strokeLinecap="round">
          <path d="M137 1360Q190 1379 244 1360" />
          <path d="M340 1360Q394 1379 448 1360" />
          <path d="M546 1360Q599 1379 652 1360" />
          <path d="M749 1360Q802 1379 855 1360" />
        </g>
        {[88, 291, 497, 700, 906].map((x) => (
          <Podium key={`p2-${x}`} cx={x} y={1345} rx={47} ry={18} h={21} />
        ))}
        {[88, 291, 497, 700, 906].map((x) => (
          <LencanaKunci key={`k2-${x}`} x={x} y={1330} />
        ))}

        <path d="M877 566c14 10 16 26 4 36-9 8-22 6-28-2" fill="none" stroke="#C4B8F5" strokeWidth={2.6} strokeLinecap="round" />
        <path d="M851 594l4 10 9-6z" fill="#C4B8F5" />
      </svg>

      {/* Lumo berdiri di podium aktif */}
      <img src="/assets/lumo_original_head.png" alt="Lumo" style={{ position: 'absolute', left: 562, top: 586, width: 78, height: 'auto' }} />

      <span style={{ position: 'absolute', left: 29, top: 25, width: 97, height: 33, boxSizing: 'border-box', borderRadius: 11, background: c.violetChip, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, letterSpacing: '0.05em', color: c.violet }}>MODUL 1</span>
      <span style={{ position: 'absolute', left: 46, top: 60, fontSize: 25, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>Bilangan di Bawah Nol</span>

      {LABEL_PETA.map((l) => (
        <div key={l.key} style={{ position: 'absolute', left: l.left, right: l.right, top: l.top, textAlign: l.right !== undefined ? 'right' : 'left' }}>
          <div style={{ fontSize: 22, lineHeight: 1.32, fontWeight: 700, color: c.ink }}>
            {l.judul.map((baris) => (
              <span key={baris} style={{ display: 'block' }}>
                {baris}
              </span>
            ))}
          </div>
          {l.sedang && (
            <div style={{ marginTop: 10, marginLeft: -5, display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 9, height: 9, flex: 'none', borderRadius: '50%', background: c.violet }} />
              <span style={{ fontSize: 18, fontWeight: 600, color: c.violet }}>Sedang dipelajari</span>
            </div>
          )}
          {l.menit && <div style={{ marginTop: l.sedang ? 8 : 7, fontSize: 18, fontWeight: 500, color: '#9A9DB0' }}>{l.menit}</div>}
          {l.terkunci && <div style={{ marginTop: 9, fontSize: 18, fontWeight: 500, color: c.inkDisabled }}>Terkunci</div>}
        </div>
      ))}

      {/* balon "Kamu di sini!" */}
      <div style={{ position: 'absolute', left: 839, top: 484, width: 138, height: 56, boxSizing: 'border-box', background: c.surface, border: '1px solid #F2EFFC', borderRadius: 14, boxShadow: '0 6px 18px -6px rgba(84,60,190,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: c.violet }}>Kamu di sini!</span>
        <span style={{ position: 'absolute', left: 16, bottom: -7, width: 14, height: 14, background: c.surface, borderRight: '1px solid #F2EFFC', borderBottom: '1px solid #F2EFFC', transform: 'rotate(58deg) skewX(-12deg)', borderBottomRightRadius: 3 }} />
      </div>

      {/* spanduk modul 2 */}
      <div style={{ position: 'absolute', left: 294, top: 1113, width: 404, height: 102, boxSizing: 'border-box', borderRadius: 20, background: 'linear-gradient(180deg, #F5F2FD 0%, #F1EDFB 100%)', paddingTop: 28, textAlign: 'center' }}>
        <span style={{ position: 'absolute', left: 145, top: -14, width: 116, height: 31, boxSizing: 'border-box', borderRadius: 10, background: '#EAE5FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, letterSpacing: '0.05em', color: c.violet }}>MODUL 2</span>
        <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>Bergerak dengan Bilangan Bulat</div>
        <div style={{ marginTop: 9, fontSize: 18, fontWeight: 500, color: c.inkMuted }}>Selesaikan Modul 1 untuk membuka.</div>
      </div>

      {MODUL2_NODE.map((n) => (
        <div key={n.left} style={{ position: 'absolute', left: n.left, top: 1412, width: n.width, textAlign: 'center' }}>
          <div style={{ fontSize: 17, lineHeight: 1.45, fontWeight: 700, color: c.ink }}>
            {n.judul.map((baris) => (
              <span key={baris} style={{ display: 'block' }}>
                {baris}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 9, fontSize: 16, fontWeight: 500, color: c.inkDisabled }}>Terkunci</div>
        </div>
      ))}
    </div>
  );
}

/* panel samping ---------------------------------------------------------- */

const panelStyle: CSSProperties = {
  background: c.surface,
  border: `1px solid ${c.border}`,
  borderRadius: 18,
  boxShadow: depth.panelFlat,
  padding: 24,
  boxSizing: 'border-box',
};

const KONSEP: { nama: string; titik: string[] }[] = [
  { nama: 'Positif, negatif, dan nol', titik: [c.green, c.green, c.green, '#E6E7EC', '#E6E7EC'] },
  { nama: 'Garis bilangan', titik: [c.green, c.green, c.green, '#E6E7EC', '#E6E7EC'] },
  { nama: 'Membandingkan bilangan', titik: [c.violet, '#9C8CF3', '#E6E7EC', '#E6E7EC', '#E6E7EC'] },
  { nama: 'Nilai mutlak', titik: ['#E6E7EC', '#E6E7EC', '#E6E7EC', '#E6E7EC', '#E6E7EC'] },
];

export function BilanganBulat({
  tampilan = 'jalur',
  progressJalur = 45,
  progressModul = 55,
  onBukaPelajaran,
}: {
  tampilan?: 'jalur' | 'daftar';
  progressJalur?: number;
  progressModul?: number;
  onBukaPelajaran?: (no: string) => void;
}) {
  const [mode, setMode] = useState<'jalur' | 'daftar'>(tampilan);
  const jalur = clamp(progressJalur);
  const modul = clamp(progressModul);
  const modeJalur = mode === 'jalur';

  const tab = (key: 'jalur' | 'daftar', label: string, ikon: (warna: string) => ReactNode) => {
    const on = mode === key;
    const warna = on ? '#FFFFFF' : c.inkSoft;
    return (
      <span
        onClick={() => setMode(key)}
        style={{ height: 44, boxSizing: 'border-box', borderRadius: 11, background: on ? c.violet : 'transparent', boxShadow: on ? '0 3px 0 #5B44CE' : 'none', display: 'flex', alignItems: 'center', gap: 11, padding: '0 21px', cursor: 'pointer' }}
      >
        {ikon(warna)}
        <span style={{ fontSize: 16, fontWeight: 600, color: warna }}>{label}</span>
      </span>
    );
  };

  return (
    <div data-screen-label="Bilangan Bulat" style={shell}>
      <TopBar aktif="Belajar" />

      <main style={{ width: CANVAS, boxSizing: 'border-box', padding: '30px 64px 56px 56px' }}>
        {/* remah roti + pemindah tampilan */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 38, height: 38, flex: 'none', boxSizing: 'border-box', borderRadius: '50%', background: c.surface, border: `1px solid ${c.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.inkSoft} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10.4 12 4l8 6.4V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19Z" />
              </svg>
            </span>
            <span style={{ fontSize: 15.5, fontWeight: 500, color: c.violet }}>Belajar</span>
            <Chevron size={15} color="#B9BCCB" dir="right" />
            <span style={{ fontSize: 15.5, fontWeight: 500, color: c.violet }}>Matematika SMP Kelas VII</span>
            <Chevron size={15} color="#B9BCCB" dir="right" />
            <span style={{ fontSize: 15.5, fontWeight: 700, color: c.violet }}>Bilangan Bulat</span>
          </div>

          <div style={{ flex: 'none', boxSizing: 'border-box', background: c.surface, border: `1px solid ${c.borderSoft}`, borderRadius: 15, boxShadow: depth.panel, padding: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            {tab('jalur', 'Jalur', (warna) => (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={warna} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="7" r="2.6" />
                <circle cx="6" cy="17.5" r="2.6" />
                <circle cx="18.5" cy="12.2" r="2.6" />
                <path d="M8.4 8.2 16.2 11M8.4 16.2 16.2 13.6" />
              </svg>
            ))}
            {tab('daftar', 'Daftar', (warna) => (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={warna} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6.5h16M4 12h16M4 17.5h16" />
              </svg>
            ))}
          </div>
        </div>

        {/* kepala course */}
        <div style={{ marginTop: 26, display: 'flex', alignItems: 'flex-start', gap: 40 }}>
          <span style={{ width: 92, height: 92, flex: 'none', borderRadius: 22, background: c.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={c.violet} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12.6h2.4l2.7 6.6L12.4 5h5.2" />
              <path d="M13.6 11.4 18.4 17M18.4 11.4 13.6 17" />
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.12, fontWeight: 800, letterSpacing: '-0.022em', color: c.ink }}>Bilangan Bulat</h1>
            <p style={{ margin: '12px 0 0', maxWidth: 640, fontSize: 16.5, lineHeight: 1.5, fontWeight: 500, color: c.inkMuted }}>Memahami bilangan bulat dan menggunakannya dalam berbagai situasi kehidupan.</p>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 36 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, fontWeight: 600, color: '#3A3F58' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c.violet} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2.6" />
                  <path d="M12 8.6v6.8M8.6 12h6.8" />
                </svg>
                2 Modul
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, fontWeight: 600, color: '#3A3F58' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c.violet} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3.5" y="5" width="17" height="14" rx="2.4" />
                  <path d="M8.6 5v14" />
                  <path d="M11.6 9.4h5.6M11.6 13.4h5.6" />
                </svg>
                10–12 Pelajaran
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, fontWeight: 600, color: '#3A3F58' }}>
                <Clock size={19} color={c.violet} />
                60–90 menit
              </span>
            </div>
          </div>

          {modeJalur && (
            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 22, paddingTop: 8 }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: c.inkFaint }}>Progress keseluruhan</span>
                <span style={{ display: 'block', marginTop: 10, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: c.ink }}>{jalur}%</span>
              </div>
              <svg width="96" height="96" viewBox="0 0 96 96" style={{ flex: 'none', transform: 'rotate(-90deg)' }}>
                <circle cx="48" cy="48" r="39" fill="none" stroke="#E7E2F8" strokeWidth={11} />
                <circle cx="48" cy="48" r="39" fill="none" stroke={c.violet} strokeWidth={11} strokeLinecap="round" strokeDasharray={dash(jalur, 39)} />
              </svg>
            </div>
          )}

          <div style={{ flex: 'none', marginLeft: 10, paddingTop: 22 }}>
            <span style={{ display: 'flex', width: 248, height: 60, boxSizing: 'border-box', borderRadius: 16, background: gradPrimary, boxShadow: depth.primary, alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 28px', cursor: 'pointer' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>Lanjutkan belajar</span>
              <Arrow size={20} />
            </span>
          </div>
        </div>

        <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: '1021px 369px', gap: 26, alignItems: 'start' }}>
          {modeJalur ? (
            <PetaJalur />
          ) : (
            <div style={{ width: 1021, boxSizing: 'border-box' }}>
              <div style={{ ...panelStyle, padding: '18px 20px 20px' }}>
                <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 20, padding: '0 4px' }}>
                  <span style={{ padding: '7px 13px', borderRadius: 9, background: c.violetChip, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: c.violet }}>MODUL 1</span>
                  <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>Bilangan di Bawah Nol</span>
                  <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 700, color: c.ink }}>{modul}%</span>
                  <Chevron size={20} dir="up" />
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PELAJARAN.map((p) => (
                    <BarisPelajaran key={p.no} p={p} onBuka={onBukaPelajaran} />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16, height: 74, boxSizing: 'border-box', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, boxShadow: depth.panelFlat, display: 'flex', alignItems: 'center', gap: 20, padding: '0 24px', cursor: 'pointer' }}>
                <span style={{ padding: '7px 13px', borderRadius: 9, background: c.violetChip, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: c.violet }}>MODUL 2</span>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>Bergerak dengan Bilangan Bulat</span>
                <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 700, color: c.inkFaint }}>0%</span>
                <Lock size={17} width={2} />
                <Chevron size={20} />
              </div>
            </div>
          )}

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
            {!modeJalur && (
              <section style={panelStyle}>
                <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>Progress modul ini</h2>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 26 }}>
                  <span style={{ position: 'relative', width: 84, height: 84, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="84" height="84" viewBox="0 0 84 84" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx="42" cy="42" r="35" fill="none" stroke="#EDE9FB" strokeWidth={9} />
                      <circle cx="42" cy="42" r="35" fill="none" stroke={c.violet} strokeWidth={9} strokeLinecap="round" strokeDasharray={dash(modul, 35)} />
                    </svg>
                    <span style={{ position: 'relative', fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: c.ink }}>{modul}%</span>
                  </span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: c.ink }}>5 / 9</div>
                    <div style={{ marginTop: 5, fontSize: 15, fontWeight: 500, color: c.inkFaint }}>pelajaran selesai</div>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 9, fontSize: 15.5, fontWeight: 600, color: c.violet, cursor: 'pointer' }}>
                  Lihat detail
                  <Chevron size={16} color={c.violet} dir="right" />
                </div>
              </section>
            )}

            <section style={panelStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 11, background: c.violetChip, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="13" width="4" height="7" rx="1.5" fill={c.violet} />
                    <rect x="10" y="9" width="4" height="11" rx="1.5" fill={c.violet} />
                    <rect x="16" y="5" width="4" height="15" rx="1.5" fill={c.violet} />
                  </svg>
                </span>
                <span style={{ fontSize: 16.5, fontWeight: 700, color: c.ink }}>Pelajaran saat ini</span>
              </div>
              <h3 style={{ margin: '22px 0 0', fontSize: 18.5, lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>4. Mana yang Lebih Besar?</h3>
              <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.55, fontWeight: 500, color: c.inkMuted }}>Membandingkan bilangan bulat menggunakan garis bilangan.</p>

              {modeJalur ? (
                <div style={{ marginTop: 22, height: 54, boxSizing: 'border-box', borderRadius: 13, background: gradPrimary, boxShadow: depth.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
                  <span style={{ fontSize: 16.5, fontWeight: 700, color: '#FFFFFF' }}>Lanjutkan</span>
                  <svg style={{ position: 'absolute', right: 22 }} width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M8 5.5 18.5 12 8 18.5Z" />
                  </svg>
                </div>
              ) : (
                <div style={{ marginTop: 22, height: 54, boxSizing: 'border-box', borderRadius: 13, background: '#F5F1FE', border: `1.5px solid ${c.violetBorder}`, boxShadow: depth.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
                  <span style={{ fontSize: 16.5, fontWeight: 700, color: c.violet }}>Lanjutkan belajar</span>
                  <svg style={{ position: 'absolute', right: 22 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.violet} strokeWidth={2}>
                    <path d="M8.5 5.8 18 12l-9.5 6.2Z" />
                  </svg>
                </div>
              )}
            </section>

            {modeJalur && (
              <section style={panelStyle}>
                <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>Progress modul ini</h2>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: c.ink }}>{modul}%</span>
                  <span style={{ flex: 1, height: 10, borderRadius: 5, background: '#EDEBF7', overflow: 'hidden', display: 'block' }}>
                    <span style={{ display: 'block', width: `${modul}%`, height: '100%', borderRadius: 5, background: c.violet }} />
                  </span>
                </div>
                <p style={{ margin: '18px 0 0', fontSize: 15, fontWeight: 500, color: c.inkFaint }}>
                  <span style={{ fontWeight: 700, color: c.ink }}>5 / 9</span> pelajaran selesai
                </p>
              </section>
            )}

            <section style={panelStyle}>
              <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em', color: c.ink }}>Konsep yang akan dikuasai</h2>
              <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
                {KONSEP.map((k) => (
                  <div key={k.nama} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: c.inkSoft }}>{k.nama}</span>
                    <span style={{ display: 'flex', gap: 6, flex: 'none' }}>
                      {k.titik.map((warna, i) => (
                        <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: warna }} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {modeJalur ? (
              <section style={{ background: '#F2EEFD', borderRadius: 18, padding: 22, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <span style={{ width: 46, height: 46, flex: 'none', borderRadius: 13, background: '#E3DAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bookmark size={21} color={c.violet} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: c.ink }}>Simpan progresmu!</div>
                  <p style={{ margin: '9px 0 0', fontSize: 15, lineHeight: 1.55, fontWeight: 500, color: c.inkMuted }}>Kamu bisa lanjut kapan saja dari pelajaran terakhir.</p>
                </div>
              </section>
            ) : (
              <section style={{ background: '#FEF7E7', border: '1px solid #F7E3AF', borderRadius: 18, padding: 22, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                  <svg width="42" height="42" viewBox="0 0 32 32" fill="none" style={{ flex: 'none' }}>
                    <path d="M16 4.5a7.5 7.5 0 0 0-4.3 13.6c.7.5 1.1 1.2 1.1 2v.4h6.4v-.4c0-.8.4-1.5 1.1-2A7.5 7.5 0 0 0 16 4.5Z" fill="#FFC94D" />
                    <path d="M12.8 22.4h6.4v1.7a1.6 1.6 0 0 1-1.6 1.6h-3.2a1.6 1.6 0 0 1-1.6-1.6Z" fill="#E89E1B" />
                    <path d="M14.6 27.4h2.8" stroke="#E89E1B" strokeWidth={1.8} strokeLinecap="round" />
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16.5, fontWeight: 700, color: c.ink }}>Butuh latihan tambahan?</div>
                    <p style={{ margin: '9px 0 0', fontSize: 15, lineHeight: 1.55, fontWeight: 500, color: c.inkMuted }}>Kerjakan latihan singkat harian untuk memperkuat pemahamanmu.</p>
                  </div>
                </div>
                <div style={{ marginTop: 20, height: 54, boxSizing: 'border-box', borderRadius: 14, background: gradAmber, border: '1.5px solid #F3C55A', boxShadow: depth.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
                  <span style={{ fontSize: 16.5, fontWeight: 700, color: '#E08A12' }}>Ke latihan harian</span>
                  <span style={{ position: 'absolute', right: 20, display: 'flex' }}>
                    <Arrow size={19} color="#E08A12" />
                  </span>
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ==================================================== pemindah layar (demo) */

export default function LumeraJelajah() {
  const [layar, setLayar] = useState<'belajar' | 'course'>('belajar');

  return (
    <div style={{ background: c.page, minHeight: '100vh', fontFamily: font }}>
      <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 50, display: 'flex', gap: 8, background: c.surface, border: `1px solid ${c.borderSoft}`, borderRadius: 15, boxShadow: '0 10px 30px -12px rgba(27,27,47,0.28)', padding: 5 }}>
        {(
          [
            ['belajar', 'Belajar'],
            ['course', 'Bilangan Bulat'],
          ] as const
        ).map(([key, label]) => {
          const on = layar === key;
          return (
            <button
              key={key}
              onClick={() => setLayar(key)}
              style={{ height: 40, padding: '0 18px', border: 'none', borderRadius: 11, background: on ? c.violet : 'transparent', boxShadow: on ? '0 3px 0 #5B44CE' : 'none', color: on ? '#FFFFFF' : c.inkSoft, fontFamily: font, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {layar === 'belajar' ? <Belajar onBukaCourse={() => setLayar('course')} /> : <BilanganBulat />}
    </div>
  );
}
