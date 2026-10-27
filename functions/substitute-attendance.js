'use strict';
const {createHash}=require('node:crypto'),{capabilities}=require('./school-roles');
const norm=v=>String(v||'').replace(/\s+/g,'');
const name=t=>(t.prefix||'')+(t.first||'')+' '+(t.last||'');
const eligible=p=>p?.active&&(capabilities(p)?.markAttendance??['teacher','admin'].includes(p.attendanceRole));
const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
const assignmentId=(uid,date,sourceTeacherId,roomId,slotId)=>'auto_substitute_'+createHash('sha256').update(JSON.stringify([uid,date,String(sourceTeacherId),String(roomId),String(slotId)])).digest('hex').slice(0,40);
function plan(data,profiles,classes,p){
 if(!eligible(p)||!p.teacherId)return [];
 const teacher=(data.teachers||[]).find(t=>t.id===p.teacherId);
 if(!teacher||profiles.filter(x=>x.active&&x.teacherId===p.teacherId).length!==1)return [];
 const target=norm(name(teacher));
 if(data.teachers.filter(t=>norm(name(t))===target).length!==1)return [];
 const current=classes.filter(c=>c.active&&c.academicYear===Number(data.school.year)&&c.term===Number(data.school.semester)),out=new Map();
 for(const [date,day] of Object.entries(data.substitute||{})){
  if(!validDate(date))continue;
  const weekday=new Date(date+'T12:00:00+07:00').getUTCDay(),schedDay=data.days[weekday-1];
  if(!schedDay)continue;
  for(const absence of day.absentList||[]){
   const source=data.teachers.find(t=>String(t.id)===String(absence.teacherId));
   if(!source||source.id===teacher.id)continue;
   for(const period of absence.periods||[]){
    if(!period.subTeacher||norm(period.subTeacher)!==target)continue;
    const slot=data.slots.find(s=>String(s.id)===String(period.slotId)&&!s.isBreak&&!s.teacherOnly),room=data.rooms.find(r=>String(r.id)===String(period.roomId));
    if(!slot||!room)continue;
    const lesson=data.sched[room.id+'_'+slot.id+'_'+schedDay],matches=current.filter(c=>norm(c.name)===norm(room.label)),number=Number(String(slot.label).match(/\d+/)?.[0]);
    if(matches.length!==1||!lesson?.subject||period.subject!==lesson.subject||![lesson.teacher,lesson.teacher2,lesson.teacher3].some(n=>norm(n)===norm(name(source)))||!Number.isInteger(number)||number<1||number>20)continue;
    if(data.rooms.some(r=>{const cell=data.sched[r.id+'_'+slot.id+'_'+schedDay];return cell&&[cell.teacher,cell.teacher2,cell.teacher3].some(n=>norm(n)===target);})||Object.values(data.teacherSched||{}).some(a=>a.teacherId===teacher.id&&String(a.slotId)===String(slot.id)&&a.day===schedDay))continue;
    const c=matches[0],id=assignmentId(p.uid,date,source.id,room.id,slot.id);
    out.set(id,{id,teacherUid:p.uid,active:true,kind:'substitute',classId:c.id,className:c.name,subject:lesson.subject,period:number,weekday,date,from:date,to:date,time:slot.start+'–'+slot.end,sourceTeacherId:source.id,coveredTeacherName:name(source),source:'timetable-substitute'});
   }
  }
 }
 // Do not grant a teacher two different rooms in the same period.
 const counts=new Map();for(const a of out.values()){const key=a.date+'|'+a.period;counts.set(key,(counts.get(key)||0)+1);}
 return [...out.values()].filter(a=>counts.get(a.date+'|'+a.period)===1);
}
function service(db,stamp,Timestamp){
 async function sync({data,profiles,classes,profile,version}){
  if(!eligible(profile)||!profile.teacherId)return {changes:0};
  const wanted=plan(data,profiles,classes,profile);
  if(wanted.length>150)throw Object.assign(Error('รายการสอนแทนมีจำนวนมากเกินไป กรุณาติดต่อผู้ดูแล'),{code:'resource-exhausted'});
  const jobs=await db.collection('attendance_assignments').where('teacherUid','==',profile.uid).get(),managed=jobs.docs.filter(d=>d.id.startsWith('auto_substitute_'));
  return db.runTransaction(async tx=>{
   const [live,state,users]=await Promise.all([tx.get(db.doc('school_users/'+profile.uid)),tx.get(db.doc('timetable_state/current')),tx.get(db.collection('school_users'))]);
   if(!live.exists||!eligible(live.data())||live.data().teacherId!==profile.teacherId)throw Object.assign(Error('บัญชีหรือสิทธิ์เปลี่ยนแล้ว กรุณาโหลดใหม่'),{code:'permission-denied'});
   if(state.data()?.version!==version)throw Object.assign(Error('ตารางสอนเปลี่ยนแล้ว กรุณาโหลดใหม่'),{code:'aborted'});
   const currentProfiles=users.docs.map(d=>({uid:d.id,...d.data()}));
   const confirmed=plan(data,currentProfiles,classes,{uid:profile.uid,...live.data()});
   if(JSON.stringify(confirmed)!==JSON.stringify(wanted))throw Object.assign(Error('บัญชีครูเปลี่ยนแล้ว กรุณาโหลดใหม่'),{code:'aborted'});
   const wantedIds=new Set(wanted.map(a=>a.id)),stale=await Promise.all(managed.filter(d=>!wantedIds.has(d.id)).map(d=>tx.get(d.ref)));
   const records=await Promise.all(wanted.map(async a=>{
    const ref=db.doc('attendance_assignments/'+a.id),access=db.doc('attendance_access/'+profile.uid+'/classes/'+a.classId);
    const [prior,grant,room]=await Promise.all([tx.get(ref),tx.get(access),tx.get(db.doc('attendance_classes/'+a.classId))]);return {a,ref,access,prior,grant,room};
   }));
   for(const {room} of records)if(!room.exists||!room.data().active||room.data().academicYear!==Number(data.school.year)||room.data().term!==Number(data.school.semester))throw Object.assign(Error('ห้องเรียนเปลี่ยนแล้ว กรุณาโหลดใหม่'),{code:'aborted'});
   let changes=0;
   for(const old of stale)if(old.exists&&old.data().active){tx.update(old.ref,{active:false,updatedAt:stamp(),updatedBy:profile.uid});changes++;}
   for(const r of records){
    const {id,...a}=r.a,body={...a,...Object.fromEntries(['date','from','to'].map(k=>[k,Timestamp.fromDate(new Date(a[k]+'T00:00:00+07:00'))]))};
    const same=(x,y)=>x?.toMillis&&y?.toMillis?x.toMillis()===y.toMillis():JSON.stringify(x)===JSON.stringify(y),old=r.prior.data();
    if(!old||Object.entries(body).some(([k,v])=>!same(old[k],v))){tx.set(r.ref,{...body,createdAt:old?.createdAt||stamp(),updatedAt:stamp(),updatedBy:profile.uid});changes++;}
    const g=r.grant.data();if(!g?.active||!g.canRead||!g.canSubject){tx.set(r.access,{active:true,canRead:true,canMorning:g?.canMorning===true,canSubject:true,canBehavior:g?.canBehavior===true,updatedAt:stamp(),updatedBy:profile.uid});changes++;}
   }
   return {changes,assignments:wanted.length};
  });
 }
 return {sync};
}
module.exports={plan,service,assignmentId};
