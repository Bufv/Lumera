import type { LessonModule } from '../../shell/types';
import { SlopeVisualModel } from './VisualModel';
import { SlopeUserAction } from './UserAction';
import { nilaiKemiringan, type SlopeState } from './scoring';
import * as konten from '../../content/math-slope';
import { mathSlopeMeta } from './meta';

export const mathSlopeModule: LessonModule<SlopeState, number> = {
  ...mathSlopeMeta,

  prompt: konten.prompt,
  pertanyaanRefleksi: konten.pertanyaanRefleksi,
  penjelasanKenapa: konten.penjelasanKenapa,

  initialState: konten.stateAwal,
  nilai: (jawaban, state) => nilaiKemiringan(jawaban, state),

  VisualModel: SlopeVisualModel,
  UserAction: SlopeUserAction,

  verifikasi: konten.verifikasi,
};
