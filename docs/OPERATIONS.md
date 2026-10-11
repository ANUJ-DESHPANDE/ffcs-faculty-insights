# Operating and launching FFCS Faculty Insights

## Before inviting students

The code alone cannot collect real reviews. The project owner must create Supabase, apply the migration and seed, configure email sending and deploy the site. Follow the short sequence in the [README](../README.md#enable-real-reviews). Do not announce launch until the end-to-end test below passes.

Keep `.env.local` out of Git. Use only the public Supabase project URL and publishable key in the app. SQL Editor is for the project owner; never put database owner or service-role credentials into client variables. Review the project backup and retention settings in the Supabase dashboard before collecting submissions.
Set `NEXT_PUBLIC_SUPPORT_EMAIL` to a monitored private mailbox before public launch so account deletion requests have a real destination. The public privacy page explains the data held and self-service review deletion.

## Two-account launch test

1. Use an admin email and a second ordinary email. Test magic-link delivery, callback and page refresh for both. The second email must **not** be a project team member; this confirms custom SMTP is working for reachable external inboxes. Separately pilot Google OAuth with a VIT student-domain account before enabling its button. Do not assume custom SMTP can reach VIT inboxes that block outside senders.
2. With the ordinary account, add faculty actually studied under to the three-review list. Confirm the least-reviewed appear first. Submit a review with overall, teaching, grading, workload, take-again and at least 80 characters, and see the saved/pending state. Confirm missing core answers are rejected. Refresh and return to `/review/[facultyId]`; the earlier answers should load for editing.
3. Confirm progress counts one saved review toward three, including pending reviews. Before moderation, use a signed-out browser to confirm the note and aggregate count are absent from the faculty profile.
4. Sign in as admin, open `/admin`, publish the pending review. Confirm the public profile shows “Anonymous student” and no author ID, email or registration number in its API response. Confirm its count increases but its aggregate score remains hidden below five published ratings.
5. Edit the review using the ordinary account. Confirm the old public version disappears while the changed review is pending again. Approve it again.
6. From the other account, report the published review. Confirm the admin queue and open-report count update. Hide it and confirm it leaves public results.
7. Confirm ordinary users cannot call admin RPCs or read `app_private` tables. Test `/admin` returns a not-found page for them.
8. Test the deployed host separately; correct its Supabase redirect URL and environment variables. Check small-screen review entry and profile pages.

The migration has not been exercised against a hosted database as of 11 October 2026, so this checklist is a required deployment gate, not a record of completed testing.

## Daily moderation

Check `/admin` at least once a day during launch. Read every pending written note for spam, harassment, personal information, unsupported allegations and obvious duplicates. Publish useful first-person experience; hide unsuitable content. A report sends an already published review back into the admin queue; “Publish / keep” resolves the report without changing the published status. Actions are recorded in `app_private.moderation_actions`. Avoid presenting moderation as enrollment verification.

For the early campaign, review the zero-review and one-to-two-review faculty coverage in admin. Invite students who actually studied under those faculty. Do not seed invented opinions or ask students to review someone they do not know. Use consent-based group outreach rather than unsolicited bulk messages.

## Simple launch and distribution plan

1. Pilot with a small group of seniors or club members. Ask them to complete a review without guidance; record time to submit, confusing labels and whether the written prompt helped them give a useful bottom line.
2. Fix friction, then share direct faculty links in relevant student communities with a clear statement that the archive is historical and reviews are self-attested. Ask group moderators before posting.
3. Track weekly counts of sign-in links requested, accounts that complete a first review, written-review share, median moderation delay, reports per published review, and faculty moving from zero to at least one useful review. Supabase Auth and the private reviews table contain the raw counts; do not publish identity data.
4. Retain a named moderation owner and a fallback owner. Review backups, restore procedure and Supabase usage limits weekly during FFCS traffic.
5. Add current-cycle offering claims only after a dated source is verified. Measure whether students find a useful profile and then continue to a timetable planner; do not infer that archived slot rows are open seats.

## Incident handling

If a review exposes personal data or contains a harmful allegation, hide it through `/admin` immediately, then inspect the moderation trail. If sign-in emails fail, confirm custom SMTP and Supabase Auth logs before sending more invitations. If RLS or public function boundaries appear broken, stop writes and public promotion while fixing the migration. Restore from a tested backup if data is lost; do not overwrite the historical archive with an unverified import.
