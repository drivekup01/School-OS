# Shared school accounts and Firebase timetable

The Firebase project is `school-budget-3e69d`, database `(default)`, region `asia-southeast1`.
Timetable Functions use the separate `school-timetable` codebase. Deploy that codebase only.
The combined Firestore rules are maintained in School-Budget; the fragment here must never replace the combined rules.

## Accounts

Google accounts share one Firebase Auth session across the school's GitHub Pages origin.
`school_users/{uid}` is authoritative when present; existing approved attendance and budget profiles are migration fallbacks.
Admins approve exact email addresses through the protected School-Portal `users.html` page. Invitation emails are stored only in private Firestore records, never in repository configuration.
First verified Google sign-in claims the invitation and fixes its UID. An academic grant gives timetable management only. Each module has a separate role.
General users see public teacher/class timetables; all mutations require an academic or identity admin profile on the server.

## Cutover sequence

1. Deploy Functions, then combined rules (test rules in the emulator first).
2. Sign in to School-Portal `migrate.html` as the existing attendance administrator.
3. Preview live source counts and checksum, then copy the source into Firebase.
4. Verify the imported counts and approve academic emails through `users.html`.
5. Publish the frontend with `SCHOOL_OS_STORAGE='firebase'` only after successful verification.
6. Test public reading, Google sign-in, academic editing, and read-only denial. All timetable saves create version/audit records and reject stale revisions.

The old Google Sheets remain intact. Do not run a second import over an existing Firebase timetable. Public snapshots contain timetable fields, without contacts, private notes, announcements or leave history.
The former GitHub JSON sync exits immediately when Firebase storage is active.

## Separate leave system

The separate leave application is still an upstream input. “รับข้อมูลใบลาล่าสุด” on the protected migration page refreshes its records into Firebase; there is currently no scheduled refresh. New leave entries must be refreshed before arranging substitutions.
After cutover, retire the old timetable Apps Script write deployment to prevent edits to a second source. Keep the leave deployment until its own migration is completed.

## Validation

Backend tests cover role separation, Google claims, exact email invitation claims, private/public projection, UTF-8 checksums, atomic version switching, stale writers, failed staging, idempotent retries and import overwrite prevention.
Firestore emulator tests cover private profiles, all private timetable paths, active public projections and module permissions, together with the existing attendance tests.
Budget membership compatibility tests retain approved legacy roles and reject academic-to-budget privilege escalation.

This software is a prototype and may contain errors or security vulnerabilities. It should not be used in production without thorough testing, security review, and appropriate monitoring. You are responsible for ensuring that the application meets your security and compliance requirements.
