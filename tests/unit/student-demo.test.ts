import { describe, expect, it } from 'vitest';
import {
  ARDI_DEMO_FIXTURE,
  createArdiDemoFixture,
  findStudentCourse,
  findStudentModule,
} from '../../src/student';

describe('Ardi demo fixture', () => {
  it('locks the approved, visibly illustrative demo values', () => {
    expect(ARDI_DEMO_FIXTURE.disclosure).toBe('Mode demo · Data ilustratif');
    expect(ARDI_DEMO_FIXTURE.profile).toMatchObject({
      displayName: 'Ardi',
      stage: 'smp',
      grade: 7,
      focusSubjectId: 'matematika',
      dailyMinutes: 20,
    });
    expect(ARDI_DEMO_FIXTURE.streakDays).toBe(7);
    expect(ARDI_DEMO_FIXTURE.courseProgress).toEqual({
      courseId: 'bilangan-bulat',
      percent: 45,
    });
    expect(ARDI_DEMO_FIXTURE.savedConcepts).toHaveLength(3);
    expect(ARDI_DEMO_FIXTURE.reviewConcepts).toHaveLength(2);
  });

  it('references only courses and modules that exist in the Batch-1 catalog', () => {
    expect(findStudentCourse(ARDI_DEMO_FIXTURE.courseProgress.courseId)).not.toBeNull();

    const moduleIds = [...ARDI_DEMO_FIXTURE.savedConcepts, ...ARDI_DEMO_FIXTURE.reviewConcepts].map(
      (concept) => concept.moduleId,
    );
    expect(moduleIds.every((moduleId) => findStudentModule(moduleId) !== null)).toBe(true);
  });

  it('creates fresh but structurally deterministic copies for resets', () => {
    const first = createArdiDemoFixture();
    const second = createArdiDemoFixture();
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.savedConcepts).not.toBe(second.savedConcepts);
  });
});
