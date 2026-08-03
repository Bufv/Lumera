import type { LessonModule } from '../../shell/types';
import { SupplyDemandVisualModel } from './VisualModel';
import { NumericAnswer } from '../shared/NumericAnswer';
import { nilaiHargaEkuilibrium, type SupplyDemandState } from './scoring';
import * as konten from '../../content/econ-supply-demand';

export const econSupplyDemandModule: LessonModule<SupplyDemandState, number> = {
  id: 'econ-supply-demand',
  subjectWorldId: 'ekonomi',
  judul: 'Supply & Demand Simulator',
  conceptIds: konten.conceptIds,

  prompt: konten.prompt,
  pertanyaanRefleksi: konten.pertanyaanRefleksi,
  penjelasanKenapa: konten.penjelasanKenapa,

  initialState: konten.stateAwal,
  nilai: (jawaban, state) => nilaiHargaEkuilibrium(jawaban, state),

  VisualModel: SupplyDemandVisualModel,
  UserAction: ({ onSubmit, disabled }) => (
    <NumericAnswer
      label="Berapa harga ekuilibrium pasar ini?"
      placeholder="contoh: 25"
      disabled={disabled}
      onSubmit={onSubmit}
    />
  ),

  verifikasi: konten.verifikasi,
};
