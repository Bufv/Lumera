import { useCallback, useState } from 'react';
import { Beranda } from './beranda/Beranda';
import { Atlas } from './atlas/Atlas';
import { LessonShell } from './shell/LessonShell';
import { ProgressSummary } from './progress/ProgressSummary';
import { ambilModul } from './shell/registry';
import { bacaSiswa, type Siswa } from './progress/store';
import { color, radius, spacing, typography } from './design/tokens';
import type { LessonModule } from './shell/types';

type Layar =
  | { nama: 'beranda' }
  | { nama: 'atlas' }
  | { nama: 'pelajaran'; moduleId: string }
  | { nama: 'progres' };

export function App() {
  const [layar, setLayar] = useState<Layar>({ nama: 'beranda' });
  const [siswa, setSiswa] = useState<Siswa>(() => bacaSiswa());

  // Setelah pelajaran selesai/ditutup, pulang ke Beranda: layar "lanjutkan dari sini"
  // langsung memperlihatkan usulan berikutnya berdasarkan mastery terbaru.
  const kembaliKeBeranda = useCallback(() => {
    setSiswa(bacaSiswa());
    setLayar({ nama: 'beranda' });
  }, []);

  const bukaProgres = useCallback(() => {
    setSiswa(bacaSiswa());
    setLayar({ nama: 'progres' });
  }, []);

  if (layar.nama === 'pelajaran') {
    const modul = ambilModul(layar.moduleId);
    if (!modul) {
      return <p style={{ padding: spacing.xl }}>Modul tidak ditemukan.</p>;
    }
    return (
      <LessonShell
        // Key memaksa Shell dibuat ulang tiap kali pelajaran dibuka,
        // sehingga durasi & percobaan tidak terbawa dari sesi sebelumnya.
        key={layar.moduleId}
        modul={modul as unknown as LessonModule<unknown, unknown>}
        onKeluar={kembaliKeBeranda}
        onSelesai={kembaliKeBeranda}
      />
    );
  }

  if (layar.nama === 'progres') {
    return (
      <div style={{ minHeight: '100vh', background: color.ivory, paddingTop: spacing.lg }}>
        <div style={{ maxWidth: '46rem', margin: '0 auto', padding: `0 ${spacing.lg}` }}>
          <button
            type="button"
            onClick={kembaliKeBeranda}
            style={{
              background: 'transparent',
              border: `1px solid ${color.border}`,
              borderRadius: radius.pill,
              padding: `${spacing.sm} ${spacing.md}`,
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.sm,
              color: color.inkMuted,
              cursor: 'pointer',
            }}
          >
            ← Kembali ke Beranda
          </button>
        </div>
        <ProgressSummary siswa={siswa} />
      </div>
    );
  }

  if (layar.nama === 'atlas') {
    return (
      <Atlas
        siswa={siswa}
        onPilihModul={(moduleId) => setLayar({ nama: 'pelajaran', moduleId })}
        onLihatProgres={bukaProgres}
        onKembali={kembaliKeBeranda}
      />
    );
  }

  return (
    <Beranda
      siswa={siswa}
      onMulai={(moduleId) => setLayar({ nama: 'pelajaran', moduleId })}
      onBukaAtlas={() => setLayar({ nama: 'atlas' })}
      onLihatProgres={bukaProgres}
    />
  );
}
