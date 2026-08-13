import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MODULE_META, muatModul } from '../../src/modules';
import { kosongkanRegistry, periksaKontrak, semuaModul } from '../../src/shell/registry';
import { LessonShell } from '../../src/shell/LessonShell';
import type { AnyLessonModule } from '../../src/shell/types';

/**
 * US11 spec 002 (T062-T063, FR-024/025, R-013): bukti hidup jalur lazy —
 * `muatModul(id)` mengimpor dinamis, memvalidasi kontrak, dan hasilnya
 * dirender `LessonShell` TANPA satu baris pun kode LessonShell/modul lain
 * disentuh untuk mendukungnya (satisfies kontrak `lesson-module-contract.md`
 * spec 001 seutuhnya lewat mekanisme generik yang sama dipakai modul eager).
 *
 * Memakai modul REAL yang sudah terverifikasi (`math-slope`), bukan modul
 * karangan baru — konten pelajaran MUST diverifikasi kurikulum (Prinsip IV)
 * sebelum ada, jadi tidak pantas dikarang di sini hanya demi tes.
 */

describe('registry lazy — muatModul', () => {
  beforeEach(() => kosongkanRegistry());

  it('MODULE_META berisi keempat modul tanpa mengimpor komponen berat', () => {
    expect(MODULE_META.map((m) => m.id).sort()).toEqual(
      ['econ-supply-demand', 'history-causal-chain', 'math-slope', 'physics-motion'].sort(),
    );
    for (const m of MODULE_META) {
      expect(m.conceptIds.length).toBeGreaterThan(0);
    }
  });

  it('muatModul memuat modul penuh, memvalidasi kontrak, dan mendaftarkannya ke registry LessonShell', async () => {
    const modul = await muatModul('math-slope');
    expect(periksaKontrak(modul as Partial<AnyLessonModule>)).toEqual([]);
    expect(semuaModul().map((m) => m.id)).toEqual(['math-slope']);
  });

  it('muatModul mengembalikan instans yang sama pada panggilan kedua (cache, tidak impor ulang)', async () => {
    const pertama = await muatModul('math-slope');
    const kedua = await muatModul('math-slope');
    expect(kedua).toBe(pertama);
  });

  it('muatModul menolak id yang tidak dikenal dengan pesan jelas, bukan diam-diam', async () => {
    await expect(muatModul('modul-tidak-ada')).rejects.toThrow(/tidak dikenali/);
  });

  it('modul hasil muatModul dirender LessonShell tanpa perubahan apapun pada LessonShell (bukti FR-024)', async () => {
    const modul = await muatModul('math-slope');
    const { container } = render(
      <LessonShell modul={modul} onKeluar={() => {}} onSelesai={() => {}} />,
    );
    expect(screen.getByText(modul.prompt)).toBeInTheDocument();
    cleanup();
    void container;
  });

  it('metadata di MODULE_META konsisten dengan modul penuh hasil muatModul', async () => {
    const meta = MODULE_META.find((m) => m.id === 'math-slope')!;
    const modul = await muatModul('math-slope');
    expect(modul.judul).toBe(meta.judul);
    expect(modul.subjectWorldId).toBe(meta.subjectWorldId);
    expect(modul.conceptIds).toEqual(meta.conceptIds);
  });
});
