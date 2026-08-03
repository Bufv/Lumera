import { describe, expect, it } from 'vitest';
import {
  URUTAN_BENAR,
  nilaiUrutan,
  pindahkan,
} from '../../src/modules/history-causal-chain/scoring';

describe('validasi urutan sebab-akibat', () => {
  it('menerima urutan yang benar', () => {
    expect(nilaiUrutan([...URUTAN_BENAR])).toEqual({ benar: true, mistakeType: null });
  });

  it('mengenali urutan yang sepenuhnya terbalik', () => {
    expect(nilaiUrutan([...URUTAN_BENAR].reverse()).mistakeType).toBe('urutan_terbalik');
  });

  it('mengenali sepasang berdekatan yang tertukar', () => {
    const u = [...URUTAN_BENAR];
    [u[1], u[2]] = [u[2]!, u[1]!];
    expect(nilaiUrutan(u).mistakeType).toBe('satu_tertukar');
  });

  it('mengenali urutan acak', () => {
    const u = ['politik-etis', 'penderitaan', 'tanam-paksa', 'kritik-etis'];
    expect(nilaiUrutan(u).mistakeType).toBe('urutan_acak');
  });

  it('SELALU mengisi mistakeType saat jawaban salah', () => {
    const kandidat = [
      ['tanam-paksa', 'kritik-etis', 'penderitaan', 'politik-etis'],
      ['penderitaan', 'tanam-paksa', 'kritik-etis', 'politik-etis'],
      ['politik-etis', 'kritik-etis', 'penderitaan', 'tanam-paksa'],
    ];
    for (const u of kandidat) {
      const h = nilaiUrutan(u);
      if (!h.benar) expect(h.mistakeType).toBeTruthy();
    }
  });
});

describe('pindahkan() — dipakai jalur drag MAUPUN non-drag', () => {
  it('memindahkan item ke atas', () => {
    expect(pindahkan(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('memindahkan item ke bawah', () => {
    expect(pindahkan(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('menukar dua item berdekatan (jalur tombol ↑ ↓)', () => {
    expect(pindahkan(['a', 'b', 'c'], 1, 0)).toEqual(['b', 'a', 'c']);
  });

  it('mengembalikan daftar apa adanya untuk indeks tidak valid', () => {
    const d = ['a', 'b', 'c'];
    expect(pindahkan(d, 0, 0)).toEqual(d);
    expect(pindahkan(d, -1, 1)).toEqual(d);
    expect(pindahkan(d, 0, 9)).toEqual(d);
  });

  it('tidak mengubah daftar asal (murni)', () => {
    const d = ['a', 'b', 'c'];
    pindahkan(d, 0, 2);
    expect(d).toEqual(['a', 'b', 'c']);
  });
});
