'use strict';
const {capabilities}=require('./school-roles');
const {build:schedule,dateOf}=require('./attendance-schedule');
const {plan}=require('./substitute-attendance');
const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
const norm=v=>String(v||'').replace(/\s+/g,'');
const name=t=>(t.prefix||'')+(t.first||'')+' '+(t.last||'');
function build({data,profiles,classes,assignments,actor,date}){
 if(!validDate(date))throw Object.assign(Error('วันที่ไม่ถูกต้อง'),{code:'invalid-argument'});
 const scope=actor.attendanceRole==='admin'||actor.attendanceRole==='viewer'?'school':'teacher';
 const teachers=data.teachers.filter(t=>scope==='school'||t.id===actor.teacherId),weekday=new Date(date+'T12:00:00+07:00').getUTCDay();
 const groups=new Map(),current=classes.filter(c=>c.active&&c.academicYear===Number(data.school.year)&&c.term===Number(data.school.semester));
 const add=(teacher,cell,kind)=>{
  const key=JSON.stringify([teacher.id,kind,String(cell.slotId??cell.period),cell.sourceTeacherId||'']);
  if(!groups.has(key))groups.set(key,{teacherId:teacher.id,teacherName:name(teacher),kind,period:cell.period,time:cell.time,cells:[]});
  const group=groups.get(key);if(!group.cells.some(c=>c.className===cell.className&&c.subject===cell.subject))group.cells.push(cell);
 };
 for(const teacher of teachers){
  const table=schedule({data,profiles,classes,assignments,actor,teacherId:teacher.id});
  for(const cell of table.cells.filter(c=>c.weekday===weekday)){
   const job=assignments.find(a=>a.id===cell.assignmentId);
   add(teacher,{...cell,assignmentId:job&&date>=dateOf(job.from)&&date<=dateOf(job.to)?job.id:''},'subject');
  }
  // Plan a display-only timetable projection even before a teacher links an account.
  // These IDs are never returned as writable assignments or saved to Firestore.
  const preview={uid:'preview',teacherId:teacher.id,active:true,attendanceRole:'teacher'};
  const target=profiles.filter(p=>p.active&&p.teacherId===teacher.id);
  for(const cell of plan({...data,substitute:data.substitute?.[date]?{[date]:data.substitute[date]}:{}},[preview],classes,preview).filter(c=>c.date===date)){
   const job=assignments.find(a=>a.active&&a.kind==='substitute'&&target.length===1&&a.teacherUid===target[0].uid&&a.classId===cell.classId&&a.period===cell.period&&String(a.sourceTeacherId)===String(cell.sourceTeacherId)&&a.subject===cell.subject&&dateOf(a.date)===date);
   add(teacher,{className:cell.className,classId:cell.classId,subject:cell.subject,period:cell.period,slotId:cell.sourceSlotId,time:cell.time,sourceTeacherId:cell.sourceTeacherId,coveredTeacherName:cell.coveredTeacherName,assignmentId:job?.id||''},'substitute');
  }
  // Keep explicit attendance-only substitute assignments, but exclude stale auto-generated jobs.
  for(const job of assignments.filter(a=>a.active&&a.kind==='substitute'&&a.source!=='timetable-substitute'&&target.length===1&&a.teacherUid===target[0].uid&&dateOf(a.date)===date&&date>=dateOf(a.from)&&date<=dateOf(a.to)&&current.some(c=>c.id===a.classId)))add(teacher,{className:job.className,subject:job.subject,period:job.period,time:job.time,assignmentId:job.id,sourceTeacherId:job.sourceTeacherId||'',coveredTeacherName:job.coveredTeacherName||''},'substitute');
 }
 const homerooms=data.rooms.filter(r=>[r.homeroom,r.homeroom2,r.homeroom3].some(id=>id&&teachers.some(t=>t.id===id))).map(r=>({id:r.id,name:r.label}));
 const lessons=[...groups.values()].sort((a,b)=>a.period-b.period||a.teacherName.localeCompare(b.teacherName,'th')||a.kind.localeCompare(b.kind));
 return {date,scope,school:{year:data.school.year,semester:data.school.semester},homerooms,lessons,counts:{homerooms:homerooms.length,subject:lessons.filter(a=>a.kind==='subject').length,substitute:lessons.filter(a=>a.kind==='substitute').length}};
}
function service(db,identity,repo){return {async get(request,input){
 const actor=await identity.resolve(request),caps=capabilities(actor);
 if(!(actor.active&&(caps?caps.readAll:actor.registered&&['teacher','admin','viewer'].includes(actor.attendanceRole))))throw Object.assign(Error('ไม่มีสิทธิ์ดูข้อมูลเช็คชื่อ'),{code:'permission-denied'});
 if(Object.keys(input).some(k=>!['method','date'].includes(k)))throw Object.assign(Error('คำขอไม่ถูกต้อง'),{code:'invalid-argument'});
 const date=input.date||new Date(Date.now()+25200000).toISOString().slice(0,10);if(!validDate(date))throw Object.assign(Error('วันที่ไม่ถูกต้อง'),{code:'invalid-argument'});
 const [table,p,c,a]=await Promise.all([repo.read(),db.collection('school_users').get(),db.collection('attendance_classes').get(),db.collection('attendance_assignments').get()]);
 return {...build({data:table.data,profiles:p.docs.map(d=>({uid:d.id,...d.data()})),classes:c.docs.map(d=>({id:d.id,...d.data()})),assignments:a.docs.map(d=>({id:d.id,...d.data()})),actor,date}),version:table.version};
 }};}
module.exports={build,service};
