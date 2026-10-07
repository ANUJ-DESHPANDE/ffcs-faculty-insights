# Codex Working Rules

- Read `PROJECT_CONTEXT.md` before making architectural changes.
- Keep the project simple and beginner-friendly.
- Do not add major libraries or services unless necessary.
- Explain important architectural changes before making them.
- Do not redesign the database schema without explicit approval.
- Keep SQL migrations explicit and readable.
- Do not implement VTOP credential collection.
- Avoid premature optimization, microservices, Docker, Kubernetes, Redis, or other unnecessary infrastructure.
- After meaningful changes, run appropriate checks, tests, or build commands when possible.
- Prefer maintainable code that another student or college club could understand and take over later.

## Current project facts

- `PROJECT_CONTEXT.md` is the living product memory; `DATABASE_DESIGN.md` distinguishes implemented local records from proposed SQL tables.
- `src/data/ffcs-snapshot.json` is historical public FFCS-inator data from June 2026. Never label it current availability without a confirmed new snapshot.
- `DEMO302L` and its faculty/ratings are fictional interface examples. Never attach simulated opinions to real faculty.
- Reviews are faculty-level with optional course context. Public reviews must be anonymous. There is no live review submission or VIT authentication yet.
- Preserve the upstream FFCS-inator license and provenance when updating imported data. Run lint, typecheck, tests and build after meaningful work.
