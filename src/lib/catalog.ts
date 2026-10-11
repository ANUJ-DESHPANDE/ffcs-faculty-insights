import snapshot from '@/data/ffcs-snapshot.json';

export type Faculty = { id: string; name: string };
export type Course = { code: string; title: string; type: string };
export type Offering = { id: string; courseCode: string; facultyId: string; slot: string; venue: string; school: string; category: string };

// This is a historical public archive; it contains no student opinions.
export const faculty: Faculty[] = snapshot.faculty;
export const courses: Course[] = snapshot.courses;
export const offerings: Offering[] = snapshot.offerings;
export const provenance = snapshot.provenance;
export const facultyById = new Map(faculty.map(item => [item.id, item]));
export const courseByCode = new Map(courses.map(item => [item.code, item]));

export function normalizeSearch(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ''); }
export function matchesSearch(query: string, ...fields: string[]) {
  const term = normalizeSearch(query);
  return !term || fields.some(field => normalizeSearch(field).includes(term));
}
export function offeringsForCourse(code: string) { return offerings.filter(row => row.courseCode === code); }
export function offeringsForFaculty(id: string) { return offerings.filter(row => row.facultyId === id); }
export function scoreLabel(score: number | null) { return score === null ? '—' : score.toFixed(1); }
