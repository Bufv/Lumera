import { bacaSiswa, simpanSiswa, type Siswa } from './store';
import { hitungStreak, tanggalLokal } from './streak';
import { perbaruiMastery } from './mastery';

/**
 * Pemberian Lumens & pembaruan progres saat pelajaran selesai (FR-007, FR-008, FR-009).
 *
 * KEPUTUSAN besaran Lumens (titik terbuka research.md):
 * 20 Lumens per pelajaran selesai, +5 bonus jika tanpa kesalahan.
 * Sengaja rata dan kecil — Prinsip V melarang reward meledak-ledak; bonusnya cukup
 * terasa untuk menghargai ketelitian tanpa berubah jadi mesin poin.
 */

export const LUMENS_PER_PELAJARAN = 20;
export const LUMENS_BONUS_TANPA_KESALAHAN = 5;

export function hitungLumens(jumlahKesalahan: number): number {
  return LUMENS_PER_PELAJARAN + (jumlahKesalahan === 0 ? LUMENS_BONUS_TANPA_KESALAHAN : 0);
}

export interface HasilPenyelesaian {
  siswa: Siswa;
  lumensDidapat: number;
}

/**
 * Dipanggil HANYA saat siswa menekan "Lanjutkan" di langkah 7.
 * Pelajaran yang ditinggalkan tidak boleh sampai ke sini (FR-014).
 */
export function selesaikanPelajaran(moduleId: string, jumlahKesalahan: number): HasilPenyelesaian {
  const siswa = bacaSiswa();

  const lumensDidapat = hitungLumens(jumlahKesalahan);
  const streak = hitungStreak(
    { streakCount: siswa.streakCount, streakLastDate: siswa.streakLastDate },
    tanggalLokal(),
  );

  const masteryLama = siswa.mastery.find((m) => m.moduleId === moduleId);
  const masteryBaru = perbaruiMastery(masteryLama, moduleId, jumlahKesalahan);

  const berikutnya: Siswa = {
    ...siswa,
    lumens: siswa.lumens + lumensDidapat,
    streakCount: streak.streakCount,
    streakLastDate: streak.streakLastDate,
    mastery: [...siswa.mastery.filter((m) => m.moduleId !== moduleId), masteryBaru],
    modulSelesai: siswa.modulSelesai.includes(moduleId)
      ? siswa.modulSelesai
      : [...siswa.modulSelesai, moduleId],
  };

  simpanSiswa(berikutnya);
  return { siswa: berikutnya, lumensDidapat };
}
