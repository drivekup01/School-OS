'use strict';
const {capabilities}=require('./school-roles');
const {dateOf}=require('./attendance-schedule');
const {effective}=require('./exchange-core');
const norm=v=>String(v||'').replace(/\s+/g,'');
const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
const fail=(message,code='invalid-argument')=>{throw Object.assign(Error(message),{code});};
function calendar(data){const term=data.exchangeTerm;if(!term||!valid(term.from)||!valid(term.to)||term.from>term.to||(Date.parse(term.to)-Date.parse(term.from))/86400000>250||Number(term.year)!==Number(data.school.year)||Number(term.term)!==Number(data.school.semester))return null;return {from:term.from,to:term.to};}
function courses(data,classes,jobs,actor){
 const all=actor.attendanceRole==='admin'||actor.attendanceRole==='viewer'||capabilities(actor)?.admin||require('./academic-permissions').full(actor),teacher=data.teachers.find(t=>t.id===actor.teacherId),name=teacher?norm((teacher.prefix||'')+(teacher.first||'')+' '+(teacher.last||'')):'';
 const result=new Map(),add=(c,subject)=>{const key=JSON.stringify([c.id,subject]);result.set(key,{classId:c.id,className:c.name,subject});};
 for(const room of data.rooms){const c=classes.find(c=>norm(c.name)===norm(room.label));if(!c)continue;for(const day of data.days)for(const slot of data.slots.filter(s=>!s.isBreak&&!s.teacherOnly)){const cell=data.sched[room.id+'_'+slot.id+'_'+day];if(cell?.subject&&(all||name&&[cell.teacher,cell.teacher2,cell.teacher3].some(v=>norm(v)===name)))add(c,cell.subject);}}
 for(const job of jobs){const c=classes.find(c=>c.id===job.classId);if(c&&job.kind==='subject'&&(all||job.teacherUid===actor.uid)&&job.subject)add(c,job.subject);}
 return [...result.values()].sort((a,b)=>a.subject.localeCompare(b.subject,'th')||a.className.localeCompare(b.className,'th',{numeric:true}));
}
function plan(data,room,subject,range){
 const result=new Map();for(let tick=Date.parse(range.from+'T00:00:00Z');tick<=Date.parse(range.to+'T00:00:00Z');tick+=86400000){const date=new Date(tick).toISOString().slice(0,10),weekday=new Date(tick).getUTCDay(),day=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][weekday];if(!data.days.includes(day)||(data.exchangeTerm.excludedDates||[]).includes(date))continue;const table=effective(data,date);
  data.slots.forEach((s,i)=>{if(s.isBreak||s.teacherOnly)return;const cell=table.sched[room.id+'_'+s.id+'_'+day];if(cell?.subject===subject){const period=Number(String(s.label).match(/\d+/)?.[0]||i+1);result.set(date+'_'+period,{date,period,source:'timetable'});}});
 }return result;
}
function summarize({students,events,sessions,today,range}){
 const total=sessions.size,elapsed=[...sessions.values()].filter(s=>s.date<=today).length;
 return students.map(s=>{const counts={present:0,late:0,leave:0,absent:0,pending:0},history=[];let conflicts=0;
  for(const [key,lesson]of sessions){if(lesson.date>today)continue;const event=events.get(key+'_'+s.id);if(event?.conflict)conflicts++;if(event&&['present','late','leave','absent'].includes(event.status)){counts[event.status]++;history.push({date:lesson.date,period:lesson.period,status:event.status});}else counts.pending++;}
  const remaining=total-counts.absent,percentage=total?remaining/total*100:null,risk=total>0&&remaining*100<total*70;
  return {id:s.id,number:s.number,code:s.code||'',name:s.name,...counts,total,elapsed,percentage,risk,conflicts,incomplete:counts.pending>0||today<range.to||conflicts>0,history:history.sort((a,b)=>a.date.localeCompare(b.date)||a.period-b.period)};
 });
}
function service(db,identity,repo,now=()=>new Date()){
 async function authorized(request){const p=await identity.resolve(request),caps=capabilities(p);if(!(caps?caps.readAll:p.active&&p.registered&&['admin','teacher','viewer'].includes(p.attendanceRole)))fail('ไม่มีสิทธิ์ดูรายงาน','permission-denied');return p;}
 return {async get(request,i){
  const actor=await authorized(request);if(Object.keys(i).some(k=>!['method','year','term','classId','subject'].includes(k)))fail('คำขอไม่ถูกต้อง');
  const current=await repo.read(),saved=await db.collection('timetable_report_terms').get(),terms=new Map(saved.docs.map(d=>[d.id,d.data()]));const currentKey=current.data.school.year+'_'+current.data.school.semester;terms.set(currentKey,{year:Number(current.data.school.year),term:Number(current.data.school.semester),version:current.version,...calendar(current.data)});
  const year=i.year===undefined?Number(current.data.school.year):i.year,term=i.term===undefined?Number(current.data.school.semester):i.term;
  if(!Number.isInteger(year)||![1,2].includes(term))fail('ปีและภาคเรียนไม่ถูกต้อง');const source=terms.get(year+'_'+term);if(!source)fail('ยังไม่มีตารางสอนของภาคเรียนนี้','not-found');
  const data=year+'_'+term===currentKey?current.data:await repo.readVersion(source.version);
  if(Number(data.school.year)!==year||Number(data.school.semester)!==term)fail('ตารางสอนไม่ตรงกับภาคเรียน','failed-precondition');
  const [cs,js]=await Promise.all([db.collection('attendance_classes').get(),db.collection('attendance_assignments').get()]);const classes=cs.docs.map(d=>({id:d.id,...d.data()})).filter(c=>Number(c.academicYear)===year&&Number(c.term)===term),jobs=js.docs.map(d=>({id:d.id,...d.data()})),available=courses(data,classes,jobs,actor),range=calendar(data);
  if(i.method==='attendanceTermCatalog'){await authorized(request);return {year,term,terms:[...terms.values()].map(t=>({year:Number(t.year),term:Number(t.term)})).sort((a,b)=>b.year-a.year||b.term-a.term),range,courses:available};}
  if(i.method!=='attendanceTermReport'||typeof i.classId!=='string'||typeof i.subject!=='string'||!available.some(c=>c.classId===i.classId&&c.subject===i.subject))fail('ไม่มีสิทธิ์ดูรายวิชาและห้องนี้','permission-denied');
  if(!range)fail('กรุณาให้ฝ่ายวิชาการกำหนดวันเปิด–ปิดภาคเรียนในระบบตารางสอนก่อน','failed-precondition');
  const roomClass=classes.find(c=>c.id===i.classId),room=data.rooms.find(r=>norm(r.label)===norm(roomClass.name));if(!room)fail('ไม่พบห้องในตารางสอน','failed-precondition');
  const sessions=plan(data,room,i.subject,range),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(now()),events=new Map(),roster=(await db.collection('attendance_classes/'+i.classId+'/students').get()).docs.map(d=>({id:d.id,...d.data()})).filter(s=>year+'_'+term!==currentKey||s.active!==false),studentIds=new Set(roster.map(s=>s.id)),tasks=[];
  for(const job of jobs.filter(j=>j.classId===i.classId&&j.subject===i.subject&&['subject','substitute'].includes(j.kind))){for(let tick=Date.parse(range.from+'T00:00:00Z');tick<=Math.min(Date.parse(range.to+'T00:00:00Z'),Date.parse(today+'T00:00:00Z'));tick+=86400000){const date=new Date(tick).toISOString().slice(0,10);if((data.exchangeTerm.excludedDates||[]).includes(date)||job.excludedDates?.includes(date)||date<dateOf(job.from)||date>dateOf(job.to)||(job.kind==='substitute'?date!==dateOf(job.date):new Date(tick).getUTCDay()!==job.weekday))continue;tasks.push({job,date});}}
  if(tasks.length>2000)fail('รายการคาบเก่ามากเกินไป กรุณาติดต่อผู้ดูแล','resource-exhausted');
  let outside=0;for(let offset=0;offset<tasks.length;offset+=8){await Promise.all(tasks.slice(offset,offset+8).map(async({job,date})=>{const marks=await db.collection('attendance_assignments/'+job.id+'/days/'+date.replaceAll('-','')+'/marks').get(),key=date+'_'+job.period;if(marks.docs.some(d=>{const m=d.data();return studentIds.has(d.id)&&m.classId===i.classId&&m.assignmentId===job.id&&['present','late','leave','absent'].includes(m.status);})&&!sessions.has(key)){sessions.set(key,{date,period:job.period,source:'recorded-history'});outside++;}
   for(const mark of marks.docs){const m=mark.data();if(!studentIds.has(mark.id)||m.classId!==i.classId||m.assignmentId!==job.id||!['present','late','leave','absent'].includes(m.status))continue;const k=key+'_'+mark.id,old=events.get(k),time=m.updatedAt?.toMillis?.()||0;const conflict=old&&(old.conflict||old.status!==m.status);if(!old||time>old.time||time===old.time&&job.id>old.assignmentId)events.set(k,{status:m.status,time,assignmentId:job.id,conflict:!!conflict});else if(conflict)old.conflict=true;}
  }));}
  await authorized(request);
  return {year,term,range,className:roomClass.name,subject:i.subject,threshold:70,total:sessions.size,outside,students:summarize({students:roster,events,sessions,today,range}).sort((a,b)=>a.number-b.number),sourceVersion:source.version,note:'อิงตารางสอนของภาคเรียนนี้ รวมคาบเก่าที่มีผลเช็คชื่อและไม่นับคาบซ้ำ ไม่หักวันหยุดที่ยังไม่ได้กำหนดในตาราง'};
 }};
}
module.exports={calendar,courses,plan,summarize,service};
