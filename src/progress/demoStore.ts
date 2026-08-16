import { hitungPenyelesaian, type HasilPenyelesaian } from './award';
import { migrasiSiswa, SISWA_SCHEMA_VERSION, type Siswa } from './store';

export const DEMO_PROGRESS_STORAGE_KEY = 'lumera.demoProgress.v1';

function progresDemoBaru(): Siswa {
  return migrasiSiswa({
    schemaVersion: SISWA_SCHEMA_VERSION,
    id: 'lumera-demo',
    lumens: 0,
    streakCount: 0,
    streakLastDate: null,
    mastery: [],
    modulSelesai: [],
  });
}

export function bacaProgresDemo(): Siswa {
  try {
    const raw = localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY);
    if (!raw) {
      const baru = progresDemoBaru();
      localStorage.setItem(DEMO_PROGRESS_STORAGE_KEY, JSON.stringify(baru));
      return baru;
    }
    return migrasiSiswa(JSON.parse(raw) as Partial<Siswa>);
  } catch {
    console.error('[lumera/demo-progress] gagal membaca progres demo; memulai dari kosong');
    return progresDemoBaru();
  }
}

export function simpanProgresDemo(siswa: Siswa): void {
  localStorage.setItem(DEMO_PROGRESS_STORAGE_KEY, JSON.stringify(siswa));
}

export function selesaikanPelajaranDemo(
  moduleId: string,
  jumlahKesalahan: number,
): HasilPenyelesaian {
  const hasil = hitungPenyelesaian(bacaProgresDemo(), moduleId, jumlahKesalahan);
  simpanProgresDemo(hasil.siswa);
  return hasil;
}

export function resetProgresDemo(): void {
  localStorage.removeItem(DEMO_PROGRESS_STORAGE_KEY);
}
