import type { AttemptResult, VerifikasiKonten } from '../shell/types';
import type {
  CausalChainState,
  HistoryMistake,
  Peristiwa,
} from '../modules/history-causal-chain/scoring';

export const PERISTIWA: Peristiwa[] = [
  { id: 'tanam-paksa', teks: 'Pemerintah kolonial menerapkan sistem Tanam Paksa (1830)' },
  { id: 'penderitaan', teks: 'Petani kehilangan lahan pangan dan mengalami kelaparan' },
  { id: 'kritik-etis', teks: 'Kritik dari kalangan liberal Belanda menguat, termasuk lewat tulisan Multatuli' },
  { id: 'politik-etis', teks: 'Belanda menerapkan Politik Etis (1901)' },
];

/** Urutan awal sengaja diacak agar siswa benar-benar menyusun, bukan sekadar menekan kirim. */
export const stateAwal: CausalChainState = {
  urutan: ['kritik-etis', 'tanam-paksa', 'politik-etis', 'penderitaan'],
};

export const conceptIds = ['tanam-paksa', 'politik-etis', 'sebab-akibat-sejarah'];

export const prompt =
  'Empat peristiwa berikut saling berkaitan sebagai rantai sebab-akibat, tetapi urutannya masih tercampur. Susun dari sebab paling awal hingga akibat paling akhir.';

export const pertanyaanRefleksi =
  'Menurutmu, apakah Politik Etis akan tetap muncul kalau kritik terhadap Tanam Paksa tidak pernah menguat? Kenapa?';

export function penjelasanKenapa(hasil: AttemptResult): string {
  const dasar =
    'Rantai sebab-akibatnya: Tanam Paksa (1830) memaksa petani menanam komoditas ekspor → lahan pangan berkurang sehingga terjadi kelaparan → penderitaan itu memicu kritik kalangan liberal Belanda, terutama lewat "Max Havelaar" → tekanan kritik tersebut melahirkan Politik Etis (1901).';

  if (hasil.benar) {
    return `${dasar} Perhatikan bahwa setiap peristiwa menjadi syarat munculnya peristiwa berikutnya — itulah yang membedakan sebab-akibat dari sekadar urutan waktu.`;
  }

  switch (hasil.mistakeType as HistoryMistake) {
    case 'urutan_terbalik':
      return `${dasar} Urutanmu terbalik — kamu menempatkan akibat lebih dulu daripada sebabnya. Politik Etis adalah respons atas kritik, bukan pemicunya.`;
    case 'satu_tertukar':
      return `${dasar} Hampir tepat: hanya sepasang peristiwa yang tertukar. Periksa mana yang lebih dulu terjadi antara penderitaan petani dan munculnya kritik.`;
    default:
      return `${dasar} Coba mulai dari pertanyaan "peristiwa mana yang tidak disebabkan oleh peristiwa lain di daftar ini?" — itulah awal rantainya.`;
  }
}

export const verifikasi: VerifikasiKonten = {
  rujukanCP:
    'Fase E Sejarah — Kolonialisme dan Pergerakan Nasional: peserta didik dapat menganalisis hubungan sebab-akibat antarperistiwa pada masa kolonial di Indonesia.',
  penulis: 'tim-kurikulum-lumera',
  reviewer: 'reviewer-pedagogi-sejarah',
  tanggalVerifikasi: '2026-07-29',
};
