/**
 * Persistensi progres siswa (FR-010). Satu perangkat = satu siswa (asumsi spec).
 * Bentuk data mengikuti specs/001-core-mvp-prototype/data-model.md.
 */

const STORAGE_KEY = 'lumera.progress.v1';

export interface CatatanMastery {
  moduleId: string;
  /** 0–100 */
  masteryPersen: number;
  /**
   * Skor sesi terakhir (paling lama → paling baru), maksimal RIWAYAT_MASTERY entri.
   * Disimpan agar mastery mencerminkan performa TERBARU, bukan akumulasi seumur hidup —
   * siswa yang membaik harus terlihat membaik (FR-009).
   */
  skorTerakhir: number[];
  diperbaruiPada: string;
}

export interface Siswa {
  id: string;
  lumens: number;
  streakCount: number;
  /** YYYY-MM-DD tanggal lokal, atau null jika belum pernah menyelesaikan pelajaran. */
  streakLastDate: string | null;
  mastery: CatatanMastery[];
  /** moduleId yang pernah diselesaikan — dipakai Atlas untuk status node. */
  modulSelesai: string[];
}

function siswaBaru(): Siswa {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `siswa_${Date.now()}`;
  return { id, lumens: 0, streakCount: 0, streakLastDate: null, mastery: [], modulSelesai: [] };
}

export function bacaSiswa(): Siswa {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const baru = siswaBaru();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(baru));
      return baru;
    }
    const parsed = JSON.parse(raw) as Partial<Siswa>;
    // Isi field yang hilang agar data lama tidak menjatuhkan aplikasi.
    return {
      ...siswaBaru(),
      ...parsed,
      mastery: parsed.mastery ?? [],
      modulSelesai: parsed.modulSelesai ?? [],
    } as Siswa;
  } catch {
    console.error('[lumera/progress] gagal membaca progres; memulai dari kosong');
    return siswaBaru();
  }
}

export function simpanSiswa(siswa: Siswa): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(siswa));
}

export function resetProgres(): void {
  localStorage.removeItem(STORAGE_KEY);
}
