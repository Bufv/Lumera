export interface CurriculumReviewRecord {
  moduleId: string;
  authorId: string;
  reviewerId: string;
  reviewerName: string;
  verifiedAt: string;
  status: 'approved' | 'rejected';
}

/**
 * Intentionally empty for this demo release. Production access only opens
 * after a real, independent review record is committed here or supplied by a
 * future review service.
 */
export const curriculumReviewRegistry: Readonly<Record<string, CurriculumReviewRecord>> = {};

export function hasIndependentCurriculumApproval(
  moduleId: string,
  registry: Readonly<Record<string, CurriculumReviewRecord>> = curriculumReviewRegistry,
): boolean {
  const record = registry[moduleId];
  if (!record || record.status !== 'approved') return false;
  if (!record.authorId.trim() || record.authorId === record.reviewerId) return false;
  if (!record.reviewerId.trim() || !record.reviewerName.trim()) return false;
  return !Number.isNaN(Date.parse(record.verifiedAt));
}

export function canLaunchCurriculumLesson({
  moduleId,
  demo,
  development,
  registry,
}: {
  moduleId: string;
  demo: boolean;
  development: boolean;
  registry?: Readonly<Record<string, CurriculumReviewRecord>>;
}): boolean {
  return demo || development || hasIndependentCurriculumApproval(moduleId, registry);
}
