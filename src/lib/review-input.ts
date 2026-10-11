export const minimumReviewLength = 80;
export const maximumReviewLength = 800;

type ParsedReview = {
  facultyId: string;
  courseCode: string | null;
  overall: number;
  teaching: number;
  grading: number;
  workload: number;
  labEase: number | null;
  wouldTakeAgain: boolean;
  comment: string;
};

const rating = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
    ? value
    : null;

export function parseReviewInput(value: unknown): { data: ParsedReview } | { error: string } {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return { error: 'Invalid review.' };
  const body = value as Record<string, unknown>;
  const facultyId = typeof body.facultyId === 'string' ? body.facultyId.trim() : '';
  const courseCode = typeof body.courseCode === 'string' && body.courseCode.trim()
    ? body.courseCode.trim()
    : null;
  const overall = rating(body.overall);
  const teaching = rating(body.teaching);
  const grading = rating(body.grading);
  const workload = rating(body.workload);
  const labEase = body.labEase === null || body.labEase === undefined ? null : rating(body.labEase);
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  const length = Array.from(comment).length;

  if (!facultyId || !overall || !teaching || !grading || !workload ||
      (body.labEase !== null && body.labEase !== undefined && labEase === null))
    return { error: 'Choose an overall, teaching, grading and workload rating from 1 to 5.' };
  if (typeof body.wouldTakeAgain !== 'boolean')
    return { error: 'Answer whether you would take this faculty again.' };
  if (length < minimumReviewLength || length > maximumReviewLength)
    return { error: `Write ${minimumReviewLength} to ${maximumReviewLength} characters about your experience and bottom line.` };
  if (body.studiedUnderFaculty !== true)
    return { error: 'Confirm that you studied under this faculty.' };
  return { data: {
    facultyId, courseCode, overall, teaching, grading, workload, labEase,
    wouldTakeAgain: body.wouldTakeAgain, comment,
  } };
}
