'use strict';
const {createHash}=require('node:crypto'),{capabilities}=require('./school-roles');
const {build:schedule,dateOf}=require('./attendance-schedule'),{catalog:morning}=require('./morning'),{build:home}=require('./attendance-home');
const norm=s=>String(s||'').replace(/\s+/g,''),hash=parts=>createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0,40);
function currentClasses(data,classes){return data.rooms.map(r=>{const matches=classes.filter(c=>c.active&&c.academicYear===Number(data.school.year)&&c.term===Number(data.school.semester)&&norm(c.name)===norm(r.label));if(matches.length!==1)throw Object.assign(Error('ข้อมูลห้อง '+r.label+' ของภาคเรียนปัจจุบันไม่ครบหรือซ้ำ กรุณาตรวจทะเบียนห้อง'),{code:'failed-precondition'});return {...matches[0],name:r.label};});}
function build({data,classes,profiles,assignments,actor}){
 const current=currentClasses(data,classes),caps=capabilities(actor),admin=caps?.admin??actor.attendanceRole==='admin',canMark=caps?.markAttendance??actor.attendanceRole==='teacher';
 const entries=morning(data,current,profiles,actor);
 const add=(teacher,cell,kind,date)=>{
  if(!cell.classId)return;
  const native=assignments.find(a=>a.id===cell.assignmentId),valid=native&&(!date||date>=dateOf(native.from)&&date<=dateOf(native.to));
  const target=profiles.filter(p=>p.active&&p.teacherId===teacher.id),uid=target.length===1?target[0].uid:'';
  const excludedDates=Object.values(data.exchanges||{}).filter(x=>x.active&&x.year===Number(data.school.year)&&x.term===Number(data.school.semester)).flatMap(x=>[x.a,x.b]).filter(s=>s.teacherId===teacher.id&&norm(s.className)===norm(current.find(c=>c.id===cell.classId)?.name)&&Number(String(s.period).match(/\d+/)?.[0])===cell.period).map(s=>s.date);
  entries.push({exchangeId:cell.exchangeId||'',excludedDates,id:valid?native.id:'preview_'+hash([teacher.id,cell.classId,cell.weekday,cell.period,cell.subject,kind,date||'']),kind,virtualSubject:!valid,teacherId:teacher.id,teacherIds:[teacher.id],teacherName:teacher.name,teacherUid:uid,classId:cell.classId,className:current.find(c=>c.id===cell.classId).name,subject:cell.subject,period:cell.period,weekday:cell.weekday||new Date(date+'T12:00:00+07:00').getUTCDay(),time:cell.time,from:valid?dateOf(native.from):date||dateOf(current.find(c=>c.id===cell.classId).createdAt)||'0001-01-01',to:valid?dateOf(native.to):date||'9999-12-31',date:date||null,coveredTeacherName:cell.coveredTeacherName||'',sourceTeacherId:cell.sourceTeacherId||'',active:true,canWrite:!!valid&&(admin||canMark&&uid===actor.uid)});
 };
 for(const t of data.teachers){const s=schedule({data,classes:current,profiles,assignments,actor,teacherId:t.id}),teacher={id:t.id,name:s.teacherName};for(const cell of s.cells)add(teacher,cell,'subject');}
 for(const date of new Set([...Object.keys(data.substitute||{}),...Object.values(data.exchanges||{}).flatMap(x=>[x.a.date,x.b.date]),...assignments.filter(a=>a.kind==='substitute').map(a=>dateOf(a.date))])){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)continue;
  const day=home({data,classes:current,profiles,assignments,actor:{...actor,attendanceRole:'admin'},date});
  for(const group of day.lessons.filter(g=>g.kind==='substitute'))for(const cell of group.cells)add({id:group.teacherId,name:group.teacherName},cell,'substitute',date);
 }
 return {school:{name:data.school.name,year:data.school.year,semester:data.school.semester},classes:current.map(c=>({id:c.id,name:c.name,academicYear:c.academicYear,term:c.term})),assignments:entries.map(a=>({...a,year:Number(data.school.year),term:Number(data.school.semester)}))};
}
function service(db,identity,repo){return {async get(request,input){
 const actor=await identity.resolve(request),caps=capabilities(actor);if(!(actor.active&&(caps?caps.readAll:actor.registered&&['admin','teacher','viewer'].includes(actor.attendanceRole))))throw Object.assign(Error('ไม่มีสิทธิ์ดูข้อมูลเช็คชื่อ'),{code:'permission-denied'});
 if(Object.keys(input).some(k=>k!=='method'))throw Object.assign(Error('คำขอไม่ถูกต้อง'),{code:'invalid-argument'});
 const [table,c,p,a]=await Promise.all([repo.read(),db.collection('attendance_classes').get(),db.collection('school_users').get(),db.collection('attendance_assignments').get()]);
 await require('./exchange-attendance').sync(db,table.data,table.version,()=>require('firebase-admin/firestore').FieldValue.serverTimestamp(),require('firebase-admin/firestore').Timestamp);
 const liveAssignments=Object.keys(table.data.exchanges||{}).length?await db.collection('attendance_assignments').get():a;
 return {...build({data:table.data,classes:c.docs.map(d=>({id:d.id,...d.data()})),profiles:p.docs.map(d=>({uid:d.id,...d.data()})),assignments:liveAssignments.docs.map(d=>({id:d.id,...d.data()})),actor}),version:table.version};
 }};}
module.exports={currentClasses,build,service};
