import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  STORAGE_KEY,
  createDefaultLearnerProfile,
  loadLearnerProfile,
  normalizeLearnerProfile,
  resetLearnerProfile,
  saveLearnerProfile,
  updateLearnerProfile,
} from '../../src/profile';

describe('profil pembelajar lokal', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('memulai dengan profil SMP kelas VII yang belum menyelesaikan onboarding', () => {
    expect(createDefaultLearnerProfile()).toEqual({
      schemaVersion: 1,
      displayName: '',
      stage: 'smp',
      grade: 7,
      goal: null,
      focusSubjectId: 'matematika',
      dailyMinutes: 20,
      studyDays: [],
      onboardingStep: 'welcome',
      onboardingComplete: false,
      reduceMotion: false,
    });
  });

  it('menghasilkan array hari baru untuk setiap profil default', () => {
    const first = createDefaultLearnerProfile();
    const second = createDefaultLearnerProfile();

    first.studyDays.push('monday');
    expect(second.studyDays).toEqual([]);
  });

  it('menyimpan dan membaca profil secara round-trip', () => {
    const saved = saveLearnerProfile({
      ...createDefaultLearnerProfile(),
      displayName: 'Ardi',
      goal: 'support-school',
      dailyMinutes: 30,
      studyDays: ['monday', 'wednesday', 'friday'],
      onboardingStep: 'complete',
      onboardingComplete: true,
      reduceMotion: true,
    });

    expect(loadLearnerProfile()).toEqual(saved);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual(saved);
  });

  it('memigrasikan profil lama yang parsial dengan nilai default aman', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        displayName: 'Sita',
        goal: 'build-routine',
        studyDays: ['monday', 'monday', 'invalid', 'saturday'],
        onboardingStep: 'rhythm',
      }),
    );

    expect(loadLearnerProfile()).toEqual({
      ...createDefaultLearnerProfile(),
      displayName: 'Sita',
      goal: 'build-routine',
      studyDays: ['monday', 'saturday'],
      onboardingStep: 'rhythm',
    });
  });

  it('mengganti field yang tidak valid dan membuang field asing', () => {
    const normalized = normalizeLearnerProfile({
      displayName: 17,
      stage: 'sma',
      grade: 10,
      goal: 'unknown',
      focusSubjectId: 'ipa',
      dailyMinutes: 60,
      studyDays: 'monday',
      onboardingStep: 'mystery',
      onboardingComplete: 'yes',
      reduceMotion: 'yes',
      unexpected: true,
    });

    expect(normalized).toEqual(createDefaultLearnerProfile());
    expect(normalized).not.toHaveProperty('unexpected');
  });

  it('memperlakukan langkah complete sebagai onboarding selesai', () => {
    expect(
      normalizeLearnerProfile({
        ...createDefaultLearnerProfile(),
        onboardingStep: 'complete',
      }),
    ).toMatchObject({ onboardingStep: 'complete', onboardingComplete: true });
  });

  it('memperbarui sebagian profil dan langsung mempersistenkannya', () => {
    saveLearnerProfile({
      ...createDefaultLearnerProfile(),
      displayName: 'Ayu',
      onboardingStep: 'goal',
    });

    const updated = updateLearnerProfile((current) => ({
      displayName: `${current.displayName} Putri`,
      goal: 'strengthen-foundations',
      onboardingStep: 'subject',
    }));

    expect(updated).toMatchObject({
      displayName: 'Ayu Putri',
      goal: 'strengthen-foundations',
      onboardingStep: 'subject',
    });
    expect(loadLearnerProfile()).toEqual(updated);
  });

  it('mengembalikan default untuk JSON rusak atau bentuk akar yang salah', () => {
    localStorage.setItem(STORAGE_KEY, '{rusak');
    expect(loadLearnerProfile()).toEqual(createDefaultLearnerProfile());

    localStorage.setItem(STORAGE_KEY, JSON.stringify(['bukan', 'profil']));
    expect(loadLearnerProfile()).toEqual(createDefaultLearnerProfile());
  });

  it('reset menghapus profil tersimpan dan mengembalikan profil default', () => {
    saveLearnerProfile({ ...createDefaultLearnerProfile(), displayName: 'Ardi' });

    expect(resetLearnerProfile()).toEqual(createDefaultLearnerProfile());
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('aman saat dijalankan tanpa window pada SSR', () => {
    vi.stubGlobal('window', undefined);

    expect(loadLearnerProfile()).toEqual(createDefaultLearnerProfile());
    expect(() => saveLearnerProfile(createDefaultLearnerProfile())).not.toThrow();
    expect(() => updateLearnerProfile({ displayName: 'SSR' })).not.toThrow();
    expect(() => resetLearnerProfile()).not.toThrow();
  });
});
