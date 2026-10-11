# Data and database design

## Deployment status

The explicit Supabase/PostgreSQL migration is [`supabase/migrations/202610110001_reviews.sql`](supabase/migrations/202610110001_reviews.sql). The historical directory seed is [`supabase/seed.sql`](supabase/seed.sql). **Neither has been applied to a hosted project as of 11 October 2026; the user has not created a Supabase project.** The application compiles without configuration and shows an honest setup state for submissions.

## Implemented boundaries

| Record | Location | Access |
| --- | --- | --- |
| Faculty and course directory | `public.faculty_directory`, `public.course_directory` | Read-only to anonymous/authenticated clients; seeded from June 2026 archive |
| Historical offerings | `src/data/ffcs-snapshot.json` | Public, dated local snapshot; no current availability claim |
| Auth account | Supabase Auth | Private; email is never in a public review response |
| Faculty review | `app_private.reviews` | Private table; one per signed-in author and faculty; direct client table access revoked |
| Reports, admins, moderation audit | `app_private.*` | Private, accessed through guarded functions |
| Curated discussion links | `app_private.discussion_links` | Admin writes, public link-only read, never counted as ratings |

`save_review` validates signed-in ownership, faculty/course IDs, numeric bounds, comment length and self-attestation. Saving or editing puts a review in `pending`. It is not published or aggregated until `admin_moderate` approves it. A 45-second per-account write cooldown reduces accidental or scripted flooding. Email sign-in and self-attestation do **not** establish enrollment. Public `published_reviews_for` omits author IDs and email, while `review_summaries` returns approved aggregate data. Admin functions check `app_private.admins` on every call. Private tables have RLS enabled with no direct client policies.

The schema has `overall` (required), optional `teaching`, `grading`, `workload`, `lab_ease`, `would_take_again`, optional 20–800 character `comment`, optional `course_code`, and a required `studied_under_faculty` self-attestation. Attendance is absent. Lab ease is 1 demanding to 5 relaxed; workload is 1 light to 5 heavy. The UI suppresses aggregate scores under five published answers per dimension.

The historical archive uses name-derived IDs, so faculty identity collisions or name changes need careful review before future snapshot imports. `seed.sql` upserts names and course titles only. It does not add current offering rows or review data. An upcoming-cycle import should add a dated snapshot, preserve the previous one, and verify its coverage before any “available now” display.

## Previous proposal, now superseded

The initial design proposed a larger `academic_cycle`/`offering` SQL schema, a separate app-user table, grade curves, and attendance ratings. Those tables were never deployed. The first live review migration deliberately keeps the existing historical archive local and adds only the directory records needed to enforce review references. Grade curves and enrollment verification remain unimplemented until evidence and consent requirements are clear.
