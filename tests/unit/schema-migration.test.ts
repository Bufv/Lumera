import { beforeEach, describe, expect, it } from 'vitest';
import {
  bacaSiswa,
  migrasiSiswa,
  SISWA_SCHEMA_VERSION,
  type Siswa,
} from '../../src/progress/store';
import { normalizeLearnerProfile, PROFILE_SCHEMA_VERSION } from '../../src/profile/store';

/**
 * spec 002 T033/T034 (R-011): data lama yang ditulis spec 001, SEBELUM
 * `schemaVersion` ada sama sekali, MUST tetap terbaca benar dan naik ke
 * versi saat ini — bukan rusak atau kehilangan field saat migrasi.
 */
describe('migrasi schemaVersion — data lama tanpa field ini sama sekali', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrasiSiswa menaikkan data v0 (bentuk spec 001, tanpa schemaVersion) ke versi saat ini tanpa kehilangan field', () => {
    const dataLama = {
      id: 'siswa-lama',
      lumens: 80,
      streakCount: 5,
      streakLastDate: '2026-08-01',
      mastery: [{ moduleId: 'math-slope', masteryPersen: 70, skorTerakhir: [70], diperbaruiPada: '2026-08-01T00:00:00.000Z' }],
      modulSelesai: ['math-slope'],
    } as Partial<Siswa>;

    const hasil = migrasiSiswa(dataLama);

    expect(hasil.schemaVersion).toBe(SISWA_SCHEMA_VERSION);
    expect(hasil.id).toBe('siswa-lama');
    expect(hasil.lumens).toBe(80);
    expect(hasil.modulSelesai).toEqual(['math-slope']);
  });

  it('bacaSiswa() memigrasikan dan menulis-ulang data v0 yang tersimpan di localStorage', () => {
    const dataLama = {
      id: 'siswa-lama',
      lumens: 80,
      streakCount: 5,
      streakLastDate: '2026-08-01',
      mastery: [],
      modulSelesai: [],
    };
    localStorage.setItem('lumera.progress.v1', JSON.stringify(dataLama));

    const hasil = bacaSiswa();
    expect(hasil.schemaVersion).toBe(SISWA_SCHEMA_VERSION);

    // Ditulis ulang — pembacaan berikutnya tidak perlu migrasi lagi.
    const tersimpan = JSON.parse(localStorage.getItem('lumera.progress.v1')!);
    expect(tersimpan.schemaVersion).toBe(SISWA_SCHEMA_VERSION);
  });

  it('normalizeLearnerProfile menaikkan profil v0 (tanpa schemaVersion) ke versi saat ini', () => {
    const profilLama = {
      displayName: 'Ardi',
      onboardingStep: 'complete',
      onboardingComplete: true,
    };

    const hasil = normalizeLearnerProfile(profilLama);
    expect(hasil.schemaVersion).toBe(PROFILE_SCHEMA_VERSION);
    expect(hasil.displayName).toBe('Ardi');
  });
});
