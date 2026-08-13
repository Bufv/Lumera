import { describe, expect, it } from 'vitest';
import {
  LEBAR_KOLOM,
  jalurSimpul,
  kurvaMulus,
  persenSimpul,
} from '../../src/courses/simpul';

/**
 * Kolom pelajaran dihitung, bukan digambar tangan. Tes ini memastikan level
 * dengan jumlah pelajaran berapa pun tetap menghasilkan kolom yang valid.
 */

describe('jalurSimpul', () => {
  it('menghasilkan satu simpul per pelajaran', () => {
    expect(jalurSimpul(4).simpul).toHaveLength(4);
    expect(jalurSimpul(9).simpul).toHaveLength(9);
  });

  it('berkelok tengah → kiri → tengah → kanan lalu berulang', () => {
    const posisi = jalurSimpul(6).simpul.map((s) => s.posisi);
    expect(posisi).toEqual(['tengah', 'kiri', 'tengah', 'kanan', 'tengah', 'kiri']);
  });

  it('menaruh label di seberang kelokan supaya tidak menabrak tepi kolom', () => {
    const simpul = jalurSimpul(4).simpul;
    expect(simpul.map((s) => s.labelDiKanan)).toEqual([true, true, true, false]);
  });

  it('turun terus tanpa pernah naik', () => {
    const simpul = jalurSimpul(7).simpul;
    for (let i = 1; i < simpul.length; i += 1) {
      expect(simpul[i]!.y).toBeGreaterThan(simpul[i - 1]!.y);
    }
  });

  it('menjaga seluruh simpul di dalam kolom', () => {
    for (const s of jalurSimpul(8).simpul) {
      expect(s.x).toBeGreaterThan(0);
      expect(s.x).toBeLessThan(LEBAR_KOLOM);
    }
  });

  it('menambah tinggi kolom seiring bertambahnya pelajaran', () => {
    expect(jalurSimpul(3).tinggi).toBeLessThan(jalurSimpul(6).tinggi);
    expect(jalurSimpul(1).tinggi).toBeGreaterThan(0);
  });

  it('tidak pecah saat levelnya kosong', () => {
    const hasil = jalurSimpul(0);
    expect(hasil.simpul).toEqual([]);
    expect(hasil.d).toBe('');
    expect(hasil.tinggi).toBeGreaterThan(0);
  });
});

describe('kurvaMulus', () => {
  it('mengembalikan string kosong tanpa titik', () => {
    expect(kurvaMulus([])).toBe('');
  });

  it('hanya memindahkan pena untuk satu titik', () => {
    expect(kurvaMulus([{ x: 10, y: 20 }])).toBe('M10 20');
  });

  it('membuat satu segmen kubik untuk setiap jarak antartitik', () => {
    const d = kurvaMulus([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
    ]);
    expect(d.startsWith('M0 0')).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
  });

  it('melewati titik terakhir persis, bukan sekadar mendekatinya', () => {
    const d = kurvaMulus([
      { x: 0, y: 0 },
      { x: 196, y: 150 },
      { x: 300, y: 360 },
    ]);
    expect(d.endsWith('300 360')).toBe(true);
  });
});

describe('persenSimpul', () => {
  it('mengubah koordinat kolom menjadi persen', () => {
    const posisi = persenSimpul({ x: 196, y: 400, posisi: 'tengah', labelDiKanan: true }, 800);
    expect(posisi.kiri).toBe(50);
    expect(posisi.atas).toBe(50);
  });
});
