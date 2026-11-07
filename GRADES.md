# Student grade reports

Academic staff open School-Portal → staff → งานวิชาการ → ผลการเรียนนักเรียน.
`grades.html` is the standalone entry. School-OS owns PDF ingestion and publication;
School-Portal owns the authenticated student reader.

1. Select final/midterm and upload a selectable-text PDF, one student per page,
   at most 6 MiB and 100 pages, one academic year/term per file.
2. Review the roster match, each course table, and original page. Student IDs keep
   leading zeros; current roster year, class and number must also match. Unresolved
   pages cannot publish. Roster names replace unreliable PDF font text.
3. Correct course names in the batch editor when the PDF's Thai encoding is faulty.
   Numeric scores remain those extracted from the source. Upload a corrected PDF
   if scores need correction. Confirm review and publish selected students.
4. Existing reports in the same year/term/type require explicit replacement.
   Withdrawing an older batch never removes its newer replacement.

The original and isolated one-page files are stored in the private bucket
`school-budget-3e69d-student-reports` with public access prevention. There are no
public download URLs. Firestore collections `school_grade_batches`,
`school_grade_students`, `school_grade_operations` and `school_grade_audit` are
server-only under the existing default-deny rules. Only active verified Google
academic/admin roles can use `schoolGrades`; live role and roster checks run at
publication. Portal's `schoolStudentReports` derives the student from the existing
validated account binding and checks code/name ownership and live publication.

Run backend tests with `pnpm test` in functions. The supplied 19-page PDF was tested
locally: 19 roster matches, 20 course/activity rows each, and every split page rendered
identically to its original. No sample student reports are seeded or auto-published.
Image-only or different report layouts require an additional parser and currently
remain unresolved. The UI requires review before publication.

Wrong uploads can be removed from the latest-batches selector with gradeDelete. Published batches must be withdrawn first. Deletion is a server-checked, idempotent soft deletion: original files and audit metadata remain private for internal review; deleted batch details/previews/publication are unavailable.
