# FFCS Faculty Insights

An independent student-built decision aid for VIT Vellore's FFCS. Search courses or faculty, inspect an archived allocation snapshot, save candidates and compare the evidence behind them. The goal is to make useful campus knowledge available beyond private chats and senior networks.

**Status:** functional local prototype. Current-cycle availability, real student reviews, sign-in and live review submission are not yet available. The site is not affiliated with VIT.

## Features

- Search by course code, course title or faculty name; browse 450 courses and 904 faculty.
- Course pages with archived faculty, slot and venue options, slot filtering and sorting.
- Faculty profiles with known courses, archived offerings and sample-aware reputation presentation.
- Shortlist saved in browser localStorage, plus comparison of up to four saved faculty.
- Dedicated fictional demo course for trying simulated ratings without assigning invented opinions to real people.
- About and contribution pages explaining anonymity, data sources and the future reciprocal contribution model.

## Screenshots

Screenshots will be added after the first live preview.

## Stack and setup

Next.js 16 App Router, React, TypeScript and CSS. The product runs from a checked-in, typed local catalog; no database account or secrets are needed.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Try `/courses/DEMO302L` for the full fictional decision flow or `/courses/BCSE302L` for a real historical course record.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Import data integrity checks |
| `npm run build` | Production build |
| `npm run import:ffcs -- <checkout path>` | Rebuild the normalized snapshot from an FFCS-inator checkout |

## Data sources and privacy

The public archive is normalized from [CodeChef-VIT's FFCS-inator](https://github.com/CodeChefVIT/ffcs) `prod` branch, commit `f8bb2fc` from June 28, 2026. It contains historical course/faculty/slot/venue rows, **not confirmed upcoming availability**. FFCS-inator is MIT licensed; its license is retained in [docs/third-party/FFCS-INATOR-LICENSE.txt](docs/third-party/FFCS-INATOR-LICENSE.txt). Thanks to CodeChef-VIT for publishing the source data and timetable planner.

The demo ratings are fictional and isolated under `DEMO302L` and visibly labeled. No real reviews, verification claims or grade curves are published. Future reviews will be publicly anonymous; private account ownership is planned for abuse control. This project will never collect VTOP passwords.

## Routes

`/`, `/courses`, `/courses/[code]`, `/faculty`, `/faculty/[id]`, `/shortlist`, `/compare`, `/contribute`, `/about`.

## Roadmap

The immediate priority is a verified upcoming FFCS snapshot, followed by real student sign-in and protected review submissions. Grade curves need offering-specific evidence. Lab behavior and crowdsourced CAT averages are later experiments. See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) and [DATABASE_DESIGN.md](DATABASE_DESIGN.md) for decisions and boundaries.
