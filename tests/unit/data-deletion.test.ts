import { beforeEach, describe, expect, it } from 'vitest';
import { hapusSemuaDataSiswa } from '../../src/privacy/deleteAllData';
import { PRIVACY_SECTIONS } from '../../src/privacy/content';
import { saveLearnerProfile, type LearnerProfile } from '../../src/profile';
import { bacaSiswa, simpanSiswa } from '../../src/progress/store';
import { DEMO_PROGRESS_STORAGE_KEY, selesaikanPelajaranDemo } from '../../src/progress/demoStore';
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
    selesaikanPelajaranDemo('aljabar-pola-yang-tumbuh', 0);

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
    expect(localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY)).not.toBeNull();

    const freshProfile = await hapusSemuaDataSiswa();

    // Profil kembali ke default, bukan sekadar dihapus (agar aplikasi tetap
    // punya bentuk data yang valid setelahnya, bukan localStorage kosong).
    expect(freshProfile.displayName).toBe('');
    expect(freshProfile.onboardingComplete).toBe(false);

    const siswaBaru = bacaSiswa();
    expect(siswaBaru.lumens).toBe(0);
    expect(siswaBaru.modulSelesai).toEqual([]);
    expect(await telemetry.readAll()).toEqual([]);
    expect(localStorage.getItem(DEMO_PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('tidak melempar error saat ketiga kunci sudah kosong dari awal', async () => {
    await expect(hapusSemuaDataSiswa()).resolves.toBeDefined();
  });
});

/**
 * US6 spec 002 (T052, FR-013 × FR-018): keputusan cakupan ekspor 2026-08-11
 * menetapkan berkas ekspor memuat nama tampilan. Konsekuensinya wajib: siswa
 * dan orang tua MUST diberi tahu SEBELUM memutuskan membagikan berkas itu.
 *
 * Dikunci di sini karena kalimatnya hidup di konten, bukan di logika — persis
 * mode kegagalan yang ditutup T044 untuk peringatan hapus-data FR-020: teksnya
 * benar hari ini dan bisa hilang besok tanpa satu pun test protes.
 */
describe('kebijakan privasi menyatakan isi berkas ekspor (FR-013 × FR-018)', () => {
  const seluruhParagraf = PRIVACY_SECTIONS.flatMap((bagian) => bagian.paragraf).join(' ');

  it('menyebut berkas ekspor memuat nama tampilan', () => {
    expect(seluruhParagraf).toMatch(/ekspor/i);
    expect(seluruhParagraf).toMatch(/nama tampilan/i);

    const kalimatEkspor = PRIVACY_SECTIONS.flatMap((bagian) => bagian.paragraf).filter((p) =>
      /ekspor/i.test(p),
    );
    expect(kalimatEkspor.some((p) => /nama tampilan/i.test(p))).toBe(true);
  });

  it('memperingatkan sebelum berkas dibagikan ke orang lain', () => {
    expect(seluruhParagraf).toMatch(/sebelum mengirimkan|sebelum membagikan|ke orang lain/i);
  });
});
