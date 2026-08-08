import type { CSSProperties, ReactNode } from 'react';
import { color, radius, shadow, spacing, typography } from '../design/tokens';
import { Lumo } from '../design/Lumo';
import { semuaModul } from '../shell/registry';
import { pilihUsulan } from '../progress/suggestions';
import { sapaanWaktu } from './harian';
import type { Siswa } from '../progress/store';

/**
 * Beranda — versi rapi mengikuti mockup terbaru (docs/image_sample).
 * Perubahan visual dari versi sebelumnya:
 *  - Titik kekuatan → pil 12×8 (bukan dot bulat)
 *  - Kartu "Jalur belajarmu" bergaya keycap 3D
 *  - Kartu jalur yang belum siap memakai lencana "Segera hadir" / "Dalam pengembangan"
 *  - Ikon mapel & item pakai SVG inline (radikal, labu, laptop, garis bilangan, dst.)
 *  - Sub-judul banner diberi bullet radio
 *
 * Konten kartu Refresh/Jalur/Baru-disimpan masih placeholder mengikuti mockup.
 * Idealnya ditarik dari data mastery/registry (lihat harian.ts) saat sudah terinstrumentasi.
 */
export function Beranda({
  siswa,
  onMulai,
  onBukaPetaIlmu,
  onBukaBelajar,
}: {
  siswa: Siswa;
  onMulai: (moduleId: string) => void;
  onBukaPetaIlmu: () => void;
  onBukaBelajar: () => void;
}) {
  const modul = semuaModul().map((m) => ({
    id: m.id,
    judul: m.judul,
    subjectWorldId: m.subjectWorldId,
  }));

  const usulan = pilihUsulan(modul, siswa, 5);
  const utama = usulan[0];
  const terlemah = usulan.find((u) => u.masteryPersen !== null && u.alasan === 'ulang');
  const idRefresh = terlemah?.moduleId ?? utama?.moduleId;

  const jam = new Date().getHours();

  const refresh: KartuRefresh[] = [
    { title: 'Positif, Negatif, dan Nol', status: 'Kuat', terisi: 3, warna: color.kuat, ikon: <IkKalender />, ikonBg: '#DFEAFE' },
    { title: 'Garis Bilangan', status: 'Stabil', terisi: 3, warna: color.stabil, ikon: <IkTarget />, ikonBg: '#FDEADF' },
    { title: 'Nilai Mutlak', status: 'Mulai pudar', terisi: 2, warna: color.pudar, ikon: <IkBatang />, ikonBg: '#EDE8FD' },
    { title: 'Penjumlahan Bilangan Bulat', status: 'Perlu diulangi', terisi: 2, warna: color.lemah, ikon: <IkBintang />, ikonBg: '#FEF7DF' },
  ];

  const jalur: KartuJalur[] = [
    { title: 'Matematika', sub: 'SMP Kelas VII', ikon: <IkAkar />, ikonBg: '#F1EBFE', bawah: { jenis: 'progres', persen: 45, warna: color.violet } },
    { title: 'IPA', sub: 'SMP Kelas VII', ikon: <IkLabu />, ikonBg: '#DCF0E1', bawah: { jenis: 'lencana', teks: 'Segera hadir', bg: '#EDEEF2', fg: '#6B6F85' } },
    { title: 'Informatika', sub: 'SMP Kelas VII', ikon: <IkLaptop />, ikonBg: '#DFEAFB', bawah: { jenis: 'lencana', teks: 'Dalam pengembangan', bg: '#E3EDFC', fg: '#3F7BE8' } },
  ];

  const disimpan: KartuDisimpan[] = [
    { title: 'Cara Membaca Garis Bilangan', course: 'Bilangan Bulat', time: '2 jam lalu', ikon: <IkGarisBilangan />, ikonBg: '#E3EAFB' },
    { title: 'Aturan Membandingkan Bilangan Negatif', course: 'Bilangan Bulat', time: 'Kemarin', ikon: <IkChevron2 />, ikonBg: '#FBE7CC', wrap: true },
    { title: 'Contoh Perubahan Suhu', course: 'Bilangan Bulat', time: '2 hari lalu', ikon: <IkTermometer />, ikonBg: '#DCF1E2' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: color.ivory, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '82rem', margin: '0 auto', padding: '1.25rem 1.5rem 0', boxSizing: 'border-box' }}>
        <Sapaan jam={jam} adaLanjutan={Boolean(utama)} />
      </div>

      <main
        style={{
          maxWidth: '82rem',
          margin: '0 auto',
          padding: '1rem 1.5rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '1.25rem',
          alignItems: 'start',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Kolom utama ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          {/* Banner Lanjutkan Belajar + Lumo peeking */}
          <div style={{ position: 'relative', marginTop: '0.75rem' }}>
            <div
              style={{
                position: 'absolute',
                top: '-42px',
                right: '48px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
              }}
            >
              <Lumo size={76} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))' }} />
              <div
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${color.border}`,
                  borderRadius: '14px',
                  boxShadow: shadow.lifted,
                  padding: '7px 14px',
                  fontFamily: typography.fontFamilyUI,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: color.ink,
                  whiteSpace: 'nowrap',
                  marginBottom: '14px',
                }}
              >
                Kamu bisa hari ini! 💪
              </div>
            </div>

            {utama ? (
              <KartuLanjutkan
                judul={utama.judul}
                dunia={utama.subjectWorldNama}
                masteryPersen={utama.masteryPersen}
                onLanjut={() => onMulai(utama.moduleId)}
              />
            ) : (
              <Kartu style={{ padding: '1.25rem' }}>
                <p style={{ ...teksTubuh, margin: 0 }}>
                  Belum ada pelajaran terdaftar. Tambahkan modul untuk mulai belajar.
                </p>
              </Kartu>
            )}
          </div>

          {/* Daily Refresh */}
          <Kartu style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.xs }}>
              <div>
                <h2 style={{ ...judulKartu, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Daily Refresh
                  <span
                    title="Segarkan kembali konsep sebelum mulai terlupakan"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: `1.4px solid ${color.inkFaint}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: color.inkFaint,
                      cursor: 'help',
                    }}
                  >
                    i
                  </span>
                </h2>
                <p style={{ ...teksTubuh, fontSize: '0.82rem', margin: '4px 0 0' }}>
                  Segarkan kembali konsep sebelum mulai terlupakan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => idRefresh && onMulai(idRefresh)}
                style={{
                  background: '#FCFBFF',
                  border: '1.5px solid #C9BDFB',
                  borderRadius: '24px',
                  boxShadow: '0 6px 0 #DFD7FC',
                  padding: '0 20px',
                  height: '44px',
                  fontFamily: typography.fontFamilyUI,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: color.violet,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color.violet} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 5.5 18.5 12 8 18.5Z" />
                </svg>
                Mulai Refresh
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              {refresh.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => idRefresh && onMulai(idRefresh)}
                  style={{
                    minHeight: '9.75rem',
                    boxSizing: 'border-box',
                    background: '#FFFFFF',
                    border: '1px solid #F0F0F5',
                    borderRadius: '16px',
                    boxShadow: '0 10px 0 0 rgba(142,142,197,0.33)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: item.ikonBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                    }}
                  >
                    {item.ikon}
                  </span>
                  <h3
                    style={{
                      margin: '16px 0 0',
                      fontFamily: typography.fontFamilyUI,
                      fontSize: '0.9rem',
                      lineHeight: 1.35,
                      fontWeight: 700,
                      color: color.ink,
                    }}
                  >
                    {item.title}
                  </h3>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap', color: color.inkMuted }}>
                      {item.status}
                    </span>
                    <Pil terisi={item.terisi} warna={item.warna} />
                  </div>
                </div>
              ))}
            </div>
          </Kartu>

          {/* Jalur belajarmu */}
          <Kartu style={{ padding: '1.1rem 1.25rem 1.5rem' }}>
            <BarisJudul
              judul="Jalur belajarmu"
              aksi={<TombolTeks onClick={onBukaBelajar}>Lihat semua ›</TombolTeks>}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginTop: '1.15rem' }}>
              {jalur.map((j, idx) => (
                <div
                  key={idx}
                  onClick={onBukaPetaIlmu}
                  style={{
                    position: 'relative',
                    boxSizing: 'border-box',
                    padding: '4px 3px 13px',
                    borderRadius: '20px',
                    border: '1px solid #6A4FE0',
                    background: 'linear-gradient(180deg, #A895F8 0%, #8B75F2 20%, #7458EA 58%, #5B41CE 100%)',
                    boxShadow:
                      'inset 0 2px 0 0 rgba(255,255,255,0.42), inset 0 -2px 0 0 rgba(46,26,116,0.30), 0 9px 16px -7px rgba(84,60,200,0.45)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '15px',
                      boxSizing: 'border-box',
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #F9F8FE 100%)',
                      boxShadow: '0 2px 4px rgba(58,38,140,0.18), inset 0 1px 0 0 #FFFFFF',
                      padding: '15px 11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <span
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          background: j.ikonBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: 'none',
                        }}
                      >
                        {j.ikon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: typography.fontFamilyUI, fontSize: '0.9rem', fontWeight: 700, color: color.ink }}>
                          {j.title}
                        </div>
                        <div style={{ marginTop: '3px', fontFamily: typography.fontFamilyUI, fontSize: '0.82rem', fontWeight: 500, color: color.inkMuted }}>
                          {j.sub}
                        </div>
                      </div>
                      <span style={{ marginTop: '14px', flex: 'none' }}>
                        <IkChevronKanan warna="#A8ABBC" />
                      </span>
                    </div>

                    {j.bawah.jenis === 'progres' ? (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: typography.fontFamilyUI, fontSize: '0.82rem', fontWeight: 700, color: color.ink }}>
                          {j.bawah.persen}%
                        </span>
                        <BarProgres persen={j.bawah.persen} warna={j.bawah.warna} />
                      </div>
                    ) : (
                      <div style={{ marginTop: '14px', paddingLeft: '66px' }}>
                        <Lencana teks={j.bawah.teks} bg={j.bawah.bg} fg={j.bawah.fg} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Kartu>
        </div>

        {/* ── Rail kanan ──────────────────────────────────────────── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          {/* Target hari ini */}
          <Kartu style={{ padding: '1.25rem' }}>
            <h2 style={{ ...judulKartu, fontSize: '1.05rem' }}>Target hari ini</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginTop: '0.9rem' }}>
              <UbinTarget ikon={<IkJam />} nilai={<>20 <span style={{ fontSize: '0.72rem', fontWeight: 500, color: color.inkMuted }}>menit</span></>} label="Waktu belajar" />
              <UbinTarget ikon={<IkCentang />} nilai="3 / 5" label="Aktivitas selesai" />
            </div>

            {/* Streak */}
            <div
              style={{
                marginTop: '0.9rem',
                background: '#FFFFFF',
                border: `1px solid ${color.border}`,
                borderRadius: '14px',
                padding: '0.9rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IkApi />
                <div>
                  <div style={{ fontFamily: typography.fontFamilyUI, fontSize: '0.85rem', fontWeight: 800, color: color.ink, lineHeight: 1.1 }}>
                    7 <span style={{ fontWeight: 500, color: color.inkMuted }}>hari</span>
                  </div>
                  <div style={{ marginTop: '2px', fontFamily: typography.fontFamilyUI, fontSize: '0.78rem', fontWeight: 500, color: color.inkMuted }}>
                    konsisten!
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((hari, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#7B7F94' }}>{hari}</span>
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: i < 6 ? '#F97316' : '#E6E7EC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {i < 6 && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12.5 10 17.5 19 7.5" />
                        </svg>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Kartu>

          {/* Rekomendasi Lumo */}
          <div
            style={{
              background: color.amberSoft,
              border: `1px solid ${color.amberBorder}`,
              borderRadius: '20px',
              padding: '1.25rem',
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ ...judulKartu, fontSize: '1.05rem' }}>Rekomendasi Lumo</h2>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Lumo size={64} />
              <p style={{ margin: 0, fontFamily: typography.fontFamilyUI, fontSize: '0.85rem', lineHeight: 1.55, fontWeight: 500, color: '#2A2F45' }}>
                Kamu masih sedikit ragu saat membandingkan <strong>−8</strong> dan <strong>−3</strong>. Coba latihan singkat selama 3 menit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => utama && onMulai(utama.moduleId)}
              style={{
                marginTop: '1.15rem',
                width: '100%',
                height: '54px',
                position: 'relative',
                background: 'linear-gradient(180deg, #FDF2CE 0%, #FCE49B 100%)',
                border: '1.5px solid #F3C55A',
                borderRadius: '16px',
                boxShadow: '0 6px 0 #EFBB3E',
                fontFamily: typography.fontFamilyUI,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#EE6B1A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Coba sekarang
              <svg style={{ position: 'absolute', right: '20px' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EE6B1A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h15" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          {/* Baru disimpan */}
          <Kartu style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ ...judulKartu, fontSize: '1.05rem' }}>Baru disimpan</h2>
              <TombolTeks onClick={onBukaBelajar}>Lihat semua ›</TombolTeks>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', marginTop: '1rem' }}>
              {disimpan.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: item.ikonBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                    }}
                  >
                    {item.ikon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: typography.fontFamilyUI,
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: color.ink,
                        lineHeight: 1.3,
                        ...(item.wrap
                          ? {}
                          : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ marginTop: '3px', fontFamily: typography.fontFamilyUI, fontSize: '0.82rem', fontWeight: 500, color: color.inkFaint }}>
                      {item.course}
                    </div>
                  </div>
                  <span style={{ fontFamily: typography.fontFamilyUI, fontSize: '0.78rem', fontWeight: 500, color: color.inkFaint, flex: 'none' }}>
                    {item.time}
                  </span>
                  <IkKebab />
                </div>
              ))}
            </div>
          </Kartu>
        </aside>
      </main>
    </div>
  );
}

/* ── Tipe konten kartu ────────────────────────────────────────── */

interface KartuRefresh {
  title: string;
  status: string;
  terisi: number;
  warna: string;
  ikon: ReactNode;
  ikonBg: string;
}
type BawahJalur =
  | { jenis: 'progres'; persen: number; warna: string }
  | { jenis: 'lencana'; teks: string; bg: string; fg: string };
interface KartuJalur {
  title: string;
  sub: string;
  ikon: ReactNode;
  ikonBg: string;
  bawah: BawahJalur;
}
interface KartuDisimpan {
  title: string;
  course: string;
  time: string;
  ikon: ReactNode;
  ikonBg: string;
  wrap?: boolean;
}

/* ── Sapaan & banner ──────────────────────────────────────────── */

function Sapaan({ jam, adaLanjutan }: { jam: number; adaLanjutan: boolean }) {
  return (
    <div>
      <h1
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: '1.85rem',
          fontWeight: typography.weight.extrabold,
          color: color.ink,
          letterSpacing: '-0.02em',
          margin: 0,
        }}
      >
        {sapaanWaktu(jam)}, Ardi <span aria-hidden>👋</span>
      </h1>
      <p style={{ ...teksTubuh, margin: '4px 0 0', fontSize: '0.9rem' }}>
        {adaLanjutan
          ? 'Mau lanjut belajar atau menyegarkan ingatanmu?'
          : 'Belum ada pelajaran yang siap dibuka.'}
      </p>
    </div>
  );
}

function KartuLanjutkan({
  judul,
  dunia,
  masteryPersen,
  onLanjut,
}: {
  judul: string;
  dunia: string;
  masteryPersen: number | null;
  onLanjut: () => void;
}) {
  const persen = masteryPersen ?? 45;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${color.border}`,
        borderRadius: '24px',
        boxShadow: shadow.lifted,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '232px 1fr',
        minHeight: '12.5rem',
      }}
    >
      <div
        aria-hidden
        style={{
          background: '#F1ECFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.75rem',
          overflow: 'hidden',
        }}
      >
        <img src="/assets/math_banner.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span
          style={{
            fontFamily: typography.fontFamilyUI,
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: color.violet,
          }}
        >
          LANJUTKAN BELAJAR
        </span>

        <h2
          style={{
            fontFamily: typography.fontFamilyUI,
            fontSize: '1.6rem',
            fontWeight: 800,
            color: color.ink,
            margin: '6px 0 0',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {judul}
        </h2>

        {/* sub-judul dengan bullet radio */}
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '9px' }}>
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#E4DDFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color.violet }} />
          </span>
          <span style={{ fontFamily: typography.fontFamilyUI, fontSize: '0.95rem', fontWeight: 500, color: '#4B5169' }}>{dunia}</span>
        </span>

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: spacing.lg }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: typography.fontFamilyUI, fontSize: '0.85rem', color: color.inkMuted }}>
              {persen}% selesai • sekitar 4 menit lagi
            </span>
            <div style={{ marginTop: '8px' }}>
              <BarProgres persen={persen} warna="#7C5CFC" />
            </div>
          </div>

          <button
            type="button"
            onClick={onLanjut}
            style={{
              height: '52px',
              background: 'linear-gradient(180deg, #8E7BF7 0%, #7458EE 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '27px',
              padding: '0 26px',
              fontFamily: typography.fontFamilyUI,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 7px 0 #5B44CE, 0 14px 24px rgba(109,90,230,0.28)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap',
            }}
          >
            Lanjutkan
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h15" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Primitif kecil ───────────────────────────────────────────── */

const judulKartu: CSSProperties = {
  fontFamily: typography.fontFamilyUI,
  fontSize: '0.9rem',
  fontWeight: typography.weight.bold,
  color: color.ink,
  margin: 0,
};

const teksTubuh: CSSProperties = {
  fontFamily: typography.fontFamilyUI,
  fontSize: '0.75rem',
  color: color.inkMuted,
  lineHeight: 1.4,
};

function Kartu({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section
      style={{
        background: color.surface,
        border: `1px solid ${color.border}`,
        borderRadius: radius.lg,
        boxShadow: shadow.soft,
        padding: spacing.md,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function BarisJudul({ judul, deskripsi, aksi }: { judul: string; deskripsi?: string; aksi?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ ...judulKartu, fontSize: '1.05rem' }}>{judul}</h2>
        {deskripsi && <p style={{ ...teksTubuh, margin: `${spacing.xs} 0 0` }}>{deskripsi}</p>}
      </div>
      {aksi}
    </div>
  );
}

function TombolTeks({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        fontFamily: typography.fontFamilyUI,
        fontSize: typography.size.sm,
        fontWeight: typography.weight.bold,
        color: color.violet,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function BarProgres({ persen, warna }: { persen: number; warna: string }) {
  const nilai = Math.max(0, Math.min(100, persen));
  return (
    <div
      role="progressbar"
      aria-valuenow={nilai}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ flex: 1, height: '0.5rem', background: '#ECEDF2', borderRadius: radius.pill, overflow: 'hidden' }}
    >
      <div style={{ width: `${nilai}%`, height: '100%', background: warna, borderRadius: radius.pill }} />
    </div>
  );
}

function Pil({ terisi, warna }: { terisi: number; warna: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: '3px', marginLeft: 'auto', flex: 'none' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ width: '12px', height: '8px', borderRadius: '4px', background: i < terisi ? warna : '#E6E7EC' }} />
      ))}
    </span>
  );
}

function Lencana({ teks, bg, fg }: { teks: string; bg: string; fg: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 13px',
        borderRadius: '9px',
        background: bg,
        fontFamily: typography.fontFamilyUI,
        fontSize: '0.8rem',
        fontWeight: 600,
        color: fg,
      }}
    >
      {teks}
    </span>
  );
}

function UbinTarget({ ikon, nilai, label }: { ikon: ReactNode; nilai: ReactNode; label: string }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        background: '#FFFFFF',
        border: `1px solid ${color.border}`,
        borderRadius: '14px',
        padding: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <span style={{ flex: 'none', display: 'flex' }}>{ikon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: typography.fontFamilyUI, fontSize: '1.15rem', fontWeight: 800, color: color.ink, lineHeight: 1.1 }}>{nilai}</div>
        <div style={{ marginTop: '4px', fontFamily: typography.fontFamilyUI, fontSize: '0.78rem', fontWeight: 500, color: color.inkMuted }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Ikon SVG ─────────────────────────────────────────────────── */

function IkKalender() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={1.9} strokeLinecap="round">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3.5v3M16 3.5v3" />
      <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.8h2M11 16.8h2" />
    </svg>
  );
}
function IkTarget() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#F97316" />
      <circle cx="12" cy="12" r="5.4" fill="none" stroke="#FDEADF" strokeWidth={2.4} />
      <circle cx="12" cy="12" r="2" fill="#FDEADF" />
      <path d="M12.6 11.4 20 4" stroke="#FDEADF" strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}
function IkBatang() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="13" width="4" height="7" rx="1.6" fill="#8B5CF6" />
      <rect x="10" y="9.5" width="4" height="10.5" rx="1.6" fill="#8B5CF6" />
      <rect x="16" y="5.5" width="4" height="14.5" rx="1.6" fill="#8B5CF6" />
    </svg>
  );
}
function IkBintang() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="#F5A623">
      <path d="M12 3.4l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.7l6-.8Z" />
    </svg>
  );
}
function IkAkar() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#6D5AE6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12.5 L5.2 12.5 L8.2 19 L11.8 5.5 L21 5.5" />
      <path d="M13 10.8 L17.3 16.4M17.3 10.8 L13 16.4" />
    </svg>
  );
}
function IkLabu() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#22A45D" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.2 3.6 H14.8" />
      <path d="M10 3.6 V9.3 L5.4 17.4 C4.6 19.2 5.9 21 8 21 H16 C18.1 21 19.4 19.2 18.6 17.4 L14 9.3 V3.6" />
      <path d="M7.5 15 H16.5" />
    </svg>
  );
}
function IkLaptop() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <rect x="4.8" y="5.2" width="14.4" height="9.6" rx="1.8" fill="#4B7BEC" />
      <rect x="6.6" y="7" width="10.8" height="6" rx="0.8" fill="#DCE7FB" />
      <path d="M2.6 16.4 H21.4 L22.2 18.8 C22.4 19.5 21.9 20.2 21.1 20.2 H2.9 C2.1 20.2 1.6 19.5 1.8 18.8 Z" fill="#4B7BEC" />
    </svg>
  );
}
function IkGarisBilangan() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12 H21.5M2.5 12 L5.5 9.8M2.5 12 L5.5 14.2M21.5 12 L18.5 9.8M21.5 12 L18.5 14.2" />
      <path d="M8 9.4 V14.6M12 9.4 V14.6M16 9.4 V14.6" />
    </svg>
  );
}
function IkChevron2() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7 L11 12 L6 17" />
      <path d="M12 7 L17 12 L12 17" />
    </svg>
  );
}
function IkTermometer() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22A45D" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 5.2 a2 2 0 0 0 -4 0 V13.8 a3.6 3.6 0 1 0 4 0 Z" />
      <path d="M11.5 8.8 V14.6" />
      <circle cx="11.5" cy="17.4" r="2.1" fill="#22A45D" stroke="none" />
    </svg>
  );
}
function IkJam() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" fill="#FFFFFF" stroke="#7C5CFC" strokeWidth={4} />
      <path d="M24 13v11.5l7.5 4.5" stroke="#6D5AE6" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IkCentang() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" fill="#22B04B" />
      <path d="M15 24.5 21.5 31 33 18.5" stroke="#FFFFFF" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IkApi() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" style={{ flex: 'none' }}>
      <path d="M16 2c1.6 4.6-1.8 6.8-4 9.4-2.3 2.7-3.7 5.4-3.7 8.5C8.3 25.1 11.7 30 16.4 30c4.6 0 8.3-3.7 8.3-8.7 0-5-3.3-7.9-5.2-10.5-.4 2.1-1.4 3.3-2.6 4 .7-4.3-.3-9-1-12.8Z" fill="#F97316" />
      <path d="M16.2 15.6c1.3 2.6 3.4 3.7 3.4 6.5 0 2.4-1.6 4.2-3.7 4.2-2.2 0-3.7-1.8-3.7-4 0-2.8 2.6-3.9 4-6.7Z" fill="#FDBA4D" />
    </svg>
  );
}
function IkChevronKanan({ warna = '#A8ABBC' }: { warna?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={warna} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5.5 15.5 12 9 18.5" />
    </svg>
  );
}
function IkKebab() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#A8ABBC" style={{ flex: 'none' }}>
      <circle cx="12" cy="5.5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="18.5" r="1.7" />
    </svg>
  );
}
