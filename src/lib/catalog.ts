import snapshot from "@/data/ffcs-snapshot.json";

export type Faculty = { id: string; name: string; demo?: boolean };
export type Course = {
  code: string;
  title: string;
  type: string;
  demo?: boolean;
};
export type Offering = {
  id: string;
  courseCode: string;
  facultyId: string;
  slot: string;
  venue: string;
  school: string;
  category: string;
  demo?: boolean;
};
export type Review = {
  id: string;
  facultyId: string;
  courseCode?: string;
  overall: number;
  teaching: number;
  grading: number;
  attendance: number;
  workload: number;
  again: boolean;
  comment: string;
  demo: true;
};

// Fictional sandbox profiles. Never treat these opinions or availability as student submissions.
const demoFaculty: Faculty[] = [
  { id: "demo-ananya-rao", name: "Demo faculty · Ananya Rao", demo: true },
  { id: "demo-vivek-menon", name: "Demo faculty · Vivek Menon", demo: true },
  { id: "demo-meera-iyer", name: "Demo faculty · Meera Iyer", demo: true },
];
const demoCourse: Course = {
  code: "DEMO302L",
  title: "Database Systems · product demo",
  type: "Theory",
  demo: true,
};
const demoOfferings: Offering[] = [
  {
    id: "demo-a-d1",
    courseCode: demoCourse.code,
    facultyId: demoFaculty[0].id,
    slot: "D1+TD1",
    venue: "SJT 504",
    school: "Demo",
    category: "Simulation",
    demo: true,
  },
  {
    id: "demo-b-d2",
    courseCode: demoCourse.code,
    facultyId: demoFaculty[1].id,
    slot: "D2+TD2",
    venue: "SJT 506",
    school: "Demo",
    category: "Simulation",
    demo: true,
  },
  {
    id: "demo-c-d1",
    courseCode: demoCourse.code,
    facultyId: demoFaculty[2].id,
    slot: "D1+TD1",
    venue: "SJT 508",
    school: "Demo",
    category: "Simulation",
    demo: true,
  },
];
const makeReviews = (
  facultyId: string,
  scores: number[],
  teaching: number,
  grading: number,
  attendance: number,
  workload: number,
  again: boolean,
): Review[] =>
  scores.map((overall, i) => ({
    id: `${facultyId}-${i}`,
    facultyId,
    courseCode: demoCourse.code,
    overall,
    teaching,
    grading,
    attendance,
    workload,
    again,
    comment: "",
    demo: true,
  }));
export const reviews: Review[] = [
  ...makeReviews(demoFaculty[0].id, [5, 4, 5, 4, 5, 4, 5, 4], 5, 4, 2, 2, true),
  ...makeReviews(demoFaculty[1].id, [4, 4, 3, 4, 4], 4, 5, 1, 3, true),
  ...makeReviews(demoFaculty[2].id, [5, 5], 5, 3, 4, 4, false),
];

export const faculty: Faculty[] = [...demoFaculty, ...snapshot.faculty];
export const courses: Course[] = [demoCourse, ...snapshot.courses];
export const offerings: Offering[] = [...demoOfferings, ...snapshot.offerings];
export const provenance = snapshot.provenance;
export const facultyById = new Map(faculty.map((item) => [item.id, item]));
export const courseByCode = new Map(courses.map((item) => [item.code, item]));

export function reputation(facultyId: string) {
  const rows = reviews.filter((review) => review.facultyId === facultyId);
  const count = rows.length;
  const average = (
    key: keyof Pick<
      Review,
      "overall" | "teaching" | "grading" | "attendance" | "workload"
    >,
  ) => (count ? rows.reduce((sum, row) => sum + row[key], 0) / count : null);
  return {
    count,
    confidence:
      count < 3
        ? "Insufficient data"
        : count < 5
          ? "Early data"
          : count < 20
            ? "Developing evidence"
            : "Strong evidence",
    overall: count >= 5 ? average("overall") : null,
    teaching: count >= 5 ? average("teaching") : null,
    grading: count >= 5 ? average("grading") : null,
    attendance: count >= 5 ? average("attendance") : null,
    workload: count >= 5 ? average("workload") : null,
    again:
      count >= 5
        ? Math.round((rows.filter((row) => row.again).length / count) * 100)
        : null,
  };
}

export function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
export function matchesSearch(query: string, ...fields: string[]) {
  const term = normalizeSearch(query);
  return !term || fields.some((field) => normalizeSearch(field).includes(term));
}
export function offeringsForCourse(code: string) {
  return offerings.filter((offering) => offering.courseCode === code);
}
export function offeringsForFaculty(id: string) {
  return offerings.filter((offering) => offering.facultyId === id);
}
export function scoreLabel(score: number | null) {
  return score === null ? "—" : score.toFixed(1);
}
