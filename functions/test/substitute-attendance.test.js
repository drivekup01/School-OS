const {test}=require('node:test'),assert=require('node:assert/strict'),{plan,service}=require('../substitute-attendance'),{memory}=require('./memory'),{grants}=require('../school-roles');
function fixture(){
 const profile={uid:'u2',teacherId:'t2',active:true,...grants('teacher')};
 const data={school:{year:'2569',semester:'2'},teachers:[{id:'t1',first:'หนึ่ง',last:'ทดสอบ'},{id:'t2',first:'สอง',last:'ทดสอบ'}],rooms:[{id:'r1',label:'ม.1/1'}],slots:[{id:1,label:'คาบที่ 1',start:'08:30',end:'09:20'}],days:['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์'],sched:{r1_1_พุธ:{subject:'ไทย',teacher:'หนึ่ง ทดสอบ'}},substitute:{'2026-10-28':{absentList:[{teacherId:'t1',manualOnly:true,periods:[{slotId:1,roomId:'r1',subject:'ไทย',subTeacher:'สอง ทดสอบ'}]}]}}};
 const classes=[{id:'c1',name:'ม.1/1',active:true,academicYear:2569,term:2}],profiles=[profile],db=memory({'school_users/u2':profile,'attendance_classes/c1':classes[0],'timetable_state/current':{version:'v1'}});
 return {data,classes,profiles,profile,db,version:'v1'};
}
const timestamps={fromDate:d=>d.toISOString()},stamp=()=>123;
test('manual and leave-based substitutes create exact-day lessons for the linked replacement teacher',()=>{
 const f=fixture(),a=plan(f.data,f.profiles,f.classes,f.profile);assert.equal(a.length,1);assert.equal(a[0].kind,'substitute');assert.equal(a[0].teacherUid,'u2');assert.equal(a[0].date,'2026-10-28');assert.equal(a[0].from,a[0].to);assert.equal(a[0].coveredTeacherName,'หนึ่ง ทดสอบ');
 delete f.data.substitute['2026-10-28'].absentList[0].manualOnly;assert.deepEqual(plan(f.data,f.profiles,f.classes,f.profile),a);
});
test('unassigned periods, ambiguous names/accounts/classes, other terms and busy teachers grant nothing',()=>{
 for(const kind of ['unassigned','duplicate-name','duplicate-account','duplicate-class','old-term','busy','activity','wrong-subject','invalid-date','conflicting-substitute']){
  const f=fixture(),p=f.data.substitute['2026-10-28'].absentList[0].periods[0];
  if(kind==='unassigned')p.subTeacher='';
  if(kind==='duplicate-name')f.data.teachers.push({id:'t3',first:'สอง',last:'ทดสอบ'});
  if(kind==='duplicate-account')f.profiles.push({...f.profile,uid:'duplicate'});
  if(kind==='duplicate-class')f.classes.push({...f.classes[0],id:'c2'});
  if(kind==='old-term')f.classes[0].term=1;
  if(kind==='busy'){f.data.rooms.push({id:'r2',label:'ม.1/2'});f.data.sched.r2_1_พุธ={subject:'คณิต',teacher:'สอง ทดสอบ'};}
  if(kind==='activity')f.data.teacherSched={a:{teacherId:'t2',slotId:1,day:'พุธ'}};
  if(kind==='wrong-subject')p.subject='ไม่ตรง';
  if(kind==='invalid-date'){f.data.substitute['2026-02-30']=f.data.substitute['2026-10-28'];delete f.data.substitute['2026-10-28'];}
  if(kind==='conflicting-substitute'){f.data.teachers.push({id:'t3',first:'สาม',last:'ทดสอบ'});f.data.rooms.push({id:'r2',label:'ม.1/2'});f.classes.push({...f.classes[0],id:'c2',name:'ม.1/2'});f.data.sched.r2_1_พุธ={subject:'ไทย',teacher:'สาม ทดสอบ'};f.data.substitute['2026-10-28'].absentList.push({teacherId:'t3',periods:[{...p,roomId:'r2'}]});}
  assert.equal(plan(f.data,f.profiles,f.classes,f.profile).length,0,kind);
 }
});
test('all three rooms of one original teacher and slot become separate attendance lessons',async()=>{
 const f=fixture(),absence=f.data.substitute['2026-10-28'].absentList[0];
 for(let i=2;i<=3;i++){f.data.rooms.push({id:'r'+i,label:'ม.1/'+i});f.classes.push({...f.classes[0],id:'c'+i,name:'ม.1/'+i});f.db.values.set('attendance_classes/c'+i,f.classes.at(-1));f.data.sched['r'+i+'_1_พุธ']={subject:i===3?'แนะแนว':'ไทย',teacher:'หนึ่ง ทดสอบ'};absence.periods.push({...absence.periods[0],roomId:'r'+i,subject:i===3?'แนะแนว':'ไทย'});}
 const jobs=plan(f.data,f.profiles,f.classes,f.profile);assert.equal(jobs.length,3);assert.equal(new Set(jobs.map(j=>j.id)).size,3);assert.deepEqual(jobs.map(j=>j.classId),['c1','c2','c3']);
 await service(f.db,stamp,timestamps).sync(f);for(const job of jobs)assert.equal(f.db.values.get('attendance_assignments/'+job.id).active,true);
});
test('sync is idempotent, preserves ACLs and retires cancelled lessons without deleting marks',async()=>{
 const f=fixture(),s=service(f.db,stamp,timestamps),a=plan(f.data,f.profiles,f.classes,f.profile)[0];
 f.db.values.set('attendance_access/u2/classes/c1',{active:true,canRead:true,canMorning:true,canBehavior:true,canSubject:false});
 await s.sync(f);assert.equal(f.db.values.get('attendance_assignments/'+a.id).date,'2026-10-27T17:00:00.000Z');const g=f.db.values.get('attendance_access/u2/classes/c1');assert.equal(g.canSubject,true);assert.equal(g.canMorning,true);assert.equal(g.canBehavior,true);
 assert.equal((await s.sync(f)).changes,0);
 f.db.values.set('attendance_assignments/'+a.id+'/days/20261028/marks/student',{status:'present'});f.data.substitute={};await s.sync(f);assert.equal(f.db.values.get('attendance_assignments/'+a.id).active,false);assert.ok(f.db.values.has('attendance_assignments/'+a.id+'/days/20261028/marks/student'));
});
test('a moved timetable or revoked profile cannot provision substitute permissions',async()=>{
 for(const kind of ['version','revoked','duplicate']){
  const f=fixture();if(kind==='version')f.db.values.set('timetable_state/current',{version:'v2'});if(kind==='revoked')f.db.values.set('school_users/u2',{...f.profile,active:false});if(kind==='duplicate')f.db.values.set('school_users/other',{...f.profile,uid:'other'});
  await assert.rejects(service(f.db,stamp,timestamps).sync(f));assert.ok(![...f.db.values.keys()].some(k=>k.startsWith('attendance_assignments/')));
 }
});
test('saving cancellation immediately revokes managed attendance jobs and preserves marks and manual jobs',async()=>{
 const f=fixture(),s=service(f.db,stamp,timestamps);await s.sync(f);const id=plan(f.data,f.profiles,f.classes,f.profile)[0].id;
 f.db.values.set('attendance_assignments/'+id+'/days/20261028/marks/s1',{status:'present'});f.db.values.set('attendance_assignments/manual',{active:true,kind:'substitute',teacherUid:'u2'});
 f.data.substitute={};assert.equal((await s.revokeMissing({data:f.data,version:'stale',uid:'admin'})).changes,0);assert.equal(f.db.values.get('attendance_assignments/'+id).active,true);
 assert.equal((await s.revokeMissing({...f,uid:'admin'})).changes,1);assert.equal(f.db.values.get('attendance_assignments/'+id).active,false);assert.equal(f.db.values.get('attendance_assignments/manual').active,true);assert.ok(f.db.values.has('attendance_assignments/'+id+'/days/20261028/marks/s1'));
});
