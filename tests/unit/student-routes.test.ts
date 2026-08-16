import { describe, expect, it } from 'vitest';
import {
  hashForCourseView,
  hashForCourse,
  hashForLesson,
  hashForRoute,
  isOnboardingRoute,
  parseStudentHash,
} from '../../src/student/routes';

describe('student hash routes', () => {
  it('parses every planned deep link without a router dependency', () => {
    expect(parseStudentHash('#/mulai/profil')).toEqual({
      route: 'onboarding-profile',
      demo: false,
      courseView: 'roadmap',
    });
    expect(parseStudentHash('#/belajar/matematika/bilangan-bulat')).toEqual({
      route: 'integers',
      demo: false,
      courseView: 'roadmap',
    });
    expect(parseStudentHash('#/pengaturan')).toEqual({
      route: 'settings',
      demo: false,
      courseView: 'roadmap',
    });
  });

  it('keeps the illustrative demo state explicit in the URL', () => {
    expect(parseStudentHash('#/beranda?mode=demo')).toEqual({
      route: 'home',
      demo: true,
      courseView: 'roadmap',
    });
    expect(hashForRoute('saved', true)).toBe('#/simpanan?mode=demo');
  });

  it('round-trips list view together with demo mode', () => {
    const hash = hashForRoute('integers', true, 'list');
    expect(hash).toBe('#/belajar/matematika/bilangan-bulat?mode=demo&view=list');
    expect(parseStudentHash(hash)).toEqual({
      route: 'integers',
      demo: true,
      courseView: 'list',
    });
    expect(hashForCourseView('list')).toBe('#/belajar/matematika/bilangan-bulat?view=list');
  });

  it('uses the clean course URL for roadmap and normalizes invalid views', () => {
    expect(hashForCourseView('roadmap')).toBe('#/belajar/matematika/bilangan-bulat');
    expect(parseStudentHash('#/belajar/matematika/bilangan-bulat?view=roadmap').courseView).toBe(
      'roadmap',
    );
    expect(parseStudentHash('#/belajar/matematika/bilangan-bulat?view=grid').courseView).toBe(
      'roadmap',
    );
  });

  it('parses and builds data-driven course and lesson links', () => {
    expect(hashForCourse('aljabar', true, 'list')).toBe(
      '#/belajar/matematika/aljabar?mode=demo&view=list',
    );
    expect(parseStudentHash(hashForCourse('aljabar', true, 'list'))).toEqual({
      route: 'course',
      demo: true,
      courseView: 'list',
      courseSlug: 'aljabar',
    });

    expect(hashForLesson('kalkulus', 'semakin-dekat', true)).toBe(
      '#/belajar/matematika/kalkulus/semakin-dekat?mode=demo',
    );
    expect(parseStudentHash(hashForLesson('kalkulus', 'semakin-dekat', true))).toEqual({
      route: 'lesson',
      demo: true,
      courseView: 'roadmap',
      courseSlug: 'kalkulus',
      lessonSlug: 'semakin-dekat',
    });
  });

  it('falls back according to onboarding completion', () => {
    expect(parseStudentHash('#/tidak-ada', false).route).toBe('welcome');
    expect(parseStudentHash('#/tidak-ada', true).route).toBe('home');
    expect(isOnboardingRoute('onboarding-plan')).toBe(true);
    expect(isOnboardingRoute('home')).toBe(false);
  });
});
