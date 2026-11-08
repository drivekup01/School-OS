'use strict';
const {createHash}=require('node:crypto'),{capabilities}=require('./school-roles'),{calendar,courses,plan}=require('./attendance-term-report');
const statuses=['present','late','leave','absent'],id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v),fail=(code,message)=>{throw Object.assign(Error(message),{code});};
const keyFor=i=>createHash('sha256').update(JSON.stringify([i.year,i.term,i.classId,i.subject,i.date,i.period])).digest('hex');
const today=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
function service(db,identity,repo,T,now=()=>new Date()){
 async function context(request,i){
  const actor=await identity.resolve(request),caps=capabilities(actor);if(!actor.active||!(caps?.markAttendance||actor.attendanceRole==='teacher'||actor.attendanceRole==='admin'))fail('permission-denied','ไม่มีสิทธิ์เช็คชื่อรายวิชา');
  const table=await repo.read(),data=table.data,range=calendar(data);if(!range)fail('failed-precondition','ยังไม่ได้กำหนดช่วงภาคเรียน');
  if(i.year!==Number(data.school.year)||i.term!==Number(data.school.semester))fail('failed-precondition','เช็คย้อนหลังได้ในภาคเรียนปัจจุบัน กรุณาเลือกภาคเรียนปัจจุบัน');
  if(!id(i.classId)||typeof i.subject!=='string'||i.subject.length>160||typeof i.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(i.date)||!Number.isFinite(Date.parse(i.date))||new Date(i.date+'T00:00:00Z').toISOString().slice(0,10)!==i.date||i.date<range.from||i.date>range.to||i.date>today(now())||!Number.isInteger(i.period)||i.period<1||i.period>20)fail('invalid-argument','เลือกวิชา ห้อง วันที่ และคาบตามตารางหลักให้ถูกต้อง');
  const roomSnap=await db.doc('attendance_classes/'+i.classId).get(),roomClass=roomSnap.exists?{id:roomSnap.id,...roomSnap.data()}:null;
  if(!roomClass||!roomClass.active||roomClass.academicYear!==i.year||roomClass.term!==i.term)fail('failed-precondition','ห้องไม่ตรงภาคเรียนปัจจุบัน');
  const owns=p=>courses(data,[roomClass],[],p).some(c=>c.classId===i.classId&&c.subject===i.subject),room=data.rooms.find(r=>String(r.label).replace(/\s/g,'')===String(roomClass.name).replace(/\s/g,''));
  if(!owns(actor))fail('permission-denied','บันทึกได้เฉพาะรายวิชาที่รับผิดชอบตามตารางหลัก');
  if(!room||!plan(data,room,i.subject,{from:i.date,to:i.date}).has(i.date+'_'+i.period))fail('invalid-argument','ไม่มีสอนวิชานี้ในวันและคาบที่เลือกตามตารางหลัก');
  return {actor,table,roomClass,owns};
 }
 async function handle(request,i){
  const save=i.method==='saveRegularAttendance',allowed=['method','year','term','classId','subject','date','period',...(save?['marks','revisions','requestId']:[])];if(!['regularAttendanceSession','saveRegularAttendance'].includes(i.method)||Object.keys(i).some(k=>!allowed.includes(k)))fail('invalid-argument','คำขอไม่ถูกต้อง');
  const ctx=await context(request,i),root=db.doc('attendance_regular_sessions/'+keyFor(i)),roster=(await db.collection('attendance_classes/'+i.classId+'/students').get()).docs.map(d=>({id:d.id,...d.data()})).filter(s=>s.active!==false);
  if(!save){const marks=await root.collection('marks').get(),safe={},revision={};for(const snap of marks.docs){const m=snap.data();if(roster.some(s=>s.id===snap.id)){revision[snap.id]=m.revision||0;if(statuses.includes(m.status))safe[snap.id]={status:m.status,note:m.note||''};}}const live=await identity.resolve(request);if(!live.active||!ctx.owns(live))fail('permission-denied','สิทธิ์เปลี่ยนแล้ว กรุณาโหลดใหม่');return {students:roster.map(s=>({id:s.id,number:s.number,code:s.code||'',name:s.name})).sort((a,b)=>a.number-b.number),marks:safe,revisions:revision};}
  if(!id(i.requestId)||!i.marks||Array.isArray(i.marks)||typeof i.marks!=='object'||!i.revisions||Array.isArray(i.revisions)||typeof i.revisions!=='object')fail('invalid-argument','ข้อมูลบันทึกไม่ถูกต้อง');
  const entries=Object.entries(i.marks);if(!entries.length||entries.length>100)fail('invalid-argument','เลือกสถานะอย่างน้อย 1 คน ไม่เกิน 100 คน');for(const [sid,m]of entries)if(!id(sid)||!m||Object.keys(m).some(k=>!['status','note'].includes(k))||!statuses.includes(m.status)||typeof m.note!=='string'||m.note.length>300||!Number.isInteger(i.revisions[sid]??0)||(i.revisions[sid]??0)<0)fail('invalid-argument','สถานะหรือรุ่นข้อมูลไม่ถูกต้อง');
  const stamp=T.fromDate(now()),receipt=db.doc('attendance_regular_operations/'+ctx.actor.uid+'_'+i.requestId),digest=createHash('sha256').update(JSON.stringify([keyFor(i),entries.sort(),i.revisions])).digest('hex');
  await db.runTransaction(async tx=>{
   const [p,room,state,operation,prior]=await Promise.all([tx.get(db.doc('school_users/'+ctx.actor.uid)),tx.get(db.doc('attendance_classes/'+i.classId)),tx.get(db.doc('timetable_state/current')),tx.get(receipt),tx.get(root)]),live=p.data(),caps=capabilities(live);
   if(!p.exists||!live.active||!(caps?.markAttendance||!live.schoolRole&&['teacher','admin'].includes(live.attendanceRole))||!ctx.owns({...live,uid:ctx.actor.uid}))fail('permission-denied','สิทธิ์หรือวิชาที่รับผิดชอบเปลี่ยนแล้ว');
   if(!room.exists||!room.data().active||room.data().academicYear!==i.year||room.data().term!==i.term||state.data()?.version!==ctx.table.version)fail('aborted','ตารางหรือห้องเปลี่ยนแล้ว กรุณาโหลดใหม่');
   if(operation.exists){if(operation.data().digest!==digest)fail('already-exists','รหัสบันทึกซ้ำกับข้อมูลอื่น');return;}
   const rows=await Promise.all(entries.map(async([sid,m])=>{const ref=root.collection('marks').doc(sid),[student,current]=await Promise.all([tx.get(db.doc('attendance_classes/'+i.classId+'/students/'+sid)),tx.get(ref)]);if(!student.exists||student.data().active===false)fail('failed-precondition','รายชื่อนักเรียนเปลี่ยนแล้ว');if((current.data()?.revision||0)!==(i.revisions[sid]||0))fail('aborted','ข้อมูลถูกแก้ไขจากหน้าจออื่น กรุณาโหลดใหม่');return {sid,m,ref,old:current.data()};}));
   for(const {sid,m,ref,old}of rows){const value={classId:i.classId,studentId:sid,status:m.status,note:m.note,revision:(old?.revision||0)+1,createdAt:old?.createdAt||stamp,updatedAt:stamp,updatedBy:ctx.actor.uid};tx.set(ref,value);tx.create(ref.collection('history').doc(String(value.revision)),value);}
   tx.set(root,{classId:i.classId,className:ctx.roomClass.name,subject:i.subject,year:i.year,term:i.term,date:i.date,period:i.period,source:'manual-regular',createdAt:prior.data()?.createdAt||stamp,updatedAt:stamp,updatedBy:ctx.actor.uid});tx.create(receipt,{digest,createdAt:stamp,uid:ctx.actor.uid,sessionId:root.id});
  });return {ok:true,count:entries.length};
 }
 return {handle};
}
module.exports={service,keyFor};
