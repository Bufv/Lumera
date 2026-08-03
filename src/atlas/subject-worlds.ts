export interface SubjectWorld {
  id: string;
  /** Terminologi produk resmi (FR-019). */
  nama: string;
  moduleIds: string[];
  /** id subject world lain yang terhubung secara visual (FR-001). */
  connections: string[];
  /** Posisi node pada peta, dalam persen viewBox. */
  x: number;
  y: number;
}

/**
 * Node Atlas untuk prototype ini. Statis — graph engine adalah kebutuhan
 * Knowledge Bank Graph View, yang berada di luar cakupan spec ini.
 */
export const SUBJECT_WORLDS: SubjectWorld[] = [
  {
    id: 'matematika',
    nama: 'Matematika',
    moduleIds: ['math-slope'],
    connections: ['sains', 'ekonomi'],
    x: 26,
    y: 32,
  },
  {
    id: 'sains',
    nama: 'Sains',
    moduleIds: ['physics-motion'],
    connections: ['matematika'],
    x: 68,
    y: 22,
  },
  {
    id: 'ekonomi',
    nama: 'Ekonomi & Bisnis',
    moduleIds: ['econ-supply-demand'],
    connections: ['matematika', 'sejarah'],
    x: 34,
    y: 72,
  },
  {
    id: 'sejarah',
    nama: 'Sejarah & Sosial',
    moduleIds: ['history-causal-chain'],
    connections: ['ekonomi'],
    x: 74,
    y: 66,
  },
];
