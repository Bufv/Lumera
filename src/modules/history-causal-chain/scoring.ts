export interface Peristiwa {
  id: string;
  teks: string;
}

export interface CausalChainState {
  /** Urutan id peristiwa seperti yang disusun siswa saat ini. */
  urutan: string[];
}

export type HistoryMistake =
  | 'urutan_terbalik' // menyusun akibat → sebab
  | 'satu_tertukar' // hanya sepasang berdekatan yang tertukar
  | 'urutan_acak';

/** Urutan sebab→akibat yang benar. */
export const URUTAN_BENAR = ['tanam-paksa', 'penderitaan', 'kritik-etis', 'politik-etis'] as const;

export function nilaiUrutan(
  jawaban: string[],
  benarnya: readonly string[] = URUTAN_BENAR,
): { benar: boolean; mistakeType: HistoryMistake | null } {
  const cocok = jawaban.length === benarnya.length && jawaban.every((id, i) => id === benarnya[i]);
  if (cocok) return { benar: true, mistakeType: null };

  const terbalik = [...benarnya].reverse();
  if (jawaban.length === terbalik.length && jawaban.every((id, i) => id === terbalik[i])) {
    return { benar: false, mistakeType: 'urutan_terbalik' };
  }

  // Berapa posisi yang salah? Tepat dua posisi salah = sepasang tertukar.
  const salah = jawaban.filter((id, i) => id !== benarnya[i]).length;
  if (salah === 2) return { benar: false, mistakeType: 'satu_tertukar' };

  return { benar: false, mistakeType: 'urutan_acak' };
}

/** Memindahkan satu item — dipakai baik oleh drag maupun jalur alternatif non-drag. */
export function pindahkan<T>(daftar: T[], dari: number, ke: number): T[] {
  if (dari === ke || dari < 0 || ke < 0 || dari >= daftar.length || ke >= daftar.length) {
    return daftar;
  }
  const salinan = [...daftar];
  const [item] = salinan.splice(dari, 1);
  if (item !== undefined) salinan.splice(ke, 0, item);
  return salinan;
}
