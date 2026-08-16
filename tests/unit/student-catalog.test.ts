import { describe, expect, it } from 'vitest';
import {
  INTEGER_COURSE,
  MATHEMATICS_COURSES,
  MATHEMATICS_GRADE_7_PATH,
  STUDENT_SEARCH_RECORDS,
  STUDENT_SUBJECTS,
  findStudentCourse,
  findStudentModule,
  findStudentSubject,
  searchStudentContent,
} from '../../src/student';

describe('Batch-1 student catalog', () => {
  it('contains exactly eight subjects with only Mathematics available', () => {
    expect(STUDENT_SUBJECTS.map((subject) => subject.title)).toEqual([
      'Matematika',
      'IPA',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'IPS',
      'Informatika',
      'Koding & AI',
      'Literasi Finansial',
    ]);
    expect(
      STUDENT_SUBJECTS.filter((subject) => subject.status === 'available').map((s) => s.id),
    ).toEqual(['matematika']);
    expect(STUDENT_SUBJECTS.filter((subject) => subject.status === 'comingSoon')).toHaveLength(7);
  });

  it('exposes only the agreed module-level Mathematics hierarchy', () => {
    const mathematics = findStudentSubject('matematika');
    expect(mathematics?.learningPaths).toEqual([MATHEMATICS_GRADE_7_PATH]);
    expect(MATHEMATICS_GRADE_7_PATH.courses).toEqual(MATHEMATICS_COURSES);
    expect(MATHEMATICS_COURSES.map((course) => course.title)).toEqual([
      'Bilangan Bulat',
      'Pecahan dan Desimal',
      'Perbandingan dan Skala',
      'Bentuk Aljabar',
    ]);
    expect(MATHEMATICS_COURSES.map((course) => course.status)).toEqual([
      'available',
      'comingSoon',
      'comingSoon',
      'comingSoon',
    ]);
    expect(MATHEMATICS_COURSES.slice(1).every((course) => course.modules.length === 0)).toBe(true);
    expect(INTEGER_COURSE.modules.map((module) => module.title)).toEqual([
      'Bilangan di Bawah Nol',
      'Operasi Bilangan Bulat',
    ]);
    expect(INTEGER_COURSE.modules.every((module) => !('lessons' in module))).toBe(true);
  });

  it('keeps ids unique and lookup helpers honest', () => {
    expect(new Set(STUDENT_SEARCH_RECORDS.map((record) => record.id)).size).toBe(
      STUDENT_SEARCH_RECORDS.length,
    );
    expect(findStudentCourse('bilangan-bulat')).toBe(INTEGER_COURSE);
    expect(findStudentCourse('tidak-ada')).toBeNull();
    expect(findStudentModule('operasi-bilangan-bulat')?.courseId).toBe('bilangan-bulat');
    expect(findStudentModule('tidak-ada')).toBeNull();
  });
});

describe('student content search', () => {
  it('finds canonical content through titles and descriptions', () => {
    expect(searchStudentContent('pola yang tumbuh')[0]?.entityId).toBe('aljabar-1-1');
    expect(
      searchStudentContent('laju perubahan').some(
        (record) => record.entityId === 'kalkulus-1-1',
      ),
    ).toBe(true);
    expect(searchStudentContent('bilangan bulat')).toEqual([]);
  });

  it('returns coming-soon subjects without inventing a destination', () => {
    const result = searchStudentContent('Koding & AI')[0];
    expect(result).toMatchObject({
      entityId: 'koding-ai',
      status: 'comingSoon',
      href: null,
    });
  });

  it('keeps future canonical Mathematics courses searchable but non-navigable', () => {
    const unavailable = searchStudentContent('Geometri Analitik')[0];
    expect(unavailable).toMatchObject({
      entityId: 'geometri-analitik',
      kind: 'course',
      status: 'comingSoon',
      href: null,
    });

    const available = searchStudentContent('Aljabar')[0];
    expect(available).toMatchObject({
      entityId: 'aljabar',
      kind: 'course',
      status: 'available',
      href: '#/belajar/matematika/aljabar',
    });
  });

  it('focuses subject and learning-path search on the Mathematics route', () => {
    expect(searchStudentContent('Matematika')[0]).toMatchObject({
      kind: 'subject',
      href: '#/belajar/matematika',
    });
    expect(searchStudentContent('Matematika Fase D')[0]).toMatchObject({
      kind: 'learningPath',
      href: '#/belajar',
    });
  });

  it('handles empty queries and result limits', () => {
    expect(searchStudentContent('   ')).toEqual([]);
    expect(searchStudentContent('matematika', 1)).toHaveLength(1);
    expect(searchStudentContent('matematika', 0)).toEqual([]);
  });
});
