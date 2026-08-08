import { describe, expect, it } from 'vitest';
import { hashForRoute, isOnboardingRoute, parseStudentHash } from '../../src/student/routes';

describe('student hash routes', () => {
  it('parses every planned deep link without a router dependency', () => {
    expect(parseStudentHash('#/mulai/profil')).toEqual({ route: 'onboarding-profile', demo: false });
    expect(parseStudentHash('#/belajar/matematika/bilangan-bulat')).toEqual({
      route: 'integers',
      demo: false,
    });
    expect(parseStudentHash('#/pengaturan')).toEqual({ route: 'settings', demo: false });
  });

  it('keeps the illustrative demo state explicit in the URL', () => {
    expect(parseStudentHash('#/beranda?mode=demo')).toEqual({ route: 'home', demo: true });
    expect(hashForRoute('saved', true)).toBe('#/simpanan?mode=demo');
  });

  it('falls back according to onboarding completion', () => {
    expect(parseStudentHash('#/tidak-ada', false).route).toBe('welcome');
    expect(parseStudentHash('#/tidak-ada', true).route).toBe('home');
    expect(isOnboardingRoute('onboarding-plan')).toBe(true);
    expect(isOnboardingRoute('home')).toBe(false);
  });
});
