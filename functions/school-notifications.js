'use strict';
const N=require('./telegram-notifications');
const config={chatId:'-1003991858341',threads:{morning:2,substitute:3,grades:4}};
const fail=(message,code='invalid-argument')=>{throw Object.assign(Error(message),{code});};
const hash=v=>require('node:crypto').createHash('sha256').update(JSON.stringify(v)).digest('hex');
function counts(marks){const c={present:0,late:0,absent:0,leave:0};for(const m of marks){if(!(m.status in c))fail('ยังมีนักเรียนที่ไม่ได้เลือกสถานะ');c[m.status]++;}return c;}
function morningText(date,room,students,byId){
 const ordered=[...students].sort((a,b)=>Number(a.data().number||0)-Number(b.data().number||0)||a.id.localeCompare(b.id));
 const c=counts(ordered.map(s=>byId.get(s.id))),labels={late:'🕘 สาย',absent:'❌ ขาด',leave:'📝 ลา'};
 const lines=ordered.filter(s=>byId.get(s.id).status!=='present').map((s,index)=>{const mark=byId.get(s.id),note=String(mark.note||'').replace(/[\r\n]+/g,' ').trim();return `${index+1}. ${String(s.data().name||'ไม่ระบุชื่อ').replace(/[\r\n]+/g,' ')} : ${labels[mark.status]}${note?' ('+note+')':''}`;});
 return `📌 เช็คชื่อเข้าแถว วันที่ ${date}\n🏫 ห้อง ${room} นักเรียนทั้งหมด ${ordered.length} คน\n\n✅ มาเรียน ${c.present+c.late} คน (รวมมาสาย ${c.late} คน)\n❌ ไม่มาเรียน ${c.absent+c.leave} คน\n   ขาด ${c.absent} คน · ลา ${c.leave} คน\n\n📊 รายชื่อนักเรียนที่สาย / ขาด / ลา\n${lines.length?lines.join('\n'):'ไม่มีนักเรียนที่สาย / ขาด / ลา'}`;
}
function messageParts(text){const parts=[];let current='';for(const line of text.split('\n')){if(line.length>3700)fail('ข้อความหนึ่งบรรทัดยาวเกินกำหนด');if(current.length+line.length+1>3700){parts.push(current);current='';}current+=(current?'\n':'')+line;}if(current)parts.push(current);return parts;}
function service(db,identity,repo,stamp,token,transport=N.send){
 async function actor(request){const p=await identity.resolve(request);if(!p?.active)fail('กรุณาเข้าสู่ระบบ','permission-denied');return p;}
 async function deliver(event,uid){
  const id=N.eventId(event.topic,event.key),ref=db.doc('school_notification_deliveries/'+id);
  const claim=await db.runTransaction(async tx=>{const s=await tx.get(ref);if(s.exists)return {claimed:false,prior:s.data()};tx.create(ref,{topic:event.topic,status:'sending',text:event.text,url:event.url,uid,createdAt:stamp()});return {claimed:true};});
  if(!claim.claimed)return {status:claim.prior.status,replayed:true};
  // An ambiguous HTTP result is deliberately not resent: Telegram has no idempotency key.
  let result;const sent=[];try{const parts=messageParts(event.text);for(let index=0;index<parts.length;index++){result=await transport({token:token(),config,event:{...event,text:(parts.length>1?`(${index+1}/${parts.length})\n`:'')+parts[index]}});if(result.status!=='sent')break;sent.push(result.messageId);}if(result.status!=='sent'&&sent.length)result={...result,status:'partial',retryAutomatically:false};if(sent.length>1||result.status==='partial')result={...result,messageIds:sent};}catch(_){result={status:sent.length?'partial':'failed',retryAutomatically:false,messageIds:sent};}
  await ref.update({...result,updatedAt:stamp()});return result;
 }
 async function grades(){
  const table=await repo.read(),year=Number(table.data.school.year),term=Number(table.data.school.semester),rows=await db.collection('school_remedial_cases').where('year','==',year).where('term','==',term).get();
  const values=rows.docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.published&&!['archived','purging','completed'].includes(d.state));
  const totals={'0':0,'ร':0,'มส':0,'มผ':0};for(const row of values)if(Object.hasOwn(totals,row.originalGrade))totals[row.originalGrade]++;
  const key=hash([year,term,values.map(d=>[d.id,d.revision,d.originalGrade,d.state]).sort()]);
  return {topic:'grades',key,text:`📝 สรุปผลการเรียนที่ต้องดำเนินการ\nปีการศึกษา ${year} ภาคเรียน ${term}\n0: ${totals['0']} รายการ · ร: ${totals['ร']} รายการ\nมส: ${totals['มส']} รายการ · มผ: ${totals['มผ']} รายการ\nรวม ${Object.values(totals).reduce((a,b)=>a+b,0)} รายการ\nรายละเอียดในระบบตามสิทธิ์`,url:'https://drivekup01.github.io/School-OS/remedial.html'};
 }
 async function attendance(p,i){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(i.date||'')||!/^[-\w]{1,100}$/.test(i.classId||''))fail('ห้องหรือวันที่ไม่ถูกต้อง');
  let root,topic,assignment;const admin=require('./school-roles').capabilities(p)?.admin;
  if(i.assignmentId){if(!/^[-\w]{1,150}$/.test(i.assignmentId))fail('รหัสคาบไม่ถูกต้อง');assignment=(await db.doc('attendance_assignments/'+i.assignmentId).get()).data();if(!assignment?.active||assignment.kind!=='substitute'||assignment.classId!==i.classId||!admin&&assignment.teacherUid!==p.uid)fail('ไม่มีสิทธิ์แจ้งคาบนี้','permission-denied');const day=assignment.date?.toDate?.();if(day&&new Date(day.getTime()+25200000).toISOString().slice(0,10)!==i.date)fail('วันที่ไม่ตรงคาบสอนแทน');root=db.doc('attendance_assignments/'+i.assignmentId+'/days/'+i.date.replaceAll('-',''));topic='substitute';}
  else {root=db.doc('attendance_morning_sessions/'+i.classId+'_'+i.date.replaceAll('-',''));topic='morning';const s=(await root.get()).data();if(!s||!admin&&!(s.teacherIds||[]).includes(p.teacherId))fail('ไม่มีสิทธิ์แจ้งห้องนี้','permission-denied');}
  const [room,students,marks]=await Promise.all([db.doc('attendance_classes/'+i.classId).get(),db.collection('attendance_classes/'+i.classId+'/students').get(),root.collection('marks').get()]);if(!room.data()?.active)fail('ห้องไม่พร้อมใช้งาน');
  const active=students.docs.filter(d=>d.data().active!==false),byId=new Map(marks.docs.map(d=>[d.id,d.data()]));if(!active.length||active.some(d=>!byId.has(d.id)))fail('ยังบันทึกนักเรียนไม่ครบห้อง','failed-precondition');
  const c=counts(active.map(d=>byId.get(d.id))),signature=hash([root.path,active.map(d=>[d.id,byId.get(d.id).revision,byId.get(d.id).status]).sort()]);
  if(topic==='morning')return {topic,key:signature,text:morningText(i.date,room.data().name,active,byId),url:'https://drivekup01.github.io/School-Portal/attendance/morning.html'};
  const title='📚 บันทึกการสอนแทน';
  return {topic,key:signature,text:`${title}\nวันที่ ${i.date} · ห้อง ${room.data().name}\nผู้บันทึก: ${p.name||'ครู'}${assignment?'\nวิชา '+assignment.subject+' · คาบ '+assignment.period:''}\nมา ${c.present} · สาย ${c.late} · ขาด ${c.absent} · ลา ${c.leave}\nบันทึกสำเร็จ · รายละเอียดในระบบตามสิทธิ์`,url:'https://drivekup01.github.io/School-Portal/attendance/'+(topic==='morning'?'morning.html':'subject.html')};
 }
 async function handle(request){
  const i=request.data||{},p=await actor(request),faculty=require('./academic-permissions').full(p);
  if(i.method==='previewGrades'||i.method==='sendGrades'){if(!faculty)fail('เฉพาะฝ่ายวิชาการและผู้ดูแลระบบ','permission-denied');const event=await grades(),id=N.eventId(event.topic,event.key),old=(await db.doc('school_notification_deliveries/'+id).get()).data();if(i.method==='previewGrades')return {text:event.text,signature:event.key,previous:old?{status:old.status,createdAt:old.createdAt?.toDate?.().toISOString()||''}:null};if(i.signature!==event.key||i.confirmed!==true)fail('ข้อมูลเปลี่ยน กรุณาดูตัวอย่างใหม่','failed-precondition');return deliver(event,p.uid);}
  if(i.method==='attendanceSaved')return deliver(await attendance(p,i),p.uid);
  if(i.method==='test'){await identity.requireAdmin(request);if(!['morning','substitute','grades'].includes(i.topic)||i.confirmed!==true)fail('เลือกหัวข้อและยืนยัน');return deliver({topic:i.topic,key:'connection-test-v1',text:'✅ ทดสอบการเชื่อมต่อ KBW School\nระบบแจ้งเตือนพร้อมเชื่อมกับงานโรงเรียน',url:'https://drivekup01.github.io/School-Portal/staff/'},p.uid);}
  fail('ไม่รองรับคำสั่ง');
 }
 return {handle};
}
module.exports={service,counts,config,morningText,messageParts};
