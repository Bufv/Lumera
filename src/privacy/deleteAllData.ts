import { resetLearnerProfile, type LearnerProfile } from '../profile';
import { resetProgres } from '../progress/store';
import { telemetry } from '../telemetry/adapter';

/**
 * US6 spec 002 (T030, FR-015): hapus SEMUA data lokal siswa dalam satu aksi —
 * profil (preferensi onboarding), progres (Lumens/streak/mastery), DAN
 * telemetry (catatan aktivitas belajar). `resetLearnerProfile()` sendirian
 * (dipakai alur "ulangi onboarding" yang sudah ada) sengaja HANYA menyentuh
 * profil — ini fungsi terpisah, bukan pengganti, agar kedua aksi tetap bisa
 * dibedakan maknanya oleh UI (T030 note di tasks.md).
 *
 * Mengembalikan profil default yang baru agar pemanggil dapat memperbarui
 * state React-nya tanpa perlu memanggil resetLearnerProfile() kedua kalinya.
 */
export async function hapusSemuaDataSiswa(): Promise<LearnerProfile> {
  const freshProfile = resetLearnerProfile();
  resetProgres();
  await telemetry.clear();
  return freshProfile;
}
