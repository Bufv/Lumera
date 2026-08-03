export interface SlopeState {
  /** Titik yang membentuk garis: (x1,y1) → (x2,y2). Tetap; siswa membaca, bukan mengubah. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Titik bantu yang bisa digeser siswa untuk menelusuri garis. */
  penunjukX: number;
}

export const TOLERANSI = 0.05;

export function kemiringanSebenarnya(s: SlopeState): number {
  return (s.y2 - s.y1) / (s.x2 - s.x1);
}

/** y pada garis untuk x tertentu — dipakai titik bantu agar interaksinya nyata. */
export function yPadaGaris(s: SlopeState, x: number): number {
  return s.y1 + kemiringanSebenarnya(s) * (x - s.x1);
}

export type SlopeMistake =
  | 'terbalik_dx_dy' // menghitung Δx/Δy alih-alih Δy/Δx
  | 'tanda_terbalik' // besarnya benar, tandanya salah
  | 'salah_hitung';

/**
 * Klasifikasi kesalahan bukan sekadar benar/salah: mistakeType inilah yang nanti
 * dipakai Knowledge Bank untuk mengenali miskonsepsi berulang (FR-015).
 */
export function nilaiKemiringan(
  jawaban: number,
  s: SlopeState,
): { benar: boolean; mistakeType: SlopeMistake | null } {
  const m = kemiringanSebenarnya(s);

  if (Math.abs(jawaban - m) <= TOLERANSI) {
    return { benar: true, mistakeType: null };
  }
  if (Math.abs(jawaban + m) <= TOLERANSI) {
    return { benar: false, mistakeType: 'tanda_terbalik' };
  }
  if (m !== 0 && Math.abs(jawaban - 1 / m) <= TOLERANSI) {
    return { benar: false, mistakeType: 'terbalik_dx_dy' };
  }
  return { benar: false, mistakeType: 'salah_hitung' };
}
