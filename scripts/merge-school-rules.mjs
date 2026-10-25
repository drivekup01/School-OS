import {readFileSync,writeFileSync} from 'node:fs';
const [baseline,output]=process.argv.slice(2);if(!baseline||!output)throw Error('Usage: merge-school-rules.mjs BASELINE OUTPUT');let rules=readFileSync(baseline,'utf8').replace(/\r\n/g,'\n');
function change(from,to){if(!rules.includes(from))throw Error('Rules anchor changed: '+from.slice(0,80));rules=rules.replace(from,()=>to);}
if(rules.includes('BEGIN SHARED IDENTITY'))throw Error('Shared identity already merged');
change("      return attSignedIn() &&\n        get(/databases/$(database)/documents/attendance_teachers/$(request.auth.uid)).data.active == true &&\n        get(/databases/$(database)/documents/attendance_teachers/$(request.auth.uid)).data.email == request.auth.token.email;","      return attSignedIn() && (schoolHasUser() ?\n        (schoolActive() && schoolRole('attendanceRole') in ['teacher','admin']) :\n        (get(/databases/$(database)/documents/attendance_teachers/$(request.auth.uid)).data.active == true &&\n         get(/databases/$(database)/documents/attendance_teachers/$(request.auth.uid)).data.email == request.auth.token.email));");
change("      return attMember() && get(/databases/$(database)/documents/attendance_teachers/$(request.auth.uid)).data.get('role','teacher') == 'admin';","      return attMember() && (schoolHasUser() ? schoolRole('attendanceRole') == 'admin' : get(/databases/$(database)/documents/attendance_teachers/$(request.auth.uid)).data.get('role','teacher') == 'admin');");
change("d.name == get(/databases/$(database)/documents/attendance_teachers/$(uid)).data.name","d.name == schoolAttendanceProfile(uid).name");
change("attId(d.teacherUid) && get(/databases/$(database)/documents/attendance_teachers/$(d.teacherUid)).data.active == true","attId(d.teacherUid) && schoolAttendanceTarget(d.teacherUid)");
change("exists(/databases/$(database)/documents/attendance_teachers/$(uid)) &&","schoolAttendanceTarget(uid) &&");
const old=`      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.firebase.sign_in_provider == 'google.com'
        && exists(/databases/$(database)/documents/budget_users/$(request.auth.uid))
        && get(/databases/$(database)/documents/budget_users/$(request.auth.uid)).data.active == true
        && get(/databases/$(database)/documents/budget_users/$(request.auth.uid)).data.email == request.auth.token.email;`;
change(old,`      return schoolGoogle() && (schoolHasUser() ?
        (schoolActive() && schoolRole('budgetRole') in ['admin','editor']) :
        (exists(/databases/$(database)/documents/budget_users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/budget_users/$(request.auth.uid)).data.active == true &&
         get(/databases/$(database)/documents/budget_users/$(request.auth.uid)).data.email == request.auth.token.email));`);
const anchor='    match /{other=**} { allow read, write: if false; }',fragment=readFileSync(new URL('../firestore.identity-timetable.fragment',import.meta.url),'utf8');change(anchor,fragment+'\n'+anchor);writeFileSync(output,rules);console.log('Central identity and timetable rules merged; procurement and budget data-path rules retained.');
