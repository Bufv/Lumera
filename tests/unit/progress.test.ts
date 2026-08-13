import { beforeEach, describe, expect, it } from 'vitest';
import { hitungStreak, tanggalLokal } from '../../src/progress/streak';
import { hitungMastery, perbaruiMastery, skorSesi } from '../../src/progress/mastery';
import { hitungLumens, selesaikanPelajaran } from '../../src/progress/award';
import { bacaSiswa, resetProgres } from '../../src/progress/store';

describe('transisi streak harian (FR-008)', () => {
  it('memulai dari 1 saat belum pernah menyelesaikan pelajaran', () => {
    expect(hitungStreak({ streakCount: 0, streakLastDate: null }, '2026-07-29')).toEqual({
      streakCount: 1,
      streakLastDate: '2026-07-29',
    });
  });

  it('TIDAK naik dua kali pada hari yang sama', () => {
    expect(hitungStreak({ streakCount: 3, streakLastDate: '2026-07-29' }, '2026-07-29')).toEqual({
      streakCount: 3,
      streakLastDate: '2026-07-29',
    });
  });

  it('naik saat hari berikutnya', () => {
    expect(hitungStreak({ streakCount: 3, streakLastDate: '2026-07-29' }, '2026-07-30')).toEqual({
      streakCount: 4,
      streakLastDate: '2026-07-30',
    });
  });

  it('reset ke 1 saat ada hari yang terlewat', () => {
    expect(hitungStreak({ streakCount: 9, streakLastDate: '2026-07-29' }, '2026-07-31')).toEqual({
      streakCount: 1,
      streakLastDate: '2026-07-31',
    });
  });

  it('menangani batas akhir bulan', () => {
    expect(hitungStreak({ streakCount: 2, streakLastDate: '2026-07-31' }, '2026-08-01')).toEqual({
      streakCount: 3,
      streakLastDate: '2026-08-01',
    });
  });

  it('menangani batas akhir tahun', () => {
    expect(hitungStreak({ streakCount: 5, streakLastDate: '2026-12-31' }, '2027-01-01')).toEqual({
      streakCount: 6,
      streakLastDate: '2027-01-01',
    });
  });

  it('memperlakukan jam perangkat yang mundur sebagai putus', () => {
    expect(
      hitungStreak({ streakCount: 7, streakLastDate: '2026-07-29' }, '2026-07-27').streakCount,
    ).toBe(1);
  });

  it('tanggalLokal menghasilkan format YYYY-MM-DD', () => {
    expect(tanggalLokal(new Date(2026, 6, 5))).toBe('2026-07-05');
  });
});

describe('perhitungan mastery (FR-009)', () => {
  it('skor sesi turun 25 poin per kesalahan, berhenti di 0', () => {
    expect(skorSesi(0)).toBe(100);
    expect(skorSesi(2)).toBe(50);
    expect(skorSesi(9)).toBe(0);
  });

  it('mastery adalah rata-rata skor terakhir', () => {
    expect(hitungMastery([100, 50])).toBe(75);
    expect(hitungMastery([])).toBe(0);
  });

  it('hanya menyimpan 3 sesi terakhir — performa TERBARU, bukan seumur hidup', () => {
    let rec = perbaruiMastery(undefined, 'm', 4); // 0
    rec = perbaruiMastery(rec, 'm', 4); // 0
    rec = perbaruiMastery(rec, 'm', 4); // 0
    expect(rec.masteryPersen).toBe(0);

    // Tiga sesi sempurna berturut-turut harus mengangkat mastery ke 100,
    // meski riwayat awalnya buruk — siswa yang membaik harus terlihat membaik.
    rec = perbaruiMastery(rec, 'm', 0);
    rec = perbaruiMastery(rec, 'm', 0);
    rec = perbaruiMastery(rec, 'm', 0);
    expect(rec.skorTerakhir).toHaveLength(3);
    expect(rec.masteryPersen).toBe(100);
  });
});

describe('pemberian Lumens (FR-007)', () => {
  it('memberi bonus hanya saat tanpa kesalahan', () => {
    expect(hitungLumens(0)).toBe(25);
    expect(hitungLumens(1)).toBe(20);
    expect(hitungLumens(5)).toBe(20);
  });
});

describe('penyelesaian pelajaran memperbarui seluruh progres', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProgres();
  });

  it('menambah Lumens, streak, mastery, dan daftar modul selesai', () => {
    const { siswa, lumensDidapat } = selesaikanPelajaran('math-slope', 0);
    expect(lumensDidapat).toBe(25);
    expect(siswa.lumens).toBe(25);
    expect(siswa.streakCount).toBe(1);
    expect(siswa.modulSelesai).toContain('math-slope');
    expect(siswa.mastery.find((m) => m.moduleId === 'math-slope')?.masteryPersen).toBe(100);
  });

  it('persisten antar pembacaan (FR-010)', () => {
    selesaikanPelajaran('math-slope', 1);
    expect(bacaSiswa().lumens).toBe(20);
  });

  it('tidak menduplikasi modul pada daftar selesai', () => {
    selesaikanPelajaran('math-slope', 0);
    const { siswa } = selesaikanPelajaran('math-slope', 0);
    expect(siswa.modulSelesai.filter((m) => m === 'math-slope')).toHaveLength(1);
  });
});
