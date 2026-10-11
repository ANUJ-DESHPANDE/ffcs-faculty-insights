# Sign-in and enrollment verification

## Four different claims

| Method | What it can establish | What it cannot establish |
| --- | --- | --- |
| Email link to any reachable inbox | Control of that inbox | VIT affiliation or enrollment |
| Google OAuth returning a verified `@vitstudent.ac.in` account | Control of an account with VIT's student-domain address, if VIT allows this app | Current enrollment, Vellore campus, or any faculty/course taken |
| Student pastes redacted VTOP text into the local preview | Possible course/faculty matches for user review | Authenticity; pasted text can be edited |
| Institution-approved, signed enrollment record or authenticated API | Potentially a specific student's course/faculty enrollment, subject to matching and consent | Other terms or semesters not included in that record |

VIT's [published IT policy](https://chennai.vit.ac.in/files/IT-Policy-Aug2024-Ver5.0%281%29.pdf) says students use `vitstudent.ac.in` addresses on Google Workspace. The project owner reports that outside OTP messages do not arrive in student inboxes. This is an observed product constraint, not proof that all VIT domains reject all external mail. Google Workspace administrators can also [restrict third-party OAuth apps](https://support.google.com/a/answer/7281227), so Google sign-in needs a real student-account pilot or VIT allowlisting.

## VIT Google sign-in pilot

The code contains an opt-in “Continue with VIT Google account” button. It is disabled by default via `NEXT_PUBLIC_VIT_GOOGLE_SIGN_IN=false`. Supabase [supports Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google). Configure a Google Cloud OAuth client with only basic sign-in scopes, add the redirect URI shown by Supabase's Google provider settings, enable that provider in Supabase, and test with an actual VIT student-domain account. Then set `NEXT_PUBLIC_VIT_GOOGLE_SIGN_IN=true` on the app and redeploy.

The account picker sends a `hd=vitstudent.ac.in` hint. This **does not enforce** domain membership. After the OAuth callback, the server checks that the returned account has a confirmed email ending in exactly `@vitstudent.ac.in` and a matching, email-verified Google identity; it signs out other accounts from that button. Do not turn on a “verified student” badge merely because this pilot works. Personal email-link sign-in remains available and self-attested in the current product. If VIT blocks the OAuth app, ask VIT's IT administrators whether they can permit this app; there is no legitimate client-side bypass.

## Faculty enrollment

The review form currently asks the student to attest that they studied under the faculty. The three-review mission ranks only faculty **the student manually selects** by existing review coverage. It does not claim to fetch their VTOP history.

A genuine verified-enrollment workflow needs an institution-supported, consented read of the student's **past registered courses and faculty**, not a public allocation list. The ideal path is VIT-provided SSO and a scoped enrollment API or signed export. The app would request only course, faculty and term evidence, match it to directory IDs, let the student preview the matches, then retain only a narrow private verification record. Public reviews would still omit identity. We have no evidence of a public VTOP OAuth or enrollment API, and no access to authenticated page structures.

A browser-local helper can make manual matching easier, but copied text, screenshots and extension-reported DOM data are controlled by the user and are not cryptographic proof. No VTOP password, cookie or session token should ever be sent to this app. Until a verifiable source is available, reviews stay labelled self-attested and the three-review list stays manual.

## What would be needed to mandate VIT identity

First, complete the Google pilot with VIT accounts and confirm third-party sign-in works reliably. Then add a database-side review-write rule requiring the verified Google/VIT identity, migrate existing self-attested accounts deliberately, and update privacy/support copy. A UI-only email-domain restriction is insufficient because clients can call Supabase functions directly. This rule should not be switched on while the only VIT-domain login route is untested or blocked.
