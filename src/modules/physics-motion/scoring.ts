export interface MotionState {
  /** m/s */
  kecepatanAwal: number;
  /** m/s² */
  percepatan: number;
  /** detik — durasi simulasi yang ditanyakan */
  waktuTarget: number;
}

export const TOLERANSI_JARAK = 0.5;

/** s = v₀·t + ½·a·t² — GLBB. */
export function jarakTempuh(v0: number, a: number, t: number): number {
  return v0 * t + 0.5 * a * t * t;
}

export function kecepatanPada(v0: number, a: number, t: number): number {
  return v0 + a * t;
}

export type MotionMistake =
  | 'abaikan_percepatan' // memakai s = v₀·t saja
  | 'lupa_setengah' // memakai a·t² tanpa ½
  | 'pakai_kecepatan_akhir' // menjawab kecepatan, bukan jarak
  | 'salah_hitung';

export function nilaiJarak(
  jawaban: number,
  s: MotionState,
): { benar: boolean; mistakeType: MotionMistake | null } {
  const { kecepatanAwal: v0, percepatan: a, waktuTarget: t } = s;
  const benar = jarakTempuh(v0, a, t);

  const dekat = (x: number) => Math.abs(jawaban - x) <= TOLERANSI_JARAK;

  if (dekat(benar)) return { benar: true, mistakeType: null };
  if (dekat(v0 * t)) return { benar: false, mistakeType: 'abaikan_percepatan' };
  if (dekat(v0 * t + a * t * t)) return { benar: false, mistakeType: 'lupa_setengah' };
  if (dekat(kecepatanPada(v0, a, t))) return { benar: false, mistakeType: 'pakai_kecepatan_akhir' };
  return { benar: false, mistakeType: 'salah_hitung' };
}
