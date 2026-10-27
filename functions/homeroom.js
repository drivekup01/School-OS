'use strict';
const {createHash}=require('node:crypto'),{capabilities}=require('./school-roles');
const assignmentId=(uid,classId)=>'auto_morning_'+classId+'_'+createHash('sha256').update(uid).digest('hex').slice(0,16);
const lessonAssignmentId=(uid,classId,period,weekday)=>'auto_subject_'+classId+'_'+weekday+'_'+period+'_'+createHash('sha256').update(uid).digest('hex').slice(0,16);
const sameTime=(a,b)=>a?.toMillis&&b?.toMillis?a.toMillis()===b.toMillis():JSON.stringify(a)===JSON.stringify(b);
function service(db,stamp){
 async function provisionKind(p,kind){
  if(!p?.active||!p.uid||!p.teacherId||!(capabilities(p)?.markAttendance??['teacher','admin'].includes(p.attendanceRole)))return {assignments:0};
  const templateRef=db.doc((kind==='morning'?'attendance_homeroom_links/':'attendance_teaching_links/')+p.teacherId),initial=await templateRef.get();if(!initial.exists||initial.data().active!==true)return {assignments:0};
  const jobs=await db.collection('attendance_assignments').where('teacherUid','==',p.uid).get();
  return db.runTransaction(async tx=>{
   const [profile,snap]=await Promise.all([tx.get(db.doc('school_users/'+p.uid)),tx.get(templateRef)]),live=profile.data(),template=snap.data();
   if(!profile.exists||live.active!==true||live.teacherId!==p.teacherId||!(capabilities(live)?.markAttendance??['teacher','admin'].includes(live.attendanceRole))||!snap.exists||template.active!==true)return {assignments:0};
   if(!Array.isArray(template.links)||template.links.length>(kind==='morning'?5:100)||!template.from||!template.to)throw Object.assign(Error('การมอบหมายประจำชั้นยังไม่พร้อม'),{code:'failed-precondition'});
   if(template.links.some(l=>!l||typeof l.classId!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(l.classId)||(kind==='subject'&&(!Number.isInteger(l.period)||l.period<1||l.period>20||!Number.isInteger(l.weekday)||l.weekday<0||l.weekday>6||typeof l.subject!=='string'||!l.subject.trim()||l.subject.length>160||typeof l.time!=='string'||l.time.length>40))))throw Object.assign(Error('ข้อมูลการมอบหมายไม่ถูกต้อง'),{code:'failed-precondition'});
   const records=await Promise.all(template.links.map(async link=>{const ref=db.doc('attendance_assignments/'+(kind==='morning'?assignmentId(p.uid,link.classId):lessonAssignmentId(p.uid,link.classId,link.period,link.weekday))),access=db.doc('attendance_access/'+p.uid+'/classes/'+link.classId),manual=jobs.docs.find(d=>!/^auto_(morning|subject)_/.test(d.id)&&d.data().kind===kind&&d.data().classId===link.classId&&d.data().active===true&&(kind==='morning'||d.data().period===link.period&&d.data().weekday===link.weekday&&d.data().subject===link.subject));const [room,current,grant,manualDoc]=await Promise.all([tx.get(db.doc('attendance_classes/'+link.classId)),tx.get(ref),tx.get(access),manual?tx.get(manual.ref):null]);return {link,ref,access,room,current,grant,manual:manualDoc?.exists&&manualDoc.data().active===true&&manualDoc.data().teacherUid===p.uid&&manualDoc.data().classId===link.classId&&manualDoc.data().kind===kind&&(kind==='morning'||manualDoc.data().period===link.period&&manualDoc.data().weekday===link.weekday&&manualDoc.data().subject===link.subject)?manualDoc:null};}));
   const wanted=new Set(template.links.map(l=>kind==='morning'?assignmentId(p.uid,l.classId):lessonAssignmentId(p.uid,l.classId,l.period,l.weekday)));
   const stale=await Promise.all(jobs.docs.filter(d=>d.id.startsWith(kind==='morning'?'auto_morning_':'auto_subject_')&&!wanted.has(d.id)).map(d=>tx.get(d.ref)));
   let changes=0,assigned=0;
   for(const old of stale)if(old.exists&&old.data().active===true){tx.update(old.ref,{active:false,updatedAt:stamp(),updatedBy:p.uid});changes++;}
   for(const r of records){const room=r.room.data();if(!r.room.exists||room.active!==true||room.academicYear!==template.year||room.term!==template.term)throw Object.assign(Error('ห้องประจำชั้นยังไม่พร้อม'),{code:'failed-precondition'});
    const old=r.current.data();if(!r.manual){const body={teacherUid:p.uid,active:true,kind,classId:r.link.classId,className:room.name,subject:kind==='morning'?'เข้าแถวเช้า':r.link.subject,period:kind==='morning'?0:r.link.period,weekday:kind==='morning'?1:r.link.weekday,from:template.from,to:template.to,date:null,time:kind==='morning'?'07:50–08:10':r.link.time};
     const changed=!r.current.exists||Object.entries(body).some(([k,v])=>['from','to'].includes(k)?!sameTime(old[k],v):old[k]!==v);
     if(changed){const next={...body,createdAt:old?.createdAt||stamp(),updatedAt:stamp(),updatedBy:p.uid};r.current.exists?tx.set(r.ref,next):tx.create(r.ref,next);changes++;}assigned++;
    }
    const g=r.grant.data();if(!g?.active||!g.canRead||!(kind==='morning'?g.canMorning:g.canSubject)){tx.set(r.access,{active:true,canRead:true,canMorning:kind==='morning'||g?.canMorning===true,canSubject:kind==='subject'||g?.canSubject===true,canBehavior:g?.canBehavior===true,updatedAt:stamp(),updatedBy:p.uid});changes++;}
   }
   if(changes)tx.create(db.collection('attendance_admin_audit').doc(),{action:'link-'+kind+'-on-login',uid:p.uid,teacherId:p.teacherId,classIds:records.map(r=>r.link.classId),createdAt:stamp()});
   return {assignments:assigned,changes};
  });
 }
 async function provision(p){const morning=await provisionKind(p,'morning'),subject=await provisionKind(p,'subject');return {assignments:(morning.assignments||0)+(subject.assignments||0),changes:(morning.changes||0)+(subject.changes||0)};}
 async function refresh(p,data,classes,sourceVersion){
  if(!p?.active||!p.uid||!p.teacherId||!capabilities(p)?.markAttendance)return;
  const year=Number(data.school.year),term=Number(data.school.semester),teacher=data.teachers.find(t=>t.id===p.teacherId);if(!teacher)return;
  const name=((teacher.prefix||'')+(teacher.first||'')+' '+(teacher.last||'')).replace(/\s+/g,''),current=classes.filter(c=>c.active&&c.academicYear===year&&c.term===term),links={morning:[],subject:[]};
  for(const room of data.rooms){const c=current.find(c=>String(c.name).replace(/\s+/g,'')===String(room.label).replace(/\s+/g,''));if(!c)continue;if([room.homeroom,room.homeroom2,room.homeroom3].includes(p.teacherId))links.morning.push({classId:c.id,className:c.name});for(const slot of data.slots.filter(s=>!s.isBreak&&!s.teacherOnly))for(let di=0;di<data.days.length;di++){const cell=data.sched[room.id+'_'+slot.id+'_'+data.days[di]];if(cell?.subject&&[cell.teacher,cell.teacher2,cell.teacher3].some(n=>String(n||'').replace(/\s+/g,'')===name))links.subject.push({classId:c.id,className:c.name,period:Number(String(slot.label).match(/\d+/)?.[0]),weekday:di+1,subject:cell.subject,time:slot.start+'–'+slot.end});}}
  const refs={morning:db.doc('attendance_homeroom_links/'+p.teacherId),subject:db.doc('attendance_teaching_links/'+p.teacherId)},canonical=list=>JSON.stringify(list.map(l=>[l.classId,l.className,l.period||0,l.weekday||0,l.subject||'',l.time||'']).sort());
  await db.runTransaction(async tx=>{const [profile,morning,subject,state]=await Promise.all([tx.get(db.doc('school_users/'+p.uid)),tx.get(refs.morning),tx.get(refs.subject),tx.get(db.doc('timetable_state/current'))]);const live=profile.data();if(!profile.exists||!live.active||live.teacherId!==p.teacherId||!capabilities(live)?.markAttendance)return;if(sourceVersion&&state.data()?.version!==sourceVersion)throw Object.assign(Error('ตารางสอนเปลี่ยนแล้ว กรุณาโหลดใหม่'),{code:'aborted'});const old={morning:morning.data(),subject:subject.data()},anchor=[old.morning,old.subject].find(v=>v?.active&&v.year===year&&v.term===term);if(!anchor)return;const snapshots=await Promise.all([...new Set([...links.morning,...links.subject].map(l=>l.classId))].map(id=>tx.get(db.doc('attendance_classes/'+id))));if(snapshots.some(d=>!d.exists||!d.data().active||d.data().academicYear!==year||d.data().term!==term))throw Object.assign(Error('ข้อมูลห้องเรียนเปลี่ยนแล้ว กรุณาโหลดใหม่'),{code:'aborted'});for(const kind of ['morning','subject']){if(!old[kind]&&!links[kind].length)continue;if(old[kind]?.year===year&&old[kind]?.term===term&&canonical(old[kind].links||[])===canonical(links[kind]))continue;tx.set(refs[kind],{active:true,teacherId:p.teacherId,year,term,from:anchor.from,to:anchor.to,openEnded:anchor.openEnded===true,links:links[kind],createdAt:old[kind]?.createdAt||stamp(),updatedAt:stamp(),updatedBy:p.uid});}});
 }
 return {provision,refresh};
}
module.exports={service,assignmentId,lessonAssignmentId};
