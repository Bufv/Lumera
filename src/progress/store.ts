/**
 * Persistensi progres siswa (FR-010). Satu perangkat = satu siswa (asumsi spec).
 * Bentuk data mengikuti specs/001-core-mvp-prototype/data-model.md, diperluas
 * dengan `schemaVersion` per specs/002-production-readiness/data-model.md (R-011).
 */

const STORAGE_KEY = 'lumera.progress.v1';

/** Naikkan setiap kali bentuk field Siswa berubah tidak-kompatibel-mundur,
 * dan tambahkan satu langkah di `migrasiSiswa` (T033, spec 002). */
export const SISWA_SCHEMA_VERSION = 1;

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
  /** Versi bentuk data ini — lihat SISWA_SCHEMA_VERSION dan contracts/progress-export-contract.md. */
  schemaVersion: number;
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
  return {
    schemaVersion: SISWA_SCHEMA_VERSION,
    id,
    lumens: 0,
    streakCount: 0,
    streakLastDate: null,
    mastery: [],
    modulSelesai: [],
  };
}

/**
 * Migrasi berurutan dari versi manapun yang pernah tersimpan ke
 * SISWA_SCHEMA_VERSION saat ini (R-011 research.md spec 002). Data tanpa
 * `schemaVersion` sama sekali (bentuk asli spec 001, sebelum field ini ada)
 * diperlakukan sebagai v0 dan dinaikkan tanpa mengubah bentuk field lain.
 *
 * Titik penambahan langkah migrasi berikutnya (v1 → v2, dst.) ada di sini —
 * jangan pernah mengubah bentuk field lama secara diam-diam tanpa menaikkan
 * versi (contracts/progress-export-contract.md aturan 3).
 */
export function migrasiSiswa(data: Partial<Siswa>): Siswa {
  let versi = typeof data.schemaVersion === 'number' ? data.schemaVersion : 0;
  let hasil: Partial<Siswa> = { ...data };

  if (versi < 1) {
    hasil = { ...hasil, schemaVersion: 1 };
    versi = 1;
  }

  return {
    ...siswaBaru(),
    ...hasil,
    mastery: hasil.mastery ?? [],
    modulSelesai: hasil.modulSelesai ?? [],
  };
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
    const bermigrasi = migrasiSiswa(parsed);
    // Tulis kembali hasil migrasi supaya pembacaan berikutnya tidak perlu
    // bermigrasi ulang dari bentuk lama.
    if (bermigrasi.schemaVersion !== parsed.schemaVersion) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bermigrasi));
    }
    return bermigrasi;
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
