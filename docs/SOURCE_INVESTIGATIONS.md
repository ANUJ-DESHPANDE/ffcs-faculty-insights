# VTOP and Reddit investigation (11 October 2026)

## VTOP enrollment verification

VIT's [VTOP login page](https://vtoponline.vit.ac.in/vtop/login) describes the portal as an academic service for students, faculty and others. VIT's [FFCS explanation](https://blogs.vit.ac.in/ffcs-empowering-students-to-architect-their-education/) says a student can register for courses and receive a registered timetable in VTOP. These public sources establish the concept but **do not reveal the authenticated timetable markup, export format, access terms or historical enrollment coverage**. We have not accessed a real student session.

The implemented `/verification-lab` is a browser-only research preview. A student may paste a **redacted** timetable line; the code looks for a historical course code and faculty name on the same line and shows candidate matches. Nothing is sent to the server or saved. A match is not proof of enrollment, and no review receives a verified badge. This exercise helps test name matching and user consent language while real data format remains unknown.

A production verification flow needs informed student testing of actual VTOP pages or exports, a determination of what can be accessed within the student's own authenticated browser session, institutional/legal review where applicable, a preview of exactly which facts leave the device, retention limits, and a way to resolve faculty identity across semesters. It must never ask for or transmit VTOP passwords, cookies or tokens. A VIT email address alone remains unverified.

The current three-review mission uses manual selection of faculty a student says they studied under, then ranks those by published review coverage. See [auth and verification options](AUTH_AND_VERIFICATION.md) for the VIT Google pilot and the difference between account control and enrollment proof.

## Reddit external discussions

Reddit's [Developer Terms](https://redditinc.com/policies/developer-terms), [Data API Terms](https://redditinc.com/policies/data-api-terms) and [developer access guide](https://support.reddithelp.com/hc/en-us/articles/14945211791892-Developer-Platform-Accessing-Reddit-Data) describe approval, terms, rate limits and restrictions on API use, storage and commercial use. We have not obtained API approval or a data-use agreement. No crawler, sentiment extraction or imported Reddit review data is implemented.

The safe first step is a manually curated direct link. An admin can add a Reddit discussion URL from `/admin` after checking it for relevance. Faculty pages label these as external discussions, separate from authenticated reviews. We display no copied Reddit text, assign no rating from a Reddit post, and do not claim its author studied with the faculty. Before automating discovery or retaining Reddit content, obtain appropriate access and recheck the current terms.
