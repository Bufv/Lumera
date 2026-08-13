import type { AttemptResult, VerifikasiKonten } from '../shell/types';
import type { EconMistake, SupplyDemandState } from '../modules/econ-supply-demand/scoring';
import { hitungEkuilibrium } from '../modules/econ-supply-demand/scoring';

export const stateAwal: SupplyDemandState = {
  demandIntercept: 50,
  demandSlope: 2,
  supplyIntercept: 10,
  supplySlope: 2,
};

export const conceptIds = ['ekuilibrium-pasar', 'kurva-permintaan', 'kurva-penawaran'];

export const prompt =
  'Kurva permintaan turun dari harga 50, kurva penawaran naik dari harga 10. Geser kedua kurva untuk melihat bagaimana titik potongnya berpindah, lalu kembalikan ke posisi awal dan tentukan harga ekuilibriumnya.';

export const pertanyaanRefleksi =
  'Kalau penawaran bergeser naik (produsen minta harga lebih tinggi) sementara permintaan tetap, ke mana harga ekuilibrium bergerak dan kenapa?';

export function penjelasanKenapa(hasil: AttemptResult): string {
  const e = hitungEkuilibrium(stateAwal);
  const dasar = `Ekuilibrium terjadi saat harga yang diminta sama dengan harga yang ditawarkan: 50 − 2Q = 10 + 2Q → 40 = 4Q → Q = ${e.kuantitas}, sehingga P = 10 + 2×${e.kuantitas} = ${e.harga}.`;

  if (hasil.benar) {
    return `${dasar} Di titik inilah jumlah yang ingin dibeli persis sama dengan jumlah yang ingin dijual — tidak ada kelebihan maupun kekurangan barang.`;
  }

  switch (hasil.mistakeType as EconMistake) {
    case 'baca_kuantitas':
      return `${dasar} Angka ${e.kuantitas} adalah kuantitas ekuilibrium (sumbu mendatar). Yang ditanyakan adalah harganya, yang dibaca pada sumbu tegak.`;
    case 'pakai_intercept_demand':
      return `${dasar} Angka 50 adalah harga tertinggi pada kurva permintaan — harga saat kuantitas nol, bukan titik potong kedua kurva.`;
    case 'pakai_intercept_supply':
      return `${dasar} Angka 10 adalah harga terendah yang mau diterima produsen saat kuantitas nol, bukan harga ekuilibrium.`;
    default:
      return `${dasar} Perhatikan titik hijau pada grafik: di sanalah kedua kurva berpotongan.`;
  }
}

export const verifikasi: VerifikasiKonten = {
  rujukanCP:
    'Fase E Ekonomi — Permintaan dan Penawaran: peserta didik dapat menganalisis terbentuknya harga keseimbangan pasar.',
  penulis: 'tim-kurikulum-lumera',
  reviewer: 'reviewer-pedagogi-ekonomi',
  tanggalVerifikasi: '2026-07-29',
};
