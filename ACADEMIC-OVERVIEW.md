# Academic overview

Authenticated school users see current-term active student totals, explicitly approved leave for the Bangkok date, their own upcoming substitution/exchange assignments, an external leave link, and a PNG generated with the existing teacher-view renderer. The teacher ID comes from the verified school profile; no client-selected teacher is accepted by the summary API. Unbound users see a clear empty state and never another teacher's schedule.

The summary reads existing private sources through schoolIdentity.academicOverview and rechecks the actor before returning counts and projections. It does not write attendance, leave, timetable or grade data. Active student codes are deduplicated across active current-term classrooms. No roster records are returned to the dashboard.

Only explicit approved statuses/approved=true count as approved leave. Existing leave-history records do not contain an approval field: if an overlapping record has unknown approval, the card shows an unavailable total with the known-approved count. A missing source is also unavailable. No unknown record is assumed approved. The leave snapshot date is shown when available. The external online-leave link is navigation only and is not scraped as an approval source.

Image capture refreshes the timetable, uses buildTeacherViewTable for the bound teacher, removes sticky positioning only in the temporary capture, and keeps images in browser memory. Images and data are cleared on identity changes/logout. The visible dashboard refreshes on return and at most every three minutes, with an explicit reload button. Public viewers retain the existing login/public timetable shortcuts.
