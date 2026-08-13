import { beforeEach, describe, expect, it } from 'vitest';
import { hapusSemuaDataSiswa } from '../../src/privacy/deleteAllData';
import { saveLearnerProfile, type LearnerProfile } from '../../src/profile';
import { bacaSiswa, simpanSiswa } from '../../src/progress/store';
import { telemetry } from '../../src/telemetry/adapter';

/**
 * US6 spec 002 (T031, FR-015): "hapus semua data saya" MUST mengosongkan
 * ketiga kunci storage sekaligus — profil, progres, DAN telemetry — bukan
 * hanya salah satunya seperti resetLearnerProfile() sendirian.
 */
describe('hapusSemuaDataSiswa', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mengosongkan profil, progres, dan telemetry sekaligus', async () => {
    // Isi ketiga kunci dengan data fixture terlebih dulu.
    saveLearnerProfile({
      schemaVersion: 1,
      displayName: 'Ardi',
      stage: 'smp',
      grade: 7,
      goal: 'support-school',
      focusSubjectId: 'matematika',
      dailyMinutes: 20,
      studyDays: ['monday'],
      onboardingStep: 'complete',
      onboardingComplete: true,
      reduceMotion: false,
    } satisfies LearnerProfile);

    const siswa = bacaSiswa();
    simpanSiswa({ ...siswa, lumens: 120, streakCount: 4, modulSelesai: ['math-slope'] });

    await telemetry.record({
      type: 'lesson_completed',
      eventId: 'evt-1',
      siswaId: siswa.id,
      moduleId: 'math-slope',
      conceptIds: ['kemiringan-grafik'],
      mistakes: [],
      durasiMs: 5000,
      selesaiPada: new Date().toISOString(),
      schemaVersion: 1,
    });

    expect(localStorage.getItem('lumera.profile.v1')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem('lumera.progress.v1')!).lumens).toBe(120);
    expect(await telemetry.readAll()).toHaveLength(1);

    const freshProfile = await hapusSemuaDataSiswa();

    // Profil kembali ke default, bukan sekadar dihapus (agar aplikasi tetap
    // punya bentuk data yang valid setelahnya, bukan localStorage kosong).
    expect(freshProfile.displayName).toBe('');
    expect(freshProfile.onboardingComplete).toBe(false);

    const siswaBaru = bacaSiswa();
    expect(siswaBaru.lumens).toBe(0);
    expect(siswaBaru.modulSelesai).toEqual([]);
    expect(await telemetry.readAll()).toEqual([]);
  });

  it('tidak melempar error saat ketiga kunci sudah kosong dari awal', async () => {
    await expect(hapusSemuaDataSiswa()).resolves.toBeDefined();
  });
});
