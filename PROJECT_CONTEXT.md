# FFCS Faculty Insights — living project context

## Purpose

An independent, student-built decision aid for VIT Vellore FFCS. It turns scattered faculty knowledge into searchable, contextual, privacy-conscious information while making uncertainty and source age visible. Students judge options here and can build a timetable with a dedicated planner.

## Implemented in the repository (11 October 2026)

- Next.js App Router, React, TypeScript and plain CSS. `npm run dev` works without cloud credentials for browsing.
- Search 450 courses, 904 faculty and 5,643 historical offerings from FFCS-inator. Course/faculty pages, slot filtering and sorting, browser-local shortlist, comparison of four.
- Supabase SSR email-link sign-in, an opt-in VIT Google sign-in pilot, a faculty review form, private one-review-per-author-and-faculty storage, editable reviews, moderation queue, anonymous public reads, reports, admin statistics and manual Reddit discussion links are implemented in code and an explicit SQL migration.
- Written experiences appear high on faculty pages. Each review requires overall, teaching, grading and workload ratings, a take-again answer, and an 80–800 character written account. Writing cues ask for reasoning and a bottom line. Lab ease appears when the student reports lab experience. Attendance has been removed.
- The contribution page has a three-review goal and sorts a student's self-reported studied-faculty list by published review coverage. The list stays in browser session storage; VTOP has not supplied it.
- No fictional reviews are displayed in the production browsing flow. Aggregate ratings require five published answers; low counts are shown without an average.
- Authenticated accounts are privately associated with reviews. Public responses omit the author ID and email. Account login and self-attestation do **not** verify enrollment. VIT Google sign-in is code-complete but disabled until an actual VIT Workspace account can test it; even success would verify account control, not class enrollment.
- The Supabase migration and seed have **not yet been applied to a hosted project**. The user answered that no Supabase project exists. Live persistence, mail delivery and deployment are not yet verified.

## Provenance and current availability

The imported source is CodeChef-VIT's [FFCS-inator](https://github.com/CodeChefVIT/ffcs), `prod` commit `f8bb2fc345763d91a3cdb0ca92928191eb381309` dated 2026-06-28. The JSON records the full provenance. It is historical. No upcoming-cycle availability is confirmed. Preserve the [upstream MIT license](docs/third-party/FFCS-INATOR-LICENSE.txt). Never switch an offering to “current” without a new verified dated source.

## Architecture and trust

`src/lib/catalog.ts` wraps the local historical directory and offering snapshot. Supabase Auth and PostgreSQL hold accounts and reviews when configured; the SQL migration is in `supabase/migrations`. The private schema holds author IDs, review statuses, reports, admin membership and curated links. Public security-definer functions expose only approved anonymous data. Admin checks live in SQL, not merely in UI. The review route enforces valid form input before calling the database function; the database validates it again.

## Product decisions

- Reviews primarily belong to faculty, with optional course context and no requirement for a current FFCS offering.
- Self-attested and email-authenticated are honest labels; never call them enrollment-verified.
- Grade curves need evidence tied to an actual class offering and are not inferred from subjective ratings.
- Public reviews need moderation and reports because they discuss identifiable people.
- Reddit references remain separate link-only material. They do not create reviews or scores.
- VTOP credentials or session tokens are never collected. The official public portal description confirms course registration and timetables exist, but the authenticated page structure and legal/technical basis for a verification import are unconfirmed. See `docs/SOURCE_INVESTIGATIONS.md`.

## Next operational steps

1. Create Supabase, apply the migration and seed, configure publishable URL/key and auth redirect. Set up custom SMTP for reachable non-VIT email inboxes; pilot VIT Google sign-in separately because the user reports VIT student mail blocks outside OTP messages.
2. Test two-account sign-in, submission, author edit, moderation, anonymous public display and reporting end to end before launching.
3. Deploy with the same environment variables, configure backups and a moderation owner, and invite a small pilot group.
4. Obtain a confirmed upcoming-cycle allocation source before displaying current availability.
5. Explore a consent-based VTOP verification design with genuine account access/institutional review. Do not display a verified badge until actual enrollment evidence can be checked.

See `DATABASE_DESIGN.md` for the implemented schema, `README.md` for beginner setup, and `docs/OPERATIONS.md` for launch steps.
