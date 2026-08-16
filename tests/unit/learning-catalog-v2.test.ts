import { describe, expect, it } from 'vitest';
import {
  ACTIVE_LEARNING_COURSES,
  ALGEBRA_COURSE,
  ALGEBRA_MODULE_IDS,
  CALCULUS_COURSE,
  CALCULUS_MODULE_IDS,
  LEARNING_COURSE_IDS,
  LEARNING_PATHS,
  deriveCourseRoadmap,
  findLearningCourse,
  findLearningPath,
  findLessonNode,
  getCourseHref,
  getCourseProgress,
  getLessonHref,
} from '../../src/student/learningCatalog';

describe('canonical Algebra and Calculus learning catalog', () => {
  it('exposes the two curriculum paths with active and contextual courses', () => {
    expect(LEARNING_PATHS.map((path) => path.title)).toEqual([
      'Matematika · Fase D',
      'Matematika Tingkat Lanjut · Fase F',
    ]);
    expect(LEARNING_PATHS[0]?.courses.map((course) => course.title)).toEqual([
      'Aljabar',
      'Relasi & Fungsi',
      'Geometri',
      'Data & Peluang',
    ]);
    expect(LEARNING_PATHS[1]?.courses.map((course) => course.title)).toEqual([
      'Kalkulus',
      'Aljabar Lanjut',
      'Geometri Analitik',
    ]);
    expect(ACTIVE_LEARNING_COURSES).toEqual([ALGEBRA_COURSE, CALCULUS_COURSE]);
    expect(
      LEARNING_PATHS.flatMap((path) => path.courses).filter(
        (course) => course.status === 'available',
      ),
    ).toEqual(ACTIVE_LEARNING_COURSES);
  });

  it.each([ALGEBRA_COURSE, CALCULUS_COURSE])(
    '$title has six levels, 24 nodes, and only four registered modules',
    (course) => {
      const lessons = course.levels.flatMap((level) => level.lessons);
      expect(course.levels).toHaveLength(6);
      expect(course.levels.every((level) => level.lessons.length === 4)).toBe(true);
      expect(lessons).toHaveLength(24);
      expect(lessons.filter((lesson) => lesson.moduleId)).toHaveLength(4);
      expect(
        course.levels
          .slice(1)
          .flatMap((level) => level.lessons)
          .every((lesson) => !('moduleId' in lesson)),
      ).toBe(true);
      expect(lessons.every((lesson) => lesson.reviewStatus === 'pending')).toBe(true);
    },
  );

  it('uses stable module IDs and a sequential prerequisite chain', () => {
    expect(ALGEBRA_COURSE.levels[0]?.lessons.map((lesson) => lesson.moduleId)).toEqual(
      Object.values(ALGEBRA_MODULE_IDS),
    );
    expect(CALCULUS_COURSE.levels[0]?.lessons.map((lesson) => lesson.moduleId)).toEqual(
      Object.values(CALCULUS_MODULE_IDS),
    );
    expect(ALGEBRA_COURSE.levels[0]?.lessons.map((lesson) => lesson.prerequisiteIds)).toEqual([
      [],
      [ALGEBRA_MODULE_IDS.lesson1],
      [ALGEBRA_MODULE_IDS.lesson2],
      [ALGEBRA_MODULE_IDS.lesson3],
    ]);
  });

  it('finds paths, courses, and lessons by stable IDs, slugs, or module IDs', () => {
    expect(findLearningPath('matematika-fase-d')?.phase).toBe('D');
    expect(findLearningCourse(LEARNING_COURSE_IDS.calculus)).toBe(CALCULUS_COURSE);
    expect(findLessonNode('aljabar', 'pola-yang-tumbuh')?.label).toBe('1.1');
    expect(findLessonNode('aljabar', ALGEBRA_MODULE_IDS.lesson4)?.slug).toBe(
      'cerita-menjadi-aljabar',
    );
    expect(findLearningCourse('tidak-ada')).toBeNull();
    expect(findLessonNode('aljabar', 'tidak-ada')).toBeNull();
  });
});

describe('learning roadmap release and progress rules', () => {
  it('unlocks sequentially in demo while future levels remain coming soon', () => {
    const initial = deriveCourseRoadmap(ALGEBRA_COURSE, [], true);
    expect(initial.levels[0]?.lessons.map((lesson) => lesson.availability)).toEqual([
      'available',
      'lockedByPrerequisite',
      'lockedByPrerequisite',
      'lockedByPrerequisite',
    ]);
    expect(initial.levels[1]?.lessons.every((lesson) => lesson.availability === 'comingSoon')).toBe(
      true,
    );

    const afterFirst = deriveCourseRoadmap(
      ALGEBRA_COURSE,
      [ALGEBRA_MODULE_IDS.lesson1],
      true,
      ALGEBRA_MODULE_IDS.lesson2,
    );
    expect(afterFirst.levels[0]?.lessons.map((lesson) => lesson.availability)).toEqual([
      'completed',
      'inProgress',
      'lockedByPrerequisite',
      'lockedByPrerequisite',
    ]);
  });

  it('blocks the first otherwise available lesson outside demo pending independent review', () => {
    const production = deriveCourseRoadmap(CALCULUS_COURSE, [], false);
    expect(production.levels[0]?.lessons.map((lesson) => lesson.availability)).toEqual([
      'reviewPending',
      'lockedByPrerequisite',
      'lockedByPrerequisite',
      'lockedByPrerequisite',
    ]);
  });

  it('calculates progress from the four registered lessons only', () => {
    expect(
      getCourseProgress(ALGEBRA_COURSE, [
        ALGEBRA_MODULE_IDS.lesson1,
        ALGEBRA_MODULE_IDS.lesson2,
        'aljabar-2-1',
        'unknown-module',
      ]),
    ).toEqual({ completedCount: 2, availableCount: 4, percent: 50 });
    expect(getCourseProgress(CALCULUS_COURSE, Object.values(CALCULUS_MODULE_IDS))).toEqual({
      completedCount: 4,
      availableCount: 4,
      percent: 100,
    });
  });

  it('builds stable demo/list links without inventing links for future content', () => {
    const algebraLesson = ALGEBRA_COURSE.levels[0]?.lessons[0];
    const futureLesson = ALGEBRA_COURSE.levels[1]?.lessons[0];
    const futureCourse = findLearningCourse('geometri');
    expect(getCourseHref(ALGEBRA_COURSE, { demo: true, view: 'list' })).toBe(
      '#/belajar/matematika/aljabar?mode=demo&view=list',
    );
    expect(algebraLesson && getLessonHref(ALGEBRA_COURSE, algebraLesson, { demo: true })).toBe(
      '#/belajar/matematika/aljabar/pola-yang-tumbuh?mode=demo',
    );
    expect(futureLesson && getLessonHref(ALGEBRA_COURSE, futureLesson)).toBeNull();
    expect(futureCourse && getCourseHref(futureCourse)).toBeNull();
  });
});
