(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TeacherSchedule=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const name=t=>((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim();
 const key=(teacherId,slotId,day)=>JSON.stringify([teacherId,String(slotId),day]);
 function activities(db,teacherName,slotId,day){return Object.entries(db.teacherSched||{}).flatMap(([id,v])=>{
  const teacher=db.teachers.find(t=>t.id===v.teacherId),slot=db.slots.find(s=>String(s.id)===String(v.slotId));
  if(!teacher||!slot||slot.isBreak||!db.days.includes(v.day)||(teacherName&&name(teacher)!==teacherName)||(slotId!=null&&String(v.slotId)!==String(slotId))||(day&&v.day!==day))return [];
  const subject=db.subjects.find(s=>s.id===v.subjectId);
  return [{...v,key:id,teacher:name(teacher),subject:subject?.name||v.subject,roomId:null,roomLabel:'วิชาอิสระ'}];
 });}
 function roomLessons(db,teacherName,slotId,day){return db.rooms.flatMap(room=>{const cellKey=room.id+'_'+slotId+'_'+day,cv=db.sched[cellKey];return cv?.subject&&[cv.teacher,cv.teacher2,cv.teacher3].includes(teacherName)?[{cv,room,cellKey}]:[];});}
 function set(db,{teacherId,slotId,day,subjectId}){
  const teacher=db.teachers.find(t=>t.id===teacherId),slot=db.slots.find(s=>String(s.id)===String(slotId));
  if(!teacher||!slot||slot.isBreak||!db.days.includes(day))throw Error('ครู วัน หรือคาบไม่ถูกต้อง');
  const id=key(teacherId,slotId,day);db.teacherSched||={};
  if(!subjectId){delete db.teacherSched[id];return;}
  const subject=db.subjects.find(s=>s.id===subjectId);if(!subject)throw Error('ไม่พบรายวิชา');
  if(roomLessons(db,name(teacher),slotId,day).length)throw Error('ครูมีคาบสอนของห้องเรียนในช่วงนี้แล้ว กรุณาเลือกคาบอื่น');
  db.teacherSched[id]={teacherId,slotId:String(slotId),day,subjectId,subject:subject.name};
 }
 function prune(db){if(!db.teacherSched)return;for(const [id,v]of Object.entries(db.teacherSched)){if(!db.teachers.some(t=>t.id===v.teacherId)||!db.slots.some(s=>String(s.id)===String(v.slotId)&&!s.isBreak)||!db.days.includes(v.day))delete db.teacherSched[id];}}
 function learnRoom(db,cell,roomId){
  const override=String(cell?.learnRoom||'').trim();if(override)return override;
  let room=roomId?db.rooms.find(r=>r.id===roomId):null;
  if(!room&&cell){const entry=Object.entries(db.sched).find(([,v])=>v===cell);if(entry)room=db.rooms.find(r=>entry[0].startsWith(r.id+'_'));}
  return String(room?.baseRoom||'').trim();
 }
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return {name,key,activities,roomLessons,set,prune,learnRoom,escape};
});
