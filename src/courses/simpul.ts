/**
 * Geometri kolom pelajaran.
 *
 * Halaman kursus di `docs/sample/brilliant/` menyusun pelajaran sebagai simpul
 * yang berkelok kiri–kanan di dalam satu kolom sempit (392px), bukan sebagai
 * peta lebar. Label duduk di samping simpul, berganti sisi mengikuti kelokan.
 *
 * Semua ukuran di sini adalah koordinat SVG; komponen merendernya dengan lebar
 * 100% sehingga kolomnya ikut menyesuaikan layar.
 */

export const LEBAR_KOLOM = 392;
export const UKURAN_SIMPUL = 112;

const LANGKAH_Y = UKURAN_SIMPUL + 56;
const MARGIN_ATAS = UKURAN_SIMPUL / 2 + 10;
const MARGIN_BAWAH = UKURAN_SIMPUL / 2 + 28;

/** Tiga jalur horizontal; kelokannya bersiklus tengah → kiri → tengah → kanan. */
const X: Record<PosisiSimpul, number> = { kiri: 92, tengah: 196, kanan: 300 };
const SIKLUS: PosisiSimpul[] = ['tengah', 'kiri', 'tengah', 'kanan'];

export type PosisiSimpul = 'kiri' | 'tengah' | 'kanan';

export interface Simpul {
  x: number;
  y: number;
  posisi: PosisiSimpul;
  /** Label dipasang di seberang kelokan supaya tidak menabrak tepi kolom. */
  labelDiKanan: boolean;
}

export interface JalurSimpul {
  simpul: Simpul[];
  /** Path SVG yang menyambung seluruh simpul. */
  d: string;
  lebar: number;
  tinggi: number;
}

/**
 * Catmull-Rom → kubik Bezier. Sambungan antarsimpul harus melengkung mulus;
 * garis patah membuat kolomnya terbaca sebagai daftar, bukan perjalanan.
 */
export function kurvaMulus(titik: { x: number; y: number }[]): string {
  if (titik.length === 0) return '';
  const awal = titik[0]!;
  if (titik.length === 1) return `M${awal.x} ${awal.y}`;

  let d = `M${awal.x} ${awal.y}`;
  for (let i = 0; i < titik.length - 1; i += 1) {
    const p0 = titik[i - 1] ?? titik[i]!;
    const p1 = titik[i]!;
    const p2 = titik[i + 1]!;
    const p3 = titik[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C${bulat(c1x)} ${bulat(c1y)} ${bulat(c2x)} ${bulat(c2y)} ${bulat(p2.x)} ${bulat(p2.y)}`;
  }
  return d;
}

function bulat(n: number): number {
  return Math.round(n * 10) / 10;
}

export function jalurSimpul(jumlah: number): JalurSimpul {
  if (jumlah <= 0) {
    return { simpul: [], d: '', lebar: LEBAR_KOLOM, tinggi: MARGIN_ATAS + MARGIN_BAWAH };
  }

  const simpul: Simpul[] = Array.from({ length: jumlah }, (_, i) => {
    const posisi = SIKLUS[i % SIKLUS.length]!;
    return {
      x: X[posisi],
      y: MARGIN_ATAS + i * LANGKAH_Y,
      posisi,
      labelDiKanan: posisi !== 'kanan',
    };
  });

  return {
    simpul,
    d: kurvaMulus(simpul),
    lebar: LEBAR_KOLOM,
    tinggi: MARGIN_ATAS + (jumlah - 1) * LANGKAH_Y + MARGIN_BAWAH,
  };
}

/** Posisi simpul dalam persen kanvas, untuk menaruh elemen HTML di atas SVG. */
export function persenSimpul(simpul: Simpul, tinggi: number): { kiri: number; atas: number } {
  return {
    kiri: (simpul.x / LEBAR_KOLOM) * 100,
    atas: (simpul.y / tinggi) * 100,
  };
}
