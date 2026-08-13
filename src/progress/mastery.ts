import type { CatatanMastery } from './store';

/**
 * Perhitungan mastery % (FR-009) — titik terbuka research.md, diputuskan di sini.
 *
 * KEPUTUSAN: rata-rata bergerak atas 3 sesi terakhir, bukan akumulasi seumur hidup.
 * Alasannya ada di FR-009: mastery harus mencerminkan performa TERBARU. Akumulasi
 * seumur hidup membuat siswa yang awalnya banyak salah tidak pernah bisa terlihat
 * membaik, walau sesi terakhirnya sempurna — dan itu justru melemahkan motivasi
 * yang ingin dibangun gamifikasi.
 */

export const RIWAYAT_MASTERY = 3;

/** Setiap kesalahan memotong 25 poin; lantainya 0. */
export function skorSesi(jumlahKesalahan: number): number {
  return Math.max(0, 100 - 25 * jumlahKesalahan);
}

export function hitungMastery(skorTerakhir: number[]): number {
  if (skorTerakhir.length === 0) return 0;
  const jumlah = skorTerakhir.reduce((a, b) => a + b, 0);
  return Math.round(jumlah / skorTerakhir.length);
}

export function perbaruiMastery(
  sebelumnya: CatatanMastery | undefined,
  moduleId: string,
  jumlahKesalahan: number,
  sekarang: string = new Date().toISOString(),
): CatatanMastery {
  const riwayat = [...(sebelumnya?.skorTerakhir ?? []), skorSesi(jumlahKesalahan)].slice(
    -RIWAYAT_MASTERY,
  );

  return {
    moduleId,
    masteryPersen: hitungMastery(riwayat),
    skorTerakhir: riwayat,
    diperbaruiPada: sekarang,
  };
}
