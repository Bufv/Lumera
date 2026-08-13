import { describe, expect, it } from 'vitest';
import {
  jarakTempuh,
  kecepatanPada,
  nilaiJarak,
  type MotionState,
} from '../../src/modules/physics-motion/scoring';

const s: MotionState = { kecepatanAwal: 4, percepatan: 2, waktuTarget: 5 };

describe('kinematika GLBB', () => {
  it('menghitung jarak dengan s = v₀t + ½at²', () => {
    expect(jarakTempuh(4, 2, 5)).toBe(45);
    expect(jarakTempuh(0, 10, 2)).toBe(20);
  });

  it('gerak lurus beraturan saat percepatan nol', () => {
    expect(jarakTempuh(6, 0, 4)).toBe(24);
  });

  it('menghitung kecepatan sesaat', () => {
    expect(kecepatanPada(4, 2, 5)).toBe(14);
  });
});

describe('penilaian & klasifikasi miskonsepsi', () => {
  it('menerima jawaban benar', () => {
    expect(nilaiJarak(45, s)).toEqual({ benar: true, mistakeType: null });
  });

  it('mengenali percepatan yang diabaikan (v₀·t saja)', () => {
    expect(nilaiJarak(20, s)).toEqual({ benar: false, mistakeType: 'abaikan_percepatan' });
  });

  it('mengenali faktor ½ yang hilang', () => {
    // v₀t + at² = 20 + 50 = 70
    expect(nilaiJarak(70, s)).toEqual({ benar: false, mistakeType: 'lupa_setengah' });
  });

  it('mengenali kecepatan akhir yang tertukar dengan jarak', () => {
    expect(nilaiJarak(14, s)).toEqual({ benar: false, mistakeType: 'pakai_kecepatan_akhir' });
  });

  it('SELALU mengisi mistakeType saat jawaban salah', () => {
    for (const j of [0, 1, 13, 21, 69, 100, -5]) {
      const h = nilaiJarak(j, s);
      if (!h.benar) expect(h.mistakeType).toBeTruthy();
    }
  });
});
