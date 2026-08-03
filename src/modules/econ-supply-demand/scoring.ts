export interface SupplyDemandState {
  /** Demand: P = demandIntercept − demandSlope·Q */
  demandIntercept: number;
  demandSlope: number;
  /** Supply: P = supplyIntercept + supplySlope·Q */
  supplyIntercept: number;
  supplySlope: number;
}

export const TOLERANSI_HARGA = 0.5;

export interface Ekuilibrium {
  kuantitas: number;
  harga: number;
}

/**
 * Titik potong kedua kurva:
 *   a − bQ = c + dQ  →  Q = (a − c) / (b + d)
 */
export function hitungEkuilibrium(s: SupplyDemandState): Ekuilibrium {
  const kuantitas = (s.demandIntercept - s.supplyIntercept) / (s.demandSlope + s.supplySlope);
  const harga = s.supplyIntercept + s.supplySlope * kuantitas;
  return { kuantitas, harga };
}

export function hargaDemand(s: SupplyDemandState, q: number): number {
  return s.demandIntercept - s.demandSlope * q;
}

export function hargaSupply(s: SupplyDemandState, q: number): number {
  return s.supplyIntercept + s.supplySlope * q;
}

export type EconMistake =
  | 'baca_kuantitas' // menjawab Q, bukan P
  | 'pakai_intercept_demand' // menjawab harga tertinggi kurva demand
  | 'pakai_intercept_supply' // menjawab harga terendah kurva supply
  | 'salah_hitung';

export function nilaiHargaEkuilibrium(
  jawaban: number,
  s: SupplyDemandState,
): { benar: boolean; mistakeType: EconMistake | null } {
  const e = hitungEkuilibrium(s);
  const dekat = (x: number) => Math.abs(jawaban - x) <= TOLERANSI_HARGA;

  if (dekat(e.harga)) return { benar: true, mistakeType: null };
  if (dekat(e.kuantitas)) return { benar: false, mistakeType: 'baca_kuantitas' };
  if (dekat(s.demandIntercept)) return { benar: false, mistakeType: 'pakai_intercept_demand' };
  if (dekat(s.supplyIntercept)) return { benar: false, mistakeType: 'pakai_intercept_supply' };
  return { benar: false, mistakeType: 'salah_hitung' };
}
