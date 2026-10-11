export type SummaryRow = {
  faculty_id: string; review_count: number; overall: number | null;
  teaching: number | null; teaching_count: number;
  grading: number | null; grading_count: number;
  workload: number | null; workload_count: number;
  lab_ease: number | null; lab_ease_count: number;
  again_percent: number | null; again_count: number;
};
export type Reputation = { count: number; confidence: string; overall: number | null; teaching: number | null; grading: number | null; workload: number | null; labEase: number | null; again: number | null; teachingCount: number; gradingCount: number; workloadCount: number; labEaseCount: number; againCount: number };

export function reputationFrom(row?: SummaryRow): Reputation {
  const count = row?.review_count ?? 0;
  const enough = count >= 5;
  return {
    count,
    confidence: count < 3 ? 'Insufficient data' : count < 5 ? 'Early data' : count < 20 ? 'Developing evidence' : 'Strong evidence',
    overall: enough ? Number(row?.overall) : null,
    teaching: enough && (row?.teaching_count ?? 0) >= 5 ? Number(row?.teaching) : null,
    grading: enough && (row?.grading_count ?? 0) >= 5 ? Number(row?.grading) : null,
    workload: enough && (row?.workload_count ?? 0) >= 5 ? Number(row?.workload) : null,
    labEase: enough && (row?.lab_ease_count ?? 0) >= 5 ? Number(row?.lab_ease) : null,
    again: enough && (row?.again_count ?? 0) >= 5 ? Number(row?.again_percent) : null,
    teachingCount: row?.teaching_count ?? 0, gradingCount: row?.grading_count ?? 0,
    workloadCount: row?.workload_count ?? 0, labEaseCount: row?.lab_ease_count ?? 0,
    againCount: row?.again_count ?? 0,
  };
}
