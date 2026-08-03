import { useCallback, useState } from 'react';
import { Atlas } from './atlas/Atlas';
import { LessonShell } from './shell/LessonShell';
import { ProgressSummary } from './progress/ProgressSummary';
import { ambilModul } from './shell/registry';
import { bacaSiswa, type Siswa } from './progress/store';
import { color, radius, spacing, typography } from './design/tokens';
import type { LessonModule } from './shell/types';

type Layar = { nama: 'atlas' } | { nama: 'pelajaran'; moduleId: string } | { nama: 'progres' };

export function App() {
  const [layar, setLayar] = useState<Layar>({ nama: 'atlas' });
  const [siswa, setSiswa] = useState<Siswa>(() => bacaSiswa());

  const kembaliKeAtlas = useCallback(() => {
    setSiswa(bacaSiswa());
    setLayar({ nama: 'atlas' });
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
        onKeluar={kembaliKeAtlas}
        onSelesai={kembaliKeAtlas}
      />
    );
  }

  if (layar.nama === 'progres') {
    return (
      <div style={{ minHeight: '100vh', background: color.ivory, paddingTop: spacing.lg }}>
        <div style={{ maxWidth: '46rem', margin: '0 auto', padding: `0 ${spacing.lg}` }}>
          <button
            type="button"
            onClick={kembaliKeAtlas}
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
            ← Kembali ke Atlas
          </button>
        </div>
        <ProgressSummary siswa={siswa} />
      </div>
    );
  }

  return (
    <Atlas
      siswa={siswa}
      onPilihModul={(moduleId) => setLayar({ nama: 'pelajaran', moduleId })}
      onLihatProgres={() => {
        setSiswa(bacaSiswa());
        setLayar({ nama: 'progres' });
      }}
    />
  );
}
