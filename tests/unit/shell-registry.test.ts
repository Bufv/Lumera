import { beforeEach, describe, expect, it } from 'vitest';
import {
  ModulTidakMemenuhiKontrakError,
  daftarkanModul,
  kosongkanRegistry,
  periksaKontrak,
  semuaModul,
} from '../../src/shell/registry';
import { dummyModule } from '../../src/modules/_dummy';
import type { AnyLessonModule } from '../../src/shell/types';

const dasar = dummyModule as unknown as Partial<AnyLessonModule>;

describe('registry menegakkan kontrak modul (Prinsip II & IV)', () => {
  beforeEach(() => kosongkanRegistry());

  it('menerima modul yang memenuhi kontrak', () => {
    expect(periksaKontrak(dasar)).toEqual([]);
    daftarkanModul(dummyModule);
    expect(semuaModul()).toHaveLength(1);
  });

  it('MENOLAK modul tanpa slot VisualModel', () => {
    const p = periksaKontrak({ ...dasar, VisualModel: undefined });
    expect(p.join(' ')).toContain('VisualModel');
  });

  it('MENOLAK modul tanpa slot UserAction', () => {
    const p = periksaKontrak({ ...dasar, UserAction: undefined });
    expect(p.join(' ')).toContain('UserAction');
  });

  it('MENOLAK penjelasanKenapa yang kosong saat jawaban BENAR', () => {
    // Ini pelanggaran Prinsip II yang paling mudah lolos tanpa penjagaan:
    // penjelasan diisi untuk jawaban salah saja.
    const p = periksaKontrak({
      ...dasar,
      penjelasanKenapa: (h) => (h.benar ? '' : 'ada penjelasan'),
    });
    expect(p.join(' ')).toContain('benar=true');
  });

  it('MENOLAK penjelasanKenapa yang kosong saat jawaban SALAH', () => {
    const p = periksaKontrak({
      ...dasar,
      penjelasanKenapa: (h) => (h.benar ? 'ada penjelasan' : '   '),
    });
    expect(p.join(' ')).toContain('benar=false');
  });

  it('MENOLAK conceptIds kosong', () => {
    expect(periksaKontrak({ ...dasar, conceptIds: [] }).join(' ')).toContain('conceptIds');
  });

  it('MENOLAK self-review (reviewer sama dengan penulis)', () => {
    const p = periksaKontrak({
      ...dasar,
      verifikasi: {
        rujukanCP: 'CP-X',
        penulis: 'andi',
        reviewer: 'andi',
        tanggalVerifikasi: '2026-07-29',
      },
    });
    expect(p.join(' ')).toContain('self-review');
  });

  it('MENOLAK modul tanpa metadata verifikasi konten', () => {
    expect(periksaKontrak({ ...dasar, verifikasi: undefined }).join(' ')).toContain('verifikasi');
  });

  it('melempar saat pendaftaran modul yang melanggar kontrak', () => {
    expect(() =>
      daftarkanModul({ ...dummyModule, conceptIds: [] }),
    ).toThrow(ModulTidakMemenuhiKontrakError);
    expect(semuaModul()).toHaveLength(0);
  });
});
