import { useCallback, useState } from 'react';
import { Beranda } from './beranda/Beranda';
import { Courses } from './courses/Courses';
import { Atlas } from './atlas/Atlas';
import { LessonShell } from './shell/LessonShell';
import { ProgressSummary } from './progress/ProgressSummary';
import { HeaderNav, type TabLayar } from './shell/HeaderNav';
import { ambilModul } from './shell/registry';
import { bacaSiswa, type Siswa } from './progress/store';
import { color, radius, spacing, typography } from './design/tokens';
import type { LessonModule } from './shell/types';

type Layar =
  | { nama: 'beranda' }
  | { nama: 'courses' }
  | { nama: 'atlas' }
  | { nama: 'pelajaran'; moduleId: string }
  | { nama: 'progres' };

export function App() {
  const [layar, setLayar] = useState<Layar>({ nama: 'beranda' });
  const [siswa, setSiswa] = useState<Siswa>(() => bacaSiswa());

  const kembaliKeBeranda = useCallback(() => {
    setSiswa(bacaSiswa());
    setLayar({ nama: 'beranda' });
  }, []);

  const bukaProgres = useCallback(() => {
    setSiswa(bacaSiswa());
    setLayar({ nama: 'progres' });
  }, []);

  const tanganiPilihTab = useCallback((tab: TabLayar) => {
    if (tab === 'beranda') setLayar({ nama: 'beranda' });
    else if (tab === 'courses') setLayar({ nama: 'courses' });
    else if (tab === 'atlas') setLayar({ nama: 'atlas' });
    else if (tab === 'progres') setLayar({ nama: 'progres' });
  }, []);

  if (layar.nama === 'pelajaran') {
    const modul = ambilModul(layar.moduleId);
    if (!modul) {
      return (
        <div style={{ minHeight: '100vh', padding: spacing.xl, background: color.surface }}>
          <p style={{ fontFamily: typography.fontFamilyUI }}>Modul tidak ditemukan.</p>
          <button
            type="button"
            onClick={kembaliKeBeranda}
            style={{
              background: color.orange,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: radius.pill,
              padding: `${spacing.sm} ${spacing.md}`,
              cursor: 'pointer',
            }}
          >
            ← Kembali ke Beranda
          </button>
        </div>
      );
    }
    return (
      <LessonShell
        key={layar.moduleId}
        modul={modul as unknown as LessonModule<unknown, unknown>}
        onKeluar={kembaliKeBeranda}
        onSelesai={kembaliKeBeranda}
      />
    );
  }

  const tabAktif: TabLayar =
    layar.nama === 'courses' ? 'courses' : layar.nama === 'atlas' ? 'atlas' : layar.nama === 'progres' ? 'progres' : 'beranda';

  return (
    <div style={{ minHeight: '100vh', background: color.surface }}>
      <HeaderNav tabAktif={tabAktif} siswa={siswa} onPilihTab={tanganiPilihTab} onBukaProgres={bukaProgres} />

      {layar.nama === 'progres' && (
        <div style={{ minHeight: 'calc(100vh - 4rem)', background: color.surface, paddingTop: spacing.lg }}>
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
      )}

      {layar.nama === 'atlas' && (
        <Atlas
          siswa={siswa}
          onPilihModul={(moduleId) => setLayar({ nama: 'pelajaran', moduleId })}
          onKembali={kembaliKeBeranda}
        />
      )}

      {layar.nama === 'courses' && (
        <Courses
          siswa={siswa}
          onMulaiModul={(moduleId) => setLayar({ nama: 'pelajaran', moduleId })}
          onBukaAtlas={() => setLayar({ nama: 'atlas' })}
        />
      )}

      {layar.nama === 'beranda' && (
        <Beranda
          siswa={siswa}
          onMulai={(moduleId) => setLayar({ nama: 'pelajaran', moduleId })}
          onBukaAtlas={() => setLayar({ nama: 'atlas' })}
          onBukaCourses={() => setLayar({ nama: 'courses' })}
        />
      )}
    </div>
  );
}
