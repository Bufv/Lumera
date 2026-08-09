import { describe, expect, it } from 'vitest';
import {
  TARGET_AKTIVITAS_HARIAN,
  TITIK_KEKUATAN,
  aktivitasHariIni,
  aktivitasTerakhir,
  keTanggalLokal,
  labelWaktuRelatif,
  sapaanWaktu,
  stripStreak,
  tingkatKekuatan,
} from '../../src/beranda/harian';
import type { CatatanMastery, Siswa } from '../../src/progress/store';

/**
 * Angka di Beranda harus berasal dari data yang benar-benar terlacak.
 * Tes ini mengunci perhitungannya agar tidak diam-diam berubah jadi angka hias.
 */

function siswa(patch: Partial<Siswa> = {}): Siswa {
  return {
    schemaVersion: 1,
    id: 'uji',
    lumens: 0,
    streakCount: 0,
    streakLastDate: null,
    mastery: [],
    modulSelesai: [],
    ...patch,
  };
}

function rec(moduleId: string, persen: number, tanggal: string): CatatanMastery {
  return { moduleId, masteryPersen: persen, skorTerakhir: [persen], diperbaruiPada: tanggal };
}

describe('sapaanWaktu', () => {
  it('memilih sapaan sesuai jam lokal', () => {
    expect(sapaanWaktu(7)).toBe('Selamat pagi');
    expect(sapaanWaktu(12)).toBe('Selamat siang');
    expect(sapaanWaktu(16)).toBe('Selamat sore');
    expect(sapaanWaktu(21)).toBe('Selamat malam');
  });
});

describe('keTanggalLokal', () => {
  it('meneruskan format YYYY-MM-DD apa adanya', () => {
    expect(keTanggalLokal('2026-08-04')).toBe('2026-08-04');
  });

  it('memangkas timestamp ISO penuh menjadi tanggal', () => {
    expect(keTanggalLokal('2026-08-04T13:20:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('aktivitasHariIni', () => {
  it('hanya menghitung pelajaran yang dikerjakan pada tanggal tersebut', () => {
    const s = siswa({
      mastery: [
        rec('a', 80, '2026-08-04'),
        rec('b', 60, '2026-08-04'),
        rec('c', 40, '2026-08-03'),
      ],
    });
    expect(aktivitasHariIni(s, '2026-08-04')).toBe(2);
  });

  it('nol untuk siswa tanpa riwayat', () => {
    expect(aktivitasHariIni(siswa(), '2026-08-04')).toBe(0);
    expect(TARGET_AKTIVITAS_HARIAN).toBeGreaterThan(0);
  });
});

describe('stripStreak', () => {
  it('selalu mengembalikan 7 hari, berakhir di hari ini', () => {
    const strip = stripStreak(siswa(), '2026-08-04');
    expect(strip).toHaveLength(7);
    expect(strip[6]?.tanggal).toBe('2026-08-04');
    expect(strip[6]?.hariIni).toBe(true);
    expect(strip[0]?.tanggal).toBe('2026-07-29');
  });

  it('menandai persis sebanyak streakCount hari saat streak masih berjalan', () => {
    const s = siswa({ streakCount: 3, streakLastDate: '2026-08-04' });
    const terisi = stripStreak(s, '2026-08-04').filter((h) => h.terisi);
    expect(terisi.map((h) => h.tanggal)).toEqual(['2026-08-02', '2026-08-03', '2026-08-04']);
  });

  it('tidak menandai hari apa pun saat siswa belum punya streak', () => {
    expect(stripStreak(siswa(), '2026-08-04').some((h) => h.terisi)).toBe(false);
  });

  it('tidak memoles streak yang sudah putus — hari ini tetap kosong', () => {
    // Terakhir belajar 2 hari lalu; hari ini belum, jadi hari ini tidak boleh tercentang.
    const s = siswa({ streakCount: 2, streakLastDate: '2026-08-02' });
    const strip = stripStreak(s, '2026-08-04');
    expect(strip.find((h) => h.hariIni)?.terisi).toBe(false);
    expect(strip.filter((h) => h.terisi).map((h) => h.tanggal)).toEqual([
      '2026-08-01',
      '2026-08-02',
    ]);
  });
});

describe('tingkatKekuatan', () => {
  it('membedakan belum dimulai dari nilai nol', () => {
    expect(tingkatKekuatan(null).terisi).toBe(0);
    expect(tingkatKekuatan(null).label).toBe('Belum dimulai');
  });

  it('memberi label sesuai ambang penguasaan', () => {
    expect(tingkatKekuatan(20).label).toBe('Perlu diulang');
    expect(tingkatKekuatan(50).label).toBe('Mulai pudar');
    expect(tingkatKekuatan(70).label).toBe('Stabil');
    expect(tingkatKekuatan(90).label).toBe('Kuat');
  });

  it('menjaga jumlah titik dalam rentang 1..TITIK_KEKUATAN untuk skor apa pun', () => {
    for (const persen of [1, 20, 55, 80, 100]) {
      const { terisi } = tingkatKekuatan(persen);
      expect(terisi).toBeGreaterThanOrEqual(1);
      expect(terisi).toBeLessThanOrEqual(TITIK_KEKUATAN);
    }
  });
});

describe('labelWaktuRelatif', () => {
  it('menamai jarak hari dalam bahasa sehari-hari', () => {
    expect(labelWaktuRelatif('2026-08-04', '2026-08-04')).toBe('Hari ini');
    expect(labelWaktuRelatif('2026-08-03', '2026-08-04')).toBe('Kemarin');
    expect(labelWaktuRelatif('2026-08-01', '2026-08-04')).toBe('3 hari lalu');
    expect(labelWaktuRelatif('2026-07-25', '2026-08-04')).toBe('1 minggu lalu');
  });
});

describe('aktivitasTerakhir', () => {
  const judul = new Map([
    ['a', 'Membaca Kemiringan'],
    ['b', 'Gerak Lurus'],
  ]);

  it('mengurutkan dari yang paling baru dan membatasi jumlahnya', () => {
    const s = siswa({
      mastery: [rec('a', 80, '2026-08-01'), rec('b', 60, '2026-08-04')],
    });
    const hasil = aktivitasTerakhir(s, judul, 1, '2026-08-04');
    expect(hasil).toHaveLength(1);
    expect(hasil[0]?.moduleId).toBe('b');
    expect(hasil[0]?.judul).toBe('Gerak Lurus');
    expect(hasil[0]?.labelWaktu).toBe('Hari ini');
  });

  it('memakai moduleId sebagai cadangan bila judulnya tidak dikenal', () => {
    const s = siswa({ mastery: [rec('entah', 50, '2026-08-04')] });
    expect(aktivitasTerakhir(s, judul, 3, '2026-08-04')[0]?.judul).toBe('entah');
  });
});
