import type { LessonModule } from '../../shell/types';
import { MotionVisualModel } from './VisualModel';
import { NumericAnswer } from '../shared/NumericAnswer';
import { nilaiJarak, type MotionState } from './scoring';
import * as konten from '../../content/physics-motion';

export const physicsMotionModule: LessonModule<MotionState, number> = {
  id: 'physics-motion',
  subjectWorldId: 'sains',
  judul: 'Simulasi Gerak Lurus',
  conceptIds: konten.conceptIds,

  prompt: konten.prompt,
  pertanyaanRefleksi: konten.pertanyaanRefleksi,
  penjelasanKenapa: konten.penjelasanKenapa,

  initialState: konten.stateAwal,
  nilai: (jawaban, state) => nilaiJarak(jawaban, state),

  VisualModel: MotionVisualModel,
  UserAction: ({ onSubmit, disabled }) => (
    <NumericAnswer
      label="Berapa jarak yang ditempuh setelah 5 detik?"
      satuan="meter"
      placeholder="contoh: 30"
      disabled={disabled}
      onSubmit={onSubmit}
    />
  ),

  verifikasi: konten.verifikasi,
};
