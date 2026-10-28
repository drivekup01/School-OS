'use strict';
const {createHash}=require('node:crypto'),{capabilities}=require('./school-roles'),E=require('./exchange-core');
const norm=s=>String(s||'').replace(/\s/g,''),blockId=(classId,date,period)=>classId+'_'+date.replaceAll('-','')+'_'+period;
function plan(data,profiles,classes){const current=classes.filter(c=>c.active&&c.academicYear===Number(data.school.year)&&c.term===Number(data.school.semester)),out=[];
 for(const x of Object.values(data.exchanges||{}).filter(x=>x.active&&x.year===Number(data.school.year)&&x.term===Number(data.school.semester)))for(const [side,other]of [[x.a,x.b],[x.b,x.a]]){
  const targets=profiles.filter(p=>p.active&&p.teacherId===other.teacherId&&(capabilities(p)?.markAttendance??['teacher','admin'].includes(p.attendanceRole))),rooms=current.filter(c=>norm(c.name)===norm(side.className));if(targets.length!==1||rooms.length!==1)continue;
  const number=Number(String(side.period).match(/\d+/)?.[0]);if(!Number.isInteger(number)||number<1||number>20)continue;
  const id='auto_exchange_'+createHash('sha256').update(x.id+'|'+side.date+'|'+side.slotId+'|'+targets[0].uid).digest('hex').slice(0,40);
  out.push({id,exchangeId:x.id,source:'timetable-exchange',active:true,kind:'substitute',teacherUid:targets[0].uid,teacherId:other.teacherId,classId:rooms[0].id,className:rooms[0].name,subject:other.lesson.subject,period:number,weekday:new Date(side.date+'T12:00:00+07:00').getUTCDay(),date:side.date,from:side.date,to:side.date,time:side.time,sourceSlotId:side.slotId,coveredTeacherName:side.teacherName});
 }return out;
}
async function stageBlocks(db,tx,data,input,stamp){
 if(!['exchangeConfirm','exchangeCancel'].includes(input.method))return;
 const id=input.method==='exchangeConfirm'?'exchange_'+input.requestId:input.id,x=data.exchanges[id];
 const [classes,jobs]=await Promise.all([tx.get(db.collection('attendance_classes')),tx.get(db.collection('attendance_assignments'))]);
 const writes=[];
 for(const side of [x.a,x.b]){const matches=classes.docs.filter(c=>c.data().active&&c.data().academicYear===x.year&&c.data().term===x.term&&norm(c.data().name)===norm(side.className));if(matches.length!==1)throw Object.assign(Error('ทะเบียนห้องในภาคเรียนไม่ครบหรือซ้ำ กรุณาตรวจสอบก่อนแลก'),{code:'failed-precondition'});
  const c=matches[0],period=Number(String(side.period).match(/\d+/)?.[0]),key=side.date.replaceAll('-',''),ref=db.doc('attendance_exchange_blocks/'+blockId(c.id,side.date,period)),prior=await tx.get(ref);
  if(prior.exists&&prior.data().active&&prior.data().exchangeId!==id)throw Object.assign(Error('คาบนี้ถูกแลกจากอีกหน้าจอแล้ว'),{code:'aborted'});
  for(const job of jobs.docs.filter(j=>j.data().classId===c.id&&j.data().period===period&&(j.data().kind==='subject'||j.data().exchangeId===id))){const marks=await tx.get(job.ref.collection('days').doc(key).collection('marks'));if(marks.docs.length)throw Object.assign(Error('คาบนี้มีข้อมูลเช็กชื่อแล้ว ไม่สามารถเปลี่ยนการแลกได้'),{code:'failed-precondition'});}
  writes.push({ref,body:{active:x.active,exchangeId:id,classId:c.id,period,date:side.date,updatedAt:stamp()}});
 }
 for(const w of writes)tx.set(w.ref,w.body);
}
async function sync(db,data,version,stamp,Timestamp){if(!Object.keys(data.exchanges||{}).length)return;
 return db.runTransaction(async tx=>{
  const [state,users,classes,jobs]=await Promise.all([tx.get(db.doc('timetable_state/current')),tx.get(db.collection('school_users')),tx.get(db.collection('attendance_classes')),tx.get(db.collection('attendance_assignments'))]);
  if(state.data()?.version!==version)throw Object.assign(Error('ตารางสอนเปลี่ยนแล้ว กรุณาโหลดใหม่'),{code:'aborted'});
  const planned=plan(data,users.docs.map(d=>({uid:d.id,...d.data()})),classes.docs.map(d=>({id:d.id,...d.data()})));if(planned.length>180)throw Object.assign(Error('รายการเช็กชื่อจากแลกคาบมากเกินกำหนด กรุณาติดต่อผู้ดูแล'),{code:'resource-exhausted'});
  const wanted=new Set(planned.map(j=>j.id)),accesses=new Map();for(const j of planned){const key=j.teacherUid+'/'+j.classId;if(!accesses.has(key))accesses.set(key,await tx.get(db.doc('attendance_access/'+j.teacherUid+'/classes/'+j.classId)));}
  for(const j of jobs.docs.filter(j=>j.data().source==='timetable-exchange'&&j.data().active&&!wanted.has(j.id)))tx.update(j.ref,{active:false,updatedAt:stamp(),updatedBy:'timetable-exchange'});
  for(const {id,...j}of planned){const old=jobs.docs.find(d=>d.id===id)?.data();if(old?.active)continue;const body={...j,...Object.fromEntries(['date','from','to'].map(k=>[k,Timestamp.fromDate(new Date(j[k]+'T00:00:00+07:00'))]))};tx.set(db.doc('attendance_assignments/'+id),{...body,createdAt:old?.createdAt||stamp(),updatedAt:stamp(),updatedBy:'timetable-exchange'});}
  for(const [key,snap]of accesses){const old=snap.data()||{};if(old.active&&old.canRead&&old.canSubject)continue;const [uid,classId]=key.split('/');tx.set(db.doc('attendance_access/'+uid+'/classes/'+classId),{active:true,canRead:true,canSubject:true,canMorning:old.canMorning===true,canBehavior:old.canBehavior===true,updatedAt:stamp(),updatedBy:'timetable-exchange'});}
 });
}
module.exports={plan,sync,stageBlocks,blockId};
