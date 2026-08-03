import { daftarkanModul } from '../shell/registry';
import { mathSlopeModule } from './math-slope';
import { physicsMotionModule } from './physics-motion';
import { econSupplyDemandModule } from './econ-supply-demand';
import { historyCausalChainModule } from './history-causal-chain';

/**
 * Pendaftaran keempat modul. Registry akan MELEMPAR jika ada modul yang tidak
 * memenuhi kontrak — jadi aplikasi gagal keras saat start, bukan diam-diam
 * merilis modul yang melewatkan langkah atau belum diverifikasi kontennya.
 */
export function daftarkanSemuaModul(): void {
  daftarkanModul(mathSlopeModule);
  daftarkanModul(physicsMotionModule);
  daftarkanModul(econSupplyDemandModule);
  daftarkanModul(historyCausalChainModule);
}
