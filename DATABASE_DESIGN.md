# Data and database design

## Current status

There is **no deployed database and no SQL migration**. This document describes the domain implemented in `src/lib/catalog.ts` and the proposed persistence mapping. The previous document was an unimplemented draft and required course context for every review; that rule is superseded by the current faculty-level product decision. Do not treat these table notes as deployed schema.

## Implemented local data

| Domain record | Key fields | Meaning |
| --- | --- | --- |
| Faculty | `id`, `name`, `demo` | Stable profile; imported IDs are normalized names until a true institutional ID is available. |
| Course | `code`, `title`, `type`, `demo` | A catalog course independent of any faculty. |
| Offering | `id`, `courseCode`, `facultyId`, `slot`, `venue`, `school`, `category`, `demo` | One row in a dated source snapshot. |
| Provenance | `kind`, `sourceUrl`, `branch`, `commit`, `commitDate`, `importedAt`, `currentAvailabilityConfirmed` | Explains source and time scope. |
| Review | `facultyId`, optional `courseCode`, rating dimensions, `again`, optional `comment` | Fictional demo records only; never real submissions. |

The importer deduplicates identical normalized offering IDs and records the upstream commit. A future importer must also track source cycle and coverage, and must **add** a new snapshot instead of overwriting old offerings.

## Proposed PostgreSQL mapping (not yet applied)

- `faculty(id, name, school, designation, external_code, created_at)`
- `course(code, title, type, credits, created_at)`
- `academic_cycle(id, label, starts_on, source_url, source_commit, imported_at, current_confirmed)`
- `offering(id, cycle_id, faculty_id, course_code, slot, venue, school, category, source_row_key)` with a unique `(cycle_id, source_row_key)` constraint for idempotent import.
- `app_user(id, auth_subject, created_at)` in a private schema or restricted table. Do not put registration numbers or VTOP credentials here by default.
- `review(id, author_id, faculty_id, course_code nullable, overall, teaching, grading, attendance, workload, would_take_again, comment, verification_status, created_at, updated_at)`; one active review per author and faculty is the proposed default, pending user research.
- `grade_curve(id, offering_id, class_strength, grading_strength, mean_score, standard_deviation, cutoffs_json, source, created_at)`; one curve per exact class offering and source version. Do not produce relative curves for absolute grading courses.

Rating directions: teaching and grading generosity increase toward positive experience; attendance strictness and workload increase toward stricter/heavier experience. Dimensions may evolve after pilot research. `verification_status` is future-only and cannot be populated with demo claims.

## Access boundary when persistence is added

Anonymous clients may read published profiles, offerings and aggregate review data. Public review records must omit author IDs and emails. Authenticated users may create or edit only their own review through server-side validation and authorization. Private verification evidence must never be in public API responses. Add explicit RLS policies, rate limits and moderation before accepting writes. React rendering escapes text, but comment input still needs length limits and server validation.

## Open questions

Confirm student sign-in method, faculty identity resolution across cycles, review uniqueness/edit policy, the exact upcoming-cycle source, and how grade-curve evidence is verified. These are deferred decisions, not implemented tables.
