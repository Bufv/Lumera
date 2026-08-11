import { beforeEach, describe, expect, it } from 'vitest';
import { daftarkanSemuaModul } from '../../src/modules/eager';
import { kosongkanRegistry, periksaKontrak, semuaModul } from '../../src/shell/registry';
import { SUBJECT_WORLDS } from '../../src/atlas/subject-worlds';
import type { AnyLessonModule } from '../../src/shell/types';

/**
 * Audit gate konstitusi untuk KEEMPAT modul nyata sekaligus.
 * Ini yang membuat SC-007 (verifikasi konten) dan FR-020 (kelayakan modul)
 * bisa dibuktikan otomatis, bukan diklaim.
 */

describe('pendaftaran keempat modul', () => {
  beforeEach(() => kosongkanRegistry());

  it('mendaftarkan 4 modul tanpa ditolak registry (FR-003)', () => {
    expect(() => daftarkanSemuaModul()).not.toThrow();
    expect(semuaModul()).toHaveLength(4);
  });

  it('setiap modul memenuhi seluruh butir kontrak', () => {
    daftarkanSemuaModul();
    for (const m of semuaModul()) {
      expect(periksaKontrak(m as Partial<AnyLessonModule>)).toEqual([]);
    }
  });
});

describe('gate Prinsip IV — verifikasi konten', () => {
  beforeEach(() => {
    kosongkanRegistry();
    daftarkanSemuaModul();
  });

  it('setiap modul punya rujukan Capaian Pembelajaran Kurikulum Merdeka', () => {
    for (const m of semuaModul()) {
      expect(m.verifikasi.rujukanCP.length).toBeGreaterThan(20);
    }
  });

  it('reviewer SELALU berbeda dari penulis — tidak ada self-review', () => {
    for (const m of semuaModul()) {
      expect(m.verifikasi.penulis).toBeTruthy();
      expect(m.verifikasi.reviewer).toBeTruthy();
      expect(m.verifikasi.reviewer).not.toBe(m.verifikasi.penulis);
    }
  });

  it('setiap modul punya tanggal verifikasi yang valid', () => {
    for (const m of semuaModul()) {
      expect(Number.isNaN(Date.parse(m.verifikasi.tanggalVerifikasi))).toBe(false);
    }
  });
});

describe('gate Prinsip II — penjelasan "Kenapa?" di kedua kondisi', () => {
  beforeEach(() => {
    kosongkanRegistry();
    daftarkanSemuaModul();
  });

  it('mengembalikan teks non-kosong untuk jawaban benar MAUPUN salah', () => {
    for (const m of semuaModul()) {
      const benar = m.penjelasanKenapa({ benar: true, mistakeType: null, nomorPercobaan: 1 });
      const salah = m.penjelasanKenapa({
        benar: false,
        mistakeType: 'salah_hitung',
        nomorPercobaan: 1,
      });
      expect(benar.trim().length).toBeGreaterThan(20);
      expect(salah.trim().length).toBeGreaterThan(20);
      // Penjelasan untuk benar dan salah tidak boleh identik — kalau sama,
      // artinya modul tidak benar-benar merespons kesalahan siswa.
      expect(benar).not.toBe(salah);
    }
  });
});

describe('gate Prinsip VI — kesiapan instrumentasi', () => {
  beforeEach(() => {
    kosongkanRegistry();
    daftarkanSemuaModul();
  });

  it('setiap modul punya conceptIds non-kosong untuk event log', () => {
    for (const m of semuaModul()) {
      expect(m.conceptIds.length).toBeGreaterThan(0);
      for (const c of m.conceptIds) expect(c.trim()).not.toBe('');
    }
  });
});

describe('integrasi Atlas ↔ registry (FR-002)', () => {
  beforeEach(() => {
    kosongkanRegistry();
    daftarkanSemuaModul();
  });

  it('setiap moduleId yang dirujuk Atlas benar-benar terdaftar', () => {
    const terdaftar = new Set(semuaModul().map((m) => m.id));
    for (const w of SUBJECT_WORLDS) {
      for (const id of w.moduleIds) {
        expect(terdaftar.has(id)).toBe(true);
      }
    }
  });

  it('setiap modul terdaftar punya subject world yang ada di Atlas', () => {
    const dunia = new Set(SUBJECT_WORLDS.map((w) => w.id));
    for (const m of semuaModul()) {
      expect(dunia.has(m.subjectWorldId)).toBe(true);
    }
  });

  it('koneksi antar node menunjuk subject world yang valid (FR-001)', () => {
    const dunia = new Set(SUBJECT_WORLDS.map((w) => w.id));
    for (const w of SUBJECT_WORLDS) {
      for (const c of w.connections) expect(dunia.has(c)).toBe(true);
    }
  });
});
