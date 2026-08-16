import { describe, expect, it } from 'vitest';
import {
  canLaunchCurriculumLesson,
  hasIndependentCurriculumApproval,
  type CurriculumReviewRecord,
} from '../../src/student/curriculumReview';

const valid: CurriculumReviewRecord = {
  moduleId: 'aljabar-pola-yang-tumbuh',
  authorId: 'author-1',
  reviewerId: 'reviewer-2',
  reviewerName: 'Reviewer Kurikulum',
  verifiedAt: '2026-08-13T10:00:00+07:00',
  status: 'approved',
};

describe('gerbang tinjauan kurikulum', () => {
  it('membolehkan demo dan development tanpa mengaku siap produksi', () => {
    expect(
      canLaunchCurriculumLesson({ moduleId: valid.moduleId, demo: true, development: false }),
    ).toBe(true);
    expect(
      canLaunchCurriculumLesson({ moduleId: valid.moduleId, demo: false, development: true }),
    ).toBe(true);
    expect(
      canLaunchCurriculumLesson({ moduleId: valid.moduleId, demo: false, development: false }),
    ).toBe(false);
  });

  it('memerlukan reviewer independen dan tanggal verifikasi yang valid', () => {
    expect(hasIndependentCurriculumApproval(valid.moduleId, { [valid.moduleId]: valid })).toBe(
      true,
    );
    expect(
      hasIndependentCurriculumApproval(valid.moduleId, {
        [valid.moduleId]: { ...valid, reviewerId: valid.authorId },
      }),
    ).toBe(false);
    expect(
      hasIndependentCurriculumApproval(valid.moduleId, {
        [valid.moduleId]: { ...valid, verifiedAt: 'belum diverifikasi' },
      }),
    ).toBe(false);
  });
});
