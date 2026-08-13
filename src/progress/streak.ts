/**
 * Transisi streak harian (FR-008).
 * Aturan dari specs/001-core-mvp-prototype/data-model.md.
 */

export function tanggalLokal(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function selisihHari(dariISO: string, keISO: string): number {
  const [ay = 0, am = 1, ad = 1] = dariISO.split('-').map(Number);
  const [by = 0, bm = 1, bd = 1] = keISO.split('-').map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86_400_000);
}

export interface HasilStreak {
  streakCount: number;
  streakLastDate: string;
}

/**
 * Hari sama  → tidak berubah (sudah dihitung hari ini)
 * H+1        → naik 1
 * selisih >1 atau belum pernah → reset ke 1
 */
export function hitungStreak(
  sebelumnya: { streakCount: number; streakLastDate: string | null },
  hariIni: string = tanggalLokal(),
): HasilStreak {
  const { streakCount, streakLastDate } = sebelumnya;

  if (!streakLastDate) {
    return { streakCount: 1, streakLastDate: hariIni };
  }

  const delta = selisihHari(streakLastDate, hariIni);

  if (delta === 0) {
    return { streakCount, streakLastDate: hariIni };
  }
  if (delta === 1) {
    return { streakCount: streakCount + 1, streakLastDate: hariIni };
  }
  // Termasuk delta negatif (jam perangkat mundur) — perlakukan sebagai putus.
  return { streakCount: 1, streakLastDate: hariIni };
}
