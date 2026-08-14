import { useState } from 'react';
import { Belajar } from '../courses/Belajar';
import { KursusDetail } from '../courses/KursusDetail';
import { ambilKursus, jalurUntukKursus } from '../courses/katalog';
import type { Siswa } from '../progress/store';

/**
 * Spec 004 (defer-lumera-atlas) US1 (T023 — perbaikan code-splitting): berkas
 * terpisah supaya `../courses/katalog` (katalog statis ~25KB) hanya masuk ke
 * chunk yang dimuat dinamis lewat `lazy()` di `StudentApp.tsx` — sama seperti
 * `IntegerCourseScreen` sudah dilakukan untuk runtime Rive (US11 spec 002,
 * R-013). `openKursusId` sengaja hidup di sini (bukan di `StudentApp`): begitu
 * siswa navigasi keluar dari route `learn`, komponen ini ikut unmount dan
 * state-nya otomatis hilang — tidak perlu reset manual terpisah.
 */
export function LearnRoute({
  siswa,
  onMulaiPelajaran,
}: {
  siswa: Siswa;
  onMulaiPelajaran: (moduleId: string) => void;
}) {
  const [openKursusId, setOpenKursusId] = useState<string | null>(null);

  if (openKursusId) {
    const kursus = ambilKursus(openKursusId);
    if (kursus) {
      return (
        <KursusDetail
          kursus={kursus}
          jalur={jalurUntukKursus(openKursusId)}
          siswa={siswa}
          onMulaiPelajaran={onMulaiPelajaran}
          onKembali={() => setOpenKursusId(null)}
        />
      );
    }
  }

  return <Belajar siswa={siswa} onBukaKursus={setOpenKursusId} />;
}
