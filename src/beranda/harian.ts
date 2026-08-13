/**
 * Perhitungan yang menggerakkan Beranda harian.
 *
 * Semua angka di sini WAJIB berasal dari data yang benar-benar terlacak
 * (mastery, streak, Lumens). Mockup memuat metrik seperti "20 menit waktu belajar"
 * yang belum diinstrumentasi — metrik semacam itu diganti, bukan dikarang.
 * Lihat docs/rencana-redesain.md §4.
 */

import { tanggalLokal } from '../progress/streak';
import { color } from '../design/tokens';
import type { Siswa } from '../progress/store';

/** Berapa pelajaran per hari yang dianggap "target tercapai". */
export const TARGET_AKTIVITAS_HARIAN = 3;

const NAMA_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;

/** Menormalkan `diperbaruiPada` (ISO penuh atau YYYY-MM-DD) ke tanggal lokal. */
export function keTanggalLokal(nilai: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(nilai)) return nilai;
  const d = new Date(nilai);
  return Number.isNaN(d.getTime()) ? nilai.slice(0, 10) : tanggalLokal(d);
}

function selisihHari(dariISO: string, keISO: string): number {
  const [ay = 0, am = 1, ad = 1] = dariISO.split('-').map(Number);
  const [by = 0, bm = 1, bd = 1] = keISO.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export function sapaanWaktu(jam: number): string {
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/** Jumlah pelajaran yang dikerjakan pada tanggal `hariIni`. */
export function aktivitasHariIni(siswa: Siswa, hariIni: string = tanggalLokal()): number {
  return siswa.mastery.filter((m) => keTanggalLokal(m.diperbaruiPada) === hariIni).length;
}

export interface HariStreak {
  /** Sen, Sel, … */
  label: string;
  tanggal: string;
  /** true bila hari itu tercakup rentetan streak yang sedang berjalan. */
  terisi: boolean;
  hariIni: boolean;
}

/**
 * Tujuh hari terakhir (paling lama → hari ini), ditandai mana yang tercakup streak.
 *
 * Streak berjalan dari `streakLastDate` mundur sebanyak `streakCount - 1` hari.
 * Kalau `streakLastDate` sudah lewat dari hari ini, rentetannya tetap ditampilkan
 * apa adanya — streak yang putus tidak dipoles jadi terlihat utuh.
 */
export function stripStreak(siswa: Siswa, hariIni: string = tanggalLokal()): HariStreak[] {
  const akhir = siswa.streakLastDate;
  const hari: HariStreak[] = [];

  for (let mundur = 6; mundur >= 0; mundur -= 1) {
    const [y = 0, m = 1, d = 1] = hariIni.split('-').map(Number);
    const tgl = new Date(Date.UTC(y, m - 1, d - mundur));
    const iso = tgl.toISOString().slice(0, 10);

    let terisi = false;
    if (akhir && siswa.streakCount > 0) {
      const jarakDariAkhir = selisihHari(iso, akhir);
      terisi = jarakDariAkhir >= 0 && jarakDariAkhir <= siswa.streakCount - 1;
    }

    hari.push({
      label: NAMA_HARI[tgl.getUTCDay()] ?? '',
      tanggal: iso,
      terisi,
      hariIni: mundur === 0,
    });
  }

  return hari;
}

export interface Kekuatan {
  label: string;
  warna: string;
  /** 0–5, untuk deretan titik kekuatan. */
  terisi: number;
}

export const TITIK_KEKUATAN = 5;

/** Menerjemahkan mastery % menjadi label + warna + jumlah titik. */
export function tingkatKekuatan(masteryPersen: number | null): Kekuatan {
  if (masteryPersen === null) {
    return { label: 'Belum dimulai', warna: color.inkFaint, terisi: 0 };
  }

  const terisi = Math.min(TITIK_KEKUATAN, Math.max(1, Math.ceil(masteryPersen / 20)));

  if (masteryPersen < 40) return { label: 'Perlu diulang', warna: color.lemah, terisi };
  if (masteryPersen < 60) return { label: 'Mulai pudar', warna: color.pudar, terisi };
  if (masteryPersen < 80) return { label: 'Stabil', warna: color.stabil, terisi };
  return { label: 'Kuat', warna: color.kuat, terisi };
}

export interface Aktivitas {
  moduleId: string;
  judul: string;
  masteryPersen: number;
  tanggal: string;
  /** "Hari ini" / "Kemarin" / "3 hari lalu" */
  labelWaktu: string;
}

export function labelWaktuRelatif(tanggal: string, hariIni: string = tanggalLokal()): string {
  const selisih = selisihHari(tanggal, hariIni);
  if (selisih <= 0) return 'Hari ini';
  if (selisih === 1) return 'Kemarin';
  if (selisih < 7) return `${selisih} hari lalu`;
  if (selisih < 30) return `${Math.floor(selisih / 7)} minggu lalu`;
  return `${Math.floor(selisih / 30)} bulan lalu`;
}

/**
 * Riwayat pelajaran terakhir yang dikerjakan, terbaru dulu.
 *
 * Ini menempati slot "Baru disimpan" pada mockup. Knowledge Bank belum dibangun,
 * jadi slot itu diisi riwayat nyata alih-alih daftar simpanan fiktif.
 */
export function aktivitasTerakhir(
  siswa: Siswa,
  judulModul: Map<string, string>,
  batas = 3,
  hariIni: string = tanggalLokal(),
): Aktivitas[] {
  return [...siswa.mastery]
    .map((m) => ({ m, tanggal: keTanggalLokal(m.diperbaruiPada) }))
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : 0))
    .slice(0, batas)
    .map(({ m, tanggal }) => ({
      moduleId: m.moduleId,
      judul: judulModul.get(m.moduleId) ?? m.moduleId,
      masteryPersen: m.masteryPersen,
      tanggal,
      labelWaktu: labelWaktuRelatif(tanggal, hariIni),
    }));
}
