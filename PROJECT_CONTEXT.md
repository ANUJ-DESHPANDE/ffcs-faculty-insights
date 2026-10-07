# FFCS Faculty Insights — living project context

## Purpose

An independent, student-built decision aid for VIT Vellore FFCS. It aims to turn informal faculty knowledge into structured, searchable information while making uncertainty and source age visible. It complements timetable planners such as FFCS-inator: students use this project to judge faculty options, then build a timetable elsewhere.

## Implemented now (October 2026)

- Next.js App Router, React, TypeScript and plain CSS. No cloud service required for `npm run dev`.
- Search and browse 450 courses and 904 faculty from a public FFCS-inator snapshot, with 5,643 offering rows including slots, venues, schools and categories.
- Course and faculty detail routes, slot filtering, sorting, localStorage shortlist, and side-by-side comparison of up to four saved faculty.
- Separate fictional demo course (`DEMO302L`) and fictional faculty with simulated ratings for exploring the interface. These records are explicitly labeled; no invented opinions are attached to real people.
- Sample-aware reputation presentation: one or two ratings show insufficient data, three or four show early data, and aggregate scores appear at five or more. Real faculty currently have no ratings.
- Static About and contribution pages. The contribution page explains the planned flow but does not accept or store reviews.
- Importer `scripts/import-ffcs-inator.cjs` normalizes a local checkout of FFCS-inator into `src/data/ffcs-snapshot.json`.

## Data provenance and current availability

The imported source is CodeChef-VIT's [FFCS-inator](https://github.com/CodeChefVIT/ffcs), `prod` branch, commit `f8bb2fc` dated 2026-06-28. The snapshot JSON records the full commit, import time and source URL. It is historical; no upcoming FFCS availability is confirmed. Do not switch any offering to “current” without a dated, verified cycle snapshot. See `docs/third-party/FFCS-INATOR-LICENSE.txt` for the upstream MIT license.

## Current architecture

`src/lib/catalog.ts` is the typed application data boundary. Pages and components use its domain records and query helpers; external TypeScript source shapes are kept inside the importer. The product currently reads a static JSON snapshot and a small, clearly fictional demo dataset. This is deliberately simple for a read-heavy prototype. The next persistence adapter can load the same domain shape from PostgreSQL/Supabase without making UI components understand the upstream source layout.

## Current product decisions

- Faculty reputation belongs primarily to faculty; course context on a review is optional.
- Offerings are dated snapshots linking course, faculty, cycle, slot and venue. Historical associations never imply current availability.
- Grade curves are tied to specific class offerings, separate from subjective reviews. No curve is displayed without evidence.
- Public reviews will always be anonymous. Private account ownership will be needed for edits and abuse control.
- A future reciprocal access model should ask students to review a few faculty they actually studied under, prioritizing scarce coverage, before unlocking detailed community data.
- The site will never request VTOP passwords. Any future browser-assisted import should process locally, preview normalized facts and require consent.

## Postponed

Real review submission, VIT student authentication, enrollment verification, grade-curve collection, verified-only aggregates, current-cycle import, server persistence, review moderation, and a reciprocal access gate. CAT averages and lab-specific questions also remain research topics. No fake verification is implemented.

## Superseded assumptions

The original scaffold described reviews as mandatory faculty + course ratings. The updated product brief changed that: reviews are faculty-level with optional course context. The old `DATABASE_DESIGN.md` was only a proposal; no database schema or migration had been created.

## Next steps before FFCS

1. Obtain and verify a dated upcoming allocation snapshot; add it as a new cycle and clearly mark its coverage.
2. Set up Supabase/PostgreSQL and implement anonymous public reads with protected review writes.
3. Design VIT student sign-in, review ownership, editing and moderation without collecting VTOP credentials.
4. Pilot the review questions with actual students; validate directions and add lab signals only where useful.
5. Collect real reviews and course-specific grading evidence with provenance before enabling live reputation rankings.
