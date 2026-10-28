'use strict';
const M=require('./model'),E=require('./exchange-core');
const today=now=>new Date(now.getTime()+25200000).toISOString().slice(0,10);
const iso=v=>v?.toDate?today(v.toDate()):typeof v==='string'?v.slice(0,10):'';
const endpoint=s=>({date:s.date,teacherId:s.teacherId,slotId:s.slotId,roomId:s.roomId});
function service(db,identity,repo,stamp){
 async function termFor(data){const t=data.exchangeTerm;if(t&&t.year===Number(data.school.year)&&t.term===Number(data.school.semester))return t;
  const docs=await db.collection('attendance_teaching_links').get(),ranges=docs.docs.map(d=>d.data()).filter(d=>d.active&&d.year===Number(data.school.year)&&d.term===Number(data.school.semester)).map(d=>({from:iso(d.from),to:iso(d.to)})).filter(d=>E.valid(d.from)&&E.valid(d.to)&&d.from<=d.to&&Date.parse(d.to)-Date.parse(d.from)<=240*86400000);
  if(!ranges.length)return null;const from=ranges.map(r=>r.from).sort().at(-1),to=ranges.map(r=>r.to).sort()[0];return from<=to?{year:Number(data.school.year),term:Number(data.school.semester),from,to}:null;
 }
 async function handle(request,input,now=new Date()){
  const p=await identity.resolve(request);M.assertAcademic(p);
  const allowed={exchangeBootstrap:['method'],exchangeCandidates:['method','a'],exchangeReturns:['method','a','teacherId','date'],exchangePreview:['method','a','b'],exchangeConfirm:['method','a','b','expectedRevision','requestId'],exchangeCancel:['method','id','expectedRevision','requestId'],exchangeSetTerm:['method','from','to','expectedRevision','requestId']};
  if(!allowed[input.method]||Object.keys(input).some(k=>!allowed[input.method].includes(k)))M.error('คำขอแลกคาบไม่ถูกต้อง');
  const hash=M.hash({...input,expectedRevision:undefined});
  if(input.requestId){M.requestId(input.requestId);const r=await db.doc('timetable_operations/'+p.uid+'_'+input.requestId).get();if(r.exists){if(r.data().requestHash!==hash||r.data().method!==input.method)M.error('request ID เดิมใช้กับข้อมูลอื่นไม่ได้','already-exists');return r.data().result;}}
  const current=await repo.read(),data=M.clone(current.data),term=await termFor(data),day=today(now),leave=await db.doc('timetable_leave/current').get(),leaveHash=M.hash(leave.data()?.json||'[]'),leaves=JSON.parse(leave.data()?.json||'[]');
  const local=new Date(now.getTime()+25200000),minute=local.getUTCHours()*60+local.getUTCMinutes();
  const upcoming=side=>{const slot=data.slots.find(s=>String(s.id)===String(side.slotId)),clock=String(slot?.start||'').match(/^(\d{1,2}):(\d{2})$/);return side.date>day||side.date===day&&clock&&Number(clock[1])*60+Number(clock[2])>minute;};
  if(input.a&&!upcoming(input.a)||input.b&&!upcoming(input.b))M.error('คาบนี้เริ่มหรือผ่านไปแล้ว กรุณาเลือกคาบในอนาคต','failed-precondition');
  if(input.method==='exchangeBootstrap')return {ok:true,data,revision:current.revision,term,today:day};
  if(input.method==='exchangeCandidates'){
   const list=E.candidates(data,leaves,input.a,day,term).map(t=>{let count=0;for(let ms=Date.parse(day>term.from?day:term.from);ms<=Date.parse(term.to);ms+=86400000){const date=new Date(ms).toISOString().slice(0,10);if(data.days.includes(E.weekday(date)))count+=E.returns(data,leaves,input.a,t.id,date,day,term).filter(upcoming).length;}return {...t,returnCount:count};}).filter(t=>t.returnCount);
   return {ok:true,candidates:list,revision:current.revision};
  }
  if(input.method==='exchangeReturns')return {ok:true,returns:E.returns(data,leaves,input.a,input.teacherId,input.date,day,term).filter(upcoming),revision:current.revision};
  if(input.method==='exchangePreview')return {ok:true,...E.validate(data,leaves,input.a,input.b,day,term),revision:current.revision};
  if(input.expectedRevision!==current.revision)M.error('ตารางสอนเปลี่ยนแล้ว กรุณาโหลดล่าสุดและเลือกคาบใหม่','aborted');
  if(input.method==='exchangeSetTerm'){
   if(!(p.schoolRole==='admin'||p.identityAdmin))M.error('เฉพาะผู้ดูแลระบบกำหนดช่วงภาคเรียน','permission-denied');
   if(!E.valid(input.from)||!E.valid(input.to)||input.from>input.to||Date.parse(input.to)-Date.parse(input.from)>240*86400000)M.error('กำหนดช่วงภาคเรียนไม่เกิน 240 วัน');
   data.exchangeTerm={year:Number(data.school.year),term:Number(data.school.semester),from:input.from,to:input.to};
  }else if(input.method==='exchangeConfirm'){
   const pair=E.validate(data,leaves,input.a,input.b,day,term),id='exchange_'+input.requestId;
   data.exchanges||={};if(Object.keys(data.exchanges).length>=500)M.error('รายการแลกคาบเต็ม กรุณาติดต่อผู้ดูแล','resource-exhausted');
   data.exchanges[id]={id,active:true,year:Number(data.school.year),term:Number(data.school.semester),termBounds:term,...pair,createdBy:p.uid,createdAt:now.toISOString()};
  }else{
   const x=data.exchanges?.[input.id];if(!x?.active)M.error('รายการแลกนี้ถูกยกเลิกแล้ว','failed-precondition');
   if(!upcoming(x.a)||!upcoming(x.b))M.error('คาบหนึ่งฝั่งเริ่มหรือผ่านไปแล้ว ไม่สามารถยกเลิกทั้งคู่ย้อนหลังได้','failed-precondition');
   data.exchanges[input.id]={...x,active:false,cancelledBy:p.uid,cancelledAt:now.toISOString()};
  }
  return repo.save({data,expectedRevision:input.expectedRevision,requestId:input.requestId,uid:p.uid,method:input.method,requestHashOverride:hash,precondition:async tx=>{
   const [profile,liveLeave]=await Promise.all([tx.get(db.doc('school_users/'+p.uid)),tx.get(db.doc('timetable_leave/current'))]);M.assertAcademic(profile.data());
   if(M.hash(liveLeave.data()?.json||'[]')!==leaveHash)M.error('ข้อมูลวันลาเปลี่ยนแล้ว กรุณาตรวจสอบใหม่','aborted');
   await require('./exchange-attendance').stageBlocks(db,tx,data,input,stamp);
  }});
 }
 return {handle};
}
function preserve(data,current){for(const key of ['exchanges','exchangeTerm']){if(data[key]!==undefined&&JSON.stringify(data[key])!==JSON.stringify(current[key]))M.error('ข้อมูลแลกคาบต้องแก้ไขผ่านเมนูแลกคาบ');if(current[key]!==undefined)data[key]=M.clone(current[key]);}}
function compatible(data){for(const x of Object.values(data.exchanges||{}).filter(x=>x.active&&x.year===Number(data.school.year)&&x.term===Number(data.school.semester))){const check={...data,exchanges:{...data.exchanges}};delete check.exchanges[x.id];const pair=E.validate(check,[],endpoint(x.a),endpoint(x.b),'0001-01-01',x.termBounds);if(!E.same(pair.a.lesson,x.a.lesson)||!E.same(pair.b.lesson,x.b.lesson))M.error('การแก้ตารางกระทบคาบที่แลกแล้ว กรุณายกเลิกการแลกก่อน','failed-precondition');}}
module.exports={service,preserve,compatible,endpoint};
