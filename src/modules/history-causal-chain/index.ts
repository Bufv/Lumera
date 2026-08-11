import type { LessonModule } from '../../shell/types';
import { CausalChainVisualModel } from './VisualModel';
import { CausalChainUserAction } from './UserAction';
import { nilaiUrutan, type CausalChainState } from './scoring';
import * as konten from '../../content/history-causal-chain';
import { historyCausalChainMeta } from './meta';

export const historyCausalChainModule: LessonModule<CausalChainState, string[]> = {
  ...historyCausalChainMeta,

  prompt: konten.prompt,
  pertanyaanRefleksi: konten.pertanyaanRefleksi,
  penjelasanKenapa: konten.penjelasanKenapa,

  initialState: konten.stateAwal,
  nilai: (jawaban) => nilaiUrutan(jawaban),

  VisualModel: CausalChainVisualModel,
  UserAction: CausalChainUserAction,

  verifikasi: konten.verifikasi,
};
