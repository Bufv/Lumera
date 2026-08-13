import { daftarkanModul } from '../shell/registry';
import { mathSlopeModule } from './math-slope';
import { physicsMotionModule } from './physics-motion';
import { econSupplyDemandModule } from './econ-supply-demand';
import { historyCausalChainModule } from './history-causal-chain';

/**
 * Pendaftaran EAGER — mengimpor seluruh 4 modul penuh (termasuk
 * `VisualModel`/`UserAction`) secara statis dan sinkron.
 *
 * HANYA untuk test/CI (`tests/unit/modules-registration.test.ts`,
 * `tests/unit/layar-belajar.test.tsx`, `tests/unit/a11y.test.tsx`) yang butuh
 * gerbang fail-fast Prinsip II tervalidasi penuh di setiap `npm test` — file
 * ini SENGAJA TIDAK pernah diimpor oleh `main.tsx` atau `src/modules/index.ts`
 * manapun yang bisa dijangkau dari entry point produksi. Jika file ini
 * diimpor dari sana, seluruh 4 modul (termasuk komponen React-nya) akan
 * kembali masuk ke bundle awal dan meniadakan tujuan code-splitting US11
 * (spec 002, R-013) — lihat `src/modules/index.ts` untuk jalur lazy produksi.
 */
export function daftarkanSemuaModul(): void {
  daftarkanModul(mathSlopeModule);
  daftarkanModul(physicsMotionModule);
  daftarkanModul(econSupplyDemandModule);
  daftarkanModul(historyCausalChainModule);
}
