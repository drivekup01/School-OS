(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PeriodExchange=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const norm=v=>String(v||'').replace(/\s/g,''),name=t=>((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim();
 const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
 const weekday=d=>['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][new Date(d+'T12:00:00+07:00').getUTCDay()];
 const clock=v=>{const m=String(v||'').match(/^(\d{1,2}):(\d{2})$/);return m?Number(m[1])*60+Number(m[2]):null;};
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function sides(data,date){return Object.values(data.exchanges||{}).filter(x=>x.active&&x.year===Number(data.school.year)&&x.term===Number(data.school.semester)).flatMap(x=>['a','b'].filter(k=>x[k].date===date).map(k=>({exchange:x,side:x[k],other:x[k==='a'?'b':'a']})));}
 function effective(data,date){const sched={...data.sched};for(const {side,other,exchange} of sides(data,date)){const key=side.roomId+'_'+side.slotId+'_'+weekday(date);sched[key]={...other.lesson,exchangeId:exchange.id,exchangeFrom:other.date,exchangeSlot:other.slotId};}return {...data,sched,_exchangeDate:date};}
 function teacher(data,id){const t=data.teachers.find(t=>String(t.id)===String(id));if(!t)throw Error('ไม่พบครู');return t;}
 function names(cell){return [cell?.teacher,cell?.teacher2,cell?.teacher3].filter(Boolean).map(norm);}
 function overlap(a,b){const as=clock(a.start),ae=clock(a.end),bs=clock(b.start),be=clock(b.end);return as===null||ae===null||bs===null||be===null?String(a.id)===String(b.id):as<be&&bs<ae;}
 function locked(data,date,slotId,roomId,teacherId){const slot=data.slots.find(s=>String(s.id)===String(slotId));return sides(data,date).some(({side,other})=>{const s=data.slots.find(s=>String(s.id)===String(side.slotId));return s&&overlap(slot,s)&&(side.roomId===roomId||side.teacherId===teacherId||other.teacherId===teacherId);});}
 function leaveDate(value){if(valid(value))return value;const m=String(value||'').match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);return m?`${Number(m[3])>2400?Number(m[3])-543:m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:'';}
 function absent(data,leaves,t,date,slot){return leaves.some(l=>(String(l.teacherId||'')===String(t.id)||!l.teacherId&&norm(l.name)===norm(name(t)))&&date>=leaveDate(l.from)&&date<=leaveDate(l.to))||(data.substitute?.[date]?.absentList||[]).some(a=>String(a.teacherId)===String(t.id)&&(!a.manualOnly||(a.periods||[]).some(p=>{const s=data.slots.find(s=>String(s.id)===String(p.slotId));return s&&overlap(s,slot);})));}
 function busy(data,leaves,t,date,slot){if(absent(data,leaves,t,date,slot))return true;const table=effective(data,date),day=weekday(date),target=norm(name(t));
  for(const s of data.slots.filter(s=>!s.isBreak&&overlap(s,slot))){if(data.rooms.some(r=>names(table.sched[r.id+'_'+s.id+'_'+day]).includes(target)))return true;if(Object.values(data.teacherSched||{}).some(a=>a.teacherId===t.id&&String(a.slotId)===String(s.id)&&a.day===day))return true;}
  return (data.substitute?.[date]?.absentList||[]).some(a=>(a.periods||[]).some(p=>{const s=data.slots.find(s=>String(s.id)===String(p.slotId));return s&&overlap(s,slot)&&norm(p.subTeacher)===target;}));
 }
 function source(data,leaves,input,today,term){
  if(!input||Object.keys(input).some(k=>!['date','teacherId','slotId','roomId'].includes(k))||!valid(input.date)||input.date<today||!term||input.date<term.from||input.date>term.to)throw Error('เลือกวันที่ตั้งแต่วันนี้และอยู่ในภาคเรียนที่กำหนด');
  const t=teacher(data,input.teacherId),slot=data.slots.find(s=>String(s.id)===String(input.slotId)&&!s.isBreak&&!s.teacherOnly),room=data.rooms.find(r=>r.id===input.roomId),day=weekday(input.date),lesson=data.sched[input.roomId+'_'+input.slotId+'_'+day];
  if(!slot||!room||!data.days.includes(day)||!lesson?.subject||!names(lesson).includes(norm(name(t))))throw Error('คาบต้นทางไม่ตรงกับตารางสอน');
  if(names(lesson).length!==1)throw Error('คาบที่มีครูร่วมสอนหลายคนยังไม่รองรับการแลก');
  const group=data.rooms.filter(r=>names(data.sched[r.id+'_'+slot.id+'_'+day]).includes(norm(name(t))));if(group.length!==1)throw Error('คาบที่สอนพร้อมกันหลายห้องยังไม่รองรับการแลก');
  if(absent(data,leaves,t,input.date,slot))throw Error('ครูเจ้าของคาบลา หรือมีรายการจัดสอนแทนแล้ว');
  if(locked(data,input.date,slot.id,room.id,t.id))throw Error('คาบนี้มีรายการแลกแล้ว กรุณายกเลิกรายการเดิมก่อน');
  return {date:input.date,teacherId:t.id,slotId:String(slot.id),roomId:room.id,teacherName:name(t),className:room.label,period:slot.label,time:slot.start+'–'+slot.end,lesson:JSON.parse(JSON.stringify(lesson))};
 }
 function validate(data,leaves,a,b,today,term){const left=source(data,leaves,a,today,term),right=source(data,leaves,b,today,term);
  if(left.roomId!==right.roomId||left.teacherId===right.teacherId||left.date===right.date&&left.slotId===right.slotId)throw Error('ต้องแลกกับครูอีกคนในห้องนักเรียนเดียวกัน');
  const ta=teacher(data,left.teacherId),tb=teacher(data,right.teacherId),sa=data.slots.find(s=>String(s.id)===left.slotId),sb=data.slots.find(s=>String(s.id)===right.slotId);
  if(busy(data,leaves,tb,left.date,sa)||busy(data,leaves,ta,right.date,sb))throw Error('ครูไม่ว่างในคาบรับคืน มีวันลา งานสอน หรือการสอนแทนซ้อน');
  for(const [side,incoming] of [[left,right],[right,left]]){const location=String(incoming.lesson.learnRoom||data.rooms.find(r=>r.id===side.roomId)?.baseRoom||'').trim();if(!location)continue;const slot=data.slots.find(s=>String(s.id)===side.slotId),table=effective(data,side.date);if(data.slots.some(s=>!s.isBreak&&overlap(slot,s)&&data.rooms.some(r=>r.id!==side.roomId&&table.sched[r.id+'_'+s.id+'_'+weekday(side.date)]?.subject&&String(table.sched[r.id+'_'+s.id+'_'+weekday(side.date)].learnRoom||r.baseRoom||'').trim()===location)))throw Error('สถานที่เรียนในเวลาใหม่ชนกับห้องอื่น');}
  return {a:left,b:right};
 }
 function candidates(data,leaves,a,today,term){const left=source(data,leaves,a,today,term),slot=data.slots.find(s=>String(s.id)===left.slotId);return data.teachers.filter(t=>t.id!==left.teacherId&&!busy(data,leaves,t,left.date,slot)&&data.days.some(d=>data.slots.some(s=>names(data.sched[left.roomId+'_'+s.id+'_'+d]).includes(norm(name(t)))))).map(t=>({id:t.id,name:name(t)}));}
 function returns(data,leaves,a,teacherId,date,today,term){return data.slots.filter(s=>!s.isBreak&&!s.teacherOnly).flatMap(s=>{const b={date,teacherId,slotId:String(s.id),roomId:a.roomId};try{return [validate(data,leaves,a,b,today,term).b];}catch{return [];}});}
 return {valid,weekday,name,source,validate,candidates,returns,effective,sides,busy,same};
});
