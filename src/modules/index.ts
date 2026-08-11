import { daftarkanModul } from '../shell/registry';
import type { AnyLessonModule } from '../shell/types';
import { mathSlopeMeta } from './math-slope/meta';
import { physicsMotionMeta } from './physics-motion/meta';
import { econSupplyDemandMeta } from './econ-supply-demand/meta';
import { historyCausalChainMeta } from './history-causal-chain/meta';

/**
 * Registry modul LAZY — jalur produksi (US11 spec 002, T061-T062, FR-024/025,
 * R-013 research.md). Diimpor `main.tsx` dan layar listing (Atlas, Beranda,
 * Belajar, KursusDetail, HeaderNav, ProgressSummary).
 *
 * SENGAJA hanya mengimpor `meta.ts` tiap modul (id/subjectWorldId/judul/
 * conceptIds — data murni, tanpa komponen React) secara statis di sini.
 * Modul PENUH (VisualModel/UserAction/prompt/dst.) hanya diambil lewat
 * `import()` dinamis di `muatModul()`, saat benar-benar diakses siswa —
 * itulah yang membuat Vite memecah tiap modul jadi chunk terpisah, tidak
 * pernah masuk ke bundle awal (`src/modules/eager.ts` untuk kebalikannya,
 * dipakai test).
 */

export interface ModuleMeta {
  id: string;
  subjectWorldId: string;
  judul: string;
  conceptIds: readonly string[];
}

/** Metadata seluruh modul terdaftar — aman diimpor di mana pun untuk listing. */
export const MODULE_META: readonly ModuleMeta[] = [
  mathSlopeMeta,
  physicsMotionMeta,
  econSupplyDemandMeta,
  historyCausalChainMeta,
];

type ModuleLoader = () => Promise<AnyLessonModule>;

const MODULE_LOADERS: Record<string, ModuleLoader> = {
  'math-slope': () =>
    import('./math-slope').then((m) => m.mathSlopeModule as unknown as AnyLessonModule),
  'physics-motion': () =>
    import('./physics-motion').then((m) => m.physicsMotionModule as unknown as AnyLessonModule),
  'econ-supply-demand': () =>
    import('./econ-supply-demand').then(
      (m) => m.econSupplyDemandModule as unknown as AnyLessonModule,
    ),
  'history-causal-chain': () =>
    import('./history-causal-chain').then(
      (m) => m.historyCausalChainModule as unknown as AnyLessonModule,
    ),
};

const modulTervalidasi = new Map<string, AnyLessonModule>();

/**
 * Memuat SATU modul penuh — hanya dipanggil saat siswa benar-benar membuka
 * pelajarannya (mis. sebelum me-render `LessonShell`). Modul yang tidak
 * memenuhi kontrak tetap MELEMPAR `ModulTidakMemenuhiKontrakError` (Prinsip
 * II) lewat `daftarkanModul` di bawah — fail LOUD di titik akses ini, bukan
 * gagal diam-diam. Gerbang fail-FAST tetap ada di CI (`npm test` menjalankan
 * `daftarkanSemuaModul` dari `eager.ts` secara sinkron sebelum kode ini
 * pernah sampai ke siswa) — lihat catatan di `eager.ts`.
 */
export async function muatModul(id: string): Promise<AnyLessonModule> {
  const cached = modulTervalidasi.get(id);
  if (cached) return cached;

  const loader = MODULE_LOADERS[id];
  if (!loader) {
    throw new Error(`Modul "${id}" tidak dikenali di registry (tidak ada di MODULE_META)`);
  }

  const modul = await loader();
  daftarkanModul(modul);
  modulTervalidasi.set(id, modul);
  return modul;
}
