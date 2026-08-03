import { describe, expect, it } from 'vitest';
import {
  kemiringanSebenarnya,
  nilaiKemiringan,
  yPadaGaris,
  type SlopeState,
} from '../../src/modules/math-slope/scoring';

const s: SlopeState = { x1: 1, y1: 2, x2: 7, y2: 8, penunjukX: 1 };

describe('perhitungan kemiringan', () => {
  it('menghitung gradien dari dua titik', () => {
    expect(kemiringanSebenarnya(s)).toBe(1);
    expect(kemiringanSebenarnya({ ...s, y2: 14 })).toBe(2);
  });

  it('menghitung y pada garis untuk x tertentu', () => {
    expect(yPadaGaris(s, 1)).toBe(2);
    expect(yPadaGaris(s, 7)).toBe(8);
    expect(yPadaGaris(s, 4)).toBe(5);
  });
});

describe('penilaian & klasifikasi mistakeType', () => {
  it('menerima jawaban benar dalam toleransi', () => {
    expect(nilaiKemiringan(1, s)).toEqual({ benar: true, mistakeType: null });
    expect(nilaiKemiringan(1.03, s).benar).toBe(true);
  });

  it('mengenali tanda terbalik', () => {
    const curam: SlopeState = { ...s, y2: 14 }; // gradien 2
    expect(nilaiKemiringan(-2, curam)).toEqual({ benar: false, mistakeType: 'tanda_terbalik' });
  });

  it('mengenali Δx/Δy yang tertukar', () => {
    const curam: SlopeState = { ...s, y2: 14 }; // gradien 2, kebalikannya 0.5
    expect(nilaiKemiringan(0.5, curam)).toEqual({ benar: false, mistakeType: 'terbalik_dx_dy' });
  });

  it('jatuh ke salah_hitung untuk jawaban lain', () => {
    expect(nilaiKemiringan(9, s)).toEqual({ benar: false, mistakeType: 'salah_hitung' });
  });

  it('SELALU mengisi mistakeType saat jawaban salah — event log tidak boleh cacat', () => {
    for (const jawaban of [-1, 0, 0.5, 3, 42, -7.5]) {
      const hasil = nilaiKemiringan(jawaban, s);
      if (!hasil.benar) expect(hasil.mistakeType).toBeTruthy();
    }
  });
});
