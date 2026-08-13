import { describe, expect, it } from 'vitest';
import { pilihUsulan, AMBANG_KUASAI, type ModulRingkas } from '../../src/progress/suggestions';
import type { CatatanMastery, Siswa } from '../../src/progress/store';

/**
 * Usulan Beranda harus digerakkan mastery, bukan urutan acak:
 * yang belum tuntas didahulukan, lalu yang baru, terakhir yang sudah kuat.
 */

const MODUL: ModulRingkas[] = [
  { id: 'math-slope', judul: 'Membaca Kemiringan', subjectWorldId: 'matematika' },
  { id: 'physics-motion', judul: 'Gerak Lurus', subjectWorldId: 'sains' },
  { id: 'econ-supply-demand', judul: 'Supply & Demand', subjectWorldId: 'ekonomi' },
  { id: 'history-causal-chain', judul: 'Rantai Sebab-Akibat', subjectWorldId: 'sejarah' },
];

function siswa(mastery: CatatanMastery[]): Siswa {
  return {
    schemaVersion: 1,
    id: 'uji',
    lumens: 0,
    streakCount: 0,
    streakLastDate: null,
    mastery,
    modulSelesai: [],
  };
}

function rec(moduleId: string, persen: number): CatatanMastery {
  return { moduleId, masteryPersen: persen, skorTerakhir: [persen], diperbaruiPada: '2026-08-03' };
}

describe('pilihUsulan', () => {
  it('siswa baru (tanpa riwayat) mendapat semua usulan bertipe "baru", dibatasi 3', () => {
    const hasil = pilihUsulan(MODUL, siswa([]), 3);
    expect(hasil).toHaveLength(3);
    expect(hasil.every((u) => u.alasan === 'baru')).toBe(true);
    expect(hasil.every((u) => u.masteryPersen === null)).toBe(true);
  });

  it('mendahulukan modul yang belum tuntas (mastery < ambang), yang terendah dulu', () => {
    const s = siswa([rec('math-slope', 90), rec('physics-motion', 30), rec('econ-supply-demand', 60)]);
    const hasil = pilihUsulan(MODUL, s, 3);
    // physics (30) lebih mendesak dari econ (60); keduanya sebelum yang 'baru'/'kuat'.
    expect(hasil[0]?.moduleId).toBe('physics-motion');
    expect(hasil[0]?.alasan).toBe('ulang');
    expect(hasil[1]?.moduleId).toBe('econ-supply-demand');
    expect(hasil[1]?.alasan).toBe('ulang');
  });

  it('menempatkan modul baru di atas modul yang sudah dikuasai', () => {
    // math dikuasai (85), history baru; tak ada yang 'ulang'.
    const s = siswa([rec('math-slope', 85)]);
    const hasil = pilihUsulan(MODUL, s, 4);
    const baru = hasil.filter((u) => u.alasan === 'baru');
    const kuat = hasil.find((u) => u.moduleId === 'math-slope');
    expect(kuat?.alasan).toBe('pertahankan');
    // Semua 'baru' harus berada sebelum 'pertahankan'.
    const idxKuat = hasil.findIndex((u) => u.alasan === 'pertahankan');
    for (const b of baru) expect(hasil.indexOf(b)).toBeLessThan(idxKuat);
  });

  it('memetakan subjectWorldId ke nama produk', () => {
    const [u] = pilihUsulan([MODUL[0]!], siswa([]), 1);
    expect(u?.subjectWorldNama).toBe('Matematika');
  });

  it('tepat di ambang dianggap sudah dikuasai (pertahankan), bukan ulang', () => {
    const s = siswa([rec('math-slope', AMBANG_KUASAI)]);
    const [u] = pilihUsulan([MODUL[0]!], s, 1);
    expect(u?.alasan).toBe('pertahankan');
  });
});
