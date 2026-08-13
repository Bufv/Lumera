import { describe, expect, it } from 'vitest';
import {
  hitungEkuilibrium,
  nilaiHargaEkuilibrium,
  type SupplyDemandState,
} from '../../src/modules/econ-supply-demand/scoring';

const s: SupplyDemandState = {
  demandIntercept: 50,
  demandSlope: 2,
  supplyIntercept: 10,
  supplySlope: 2,
};

describe('perhitungan ekuilibrium', () => {
  it('mencari titik potong kedua kurva', () => {
    expect(hitungEkuilibrium(s)).toEqual({ kuantitas: 10, harga: 30 });
  });

  it('harga ekuilibrium NAIK saat penawaran bergeser ke atas', () => {
    const awal = hitungEkuilibrium(s).harga;
    const setelah = hitungEkuilibrium({ ...s, supplyIntercept: 20 }).harga;
    expect(setelah).toBeGreaterThan(awal);
  });

  it('harga ekuilibrium NAIK saat permintaan bergeser ke atas', () => {
    const awal = hitungEkuilibrium(s).harga;
    const setelah = hitungEkuilibrium({ ...s, demandIntercept: 60 }).harga;
    expect(setelah).toBeGreaterThan(awal);
  });

  it('kuantitas ekuilibrium TURUN saat penawaran bergeser ke atas', () => {
    const awal = hitungEkuilibrium(s).kuantitas;
    const setelah = hitungEkuilibrium({ ...s, supplyIntercept: 20 }).kuantitas;
    expect(setelah).toBeLessThan(awal);
  });
});

describe('penilaian & klasifikasi miskonsepsi', () => {
  it('menerima harga ekuilibrium yang benar', () => {
    expect(nilaiHargaEkuilibrium(30, s)).toEqual({ benar: true, mistakeType: null });
  });

  it('mengenali kuantitas yang tertukar dengan harga', () => {
    expect(nilaiHargaEkuilibrium(10, s).mistakeType).toBe('baca_kuantitas');
  });

  it('mengenali intercept permintaan', () => {
    expect(nilaiHargaEkuilibrium(50, s).mistakeType).toBe('pakai_intercept_demand');
  });

  it('SELALU mengisi mistakeType saat jawaban salah', () => {
    for (const j of [0, 5, 12, 33, 99, -3]) {
      const h = nilaiHargaEkuilibrium(j, s);
      if (!h.benar) expect(h.mistakeType).toBeTruthy();
    }
  });
});
