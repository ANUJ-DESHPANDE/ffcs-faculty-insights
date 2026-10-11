# FFCS Faculty Insights

An independent, student-built faculty decision aid for VIT Vellore. Search a historical public FFCS archive, compare faculty, and contribute moderated anonymous reviews.

**Status (11 October 2026):** the review system is implemented locally, but **no Supabase project or hosted deployment is connected yet**. Real accounts and persistent reviews cannot be used until the [setup steps](#enable-real-reviews) are completed and tested. The June 2026 course and offering archive does not establish current FFCS availability. This project is not affiliated with VIT.

## What students see

- Search 450 courses and 904 faculty, with 5,643 historical offering rows.
- Course pages show archived slots and venues with faculty filtering and sorting.
- Faculty pages put anonymous written experiences near the top, followed by course history. Scores appear only after five published ratings; optional metric averages each need five answers.
- Save faculty to a browser-only shortlist and compare up to four.
- Sign in by email, choose a faculty you studied under, give one overall rating, and optionally add a short written note or detailed teaching, grading, workload, lab ease and take-again answers. No attendance rating.
- Reviews are privately owned, self-attested, editable, and pending until an admin approves them. Public review results omit names, emails and author IDs. Email sign-in is **not** enrollment verification.
- Signed-in readers can report a published review. Admins can moderate and see contribution and coverage statistics.

## Run locally in PowerShell

Open PowerShell, then paste these **commands only** (do not paste the `PS C:\...>` prompt):

```powershell
Set-Location 'C:\Users\adita\Desktop\FFCSFACULTY'
npm install
npm run dev
```

Open <http://localhost:3000>. Leave the PowerShell window running while you use the site. Press `Ctrl+C` there to stop it. Without Supabase setup, browsing works and the review page says collection is being set up.

## Enable real reviews

1. Create a Supabase project. Open **SQL Editor** and run [`supabase/migrations/202610110001_reviews.sql`](supabase/migrations/202610110001_reviews.sql), then [`supabase/seed.sql`](supabase/seed.sql), in that order. The seed contains only historical faculty and course names. Keep the upstream license in the repository.
2. In Supabase **Project Settings → API Keys**, copy the project URL and publishable key. Copy [`.env.example`](.env.example) to `.env.local` and paste those two values. Set a private support email for account deletion requests. **Never** paste a service-role or secret key into `NEXT_PUBLIC_` variables.
3. In **Authentication → URL Configuration**, set your deployed site URL and allow `http://localhost:3000/auth/confirm**` for local testing, plus your deployed `https://.../auth/confirm**` URL.
4. In **Authentication → Email Templates → Magic Link**, use the link `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email`. This app always supplies a `next` query parameter in `RedirectTo`, so the appended `&` is intentional. Send a test link and confirm it opens `/review/[facultyId]` after sign-in.
5. Configure **custom SMTP** before public sign-ups. Supabase's default mail service only sends to project team addresses and is not suitable for launch. Test delivery to an external address.
6. After signing in once, find your user UUID in **Authentication → Users**. In SQL Editor, grant yourself admin access: `insert into app_private.admins (user_id) values ('YOUR-USER-UUID');`. Visit `/admin` to moderate. Never give admin access through a public form.
7. Run the [launch checks](docs/OPERATIONS.md) with two distinct test accounts before inviting students. Deploy the Next.js app with the same two environment variables and correct auth redirect URL. Keep the site private until the end-to-end flow succeeds.

More detail, including moderation and backups: [Operations guide](docs/OPERATIONS.md).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Data checks |
| `npm run build` | Production build |
| `npm run seed:supabase` | Regenerate the historical directory seed |
| `npm run import:ffcs -- <checkout path>` | Rebuild the normalized archive from an FFCS-inator checkout |

## Data and trust boundaries

The public catalog was normalized from [CodeChef-VIT's FFCS-inator](https://github.com/CodeChefVIT/ffcs) `prod` commit `f8bb2fc` dated June 28, 2026. It is historical and not confirmed for the next registration cycle. The source is MIT licensed; [the upstream license](docs/third-party/FFCS-INATOR-LICENSE.txt) is retained. Do not publish an upcoming availability claim without a separately verified and dated snapshot.

No fictional ratings are shown alongside real faculty. Reviews are subjective and self-attested. VTOP passwords, session cookies and registration numbers are not collected. External Reddit links are manually curated and never counted as authenticated reviews. Grade curves are not displayed without class-specific evidence.

See [database design](DATABASE_DESIGN.md), [project context](PROJECT_CONTEXT.md), [operations](docs/OPERATIONS.md), and [source investigations](docs/SOURCE_INVESTIGATIONS.md).
