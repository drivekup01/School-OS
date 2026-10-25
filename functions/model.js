'use strict';
const crypto=require('node:crypto');
const ROOT=['school','teachers','subjects','rooms','slots','days','sched','substitute','announcements','customDepts','subjectColorSchemeVersion','systemMode'];
const clone=v=>JSON.parse(JSON.stringify(v));
function error(message,code='invalid-argument'){const e=new Error(message);e.code=code;throw e;}
function object(v){return v&&typeof v==='object'&&!Array.isArray(v);}
function validJson(v,depth=0){if(depth>15)error('ข้อมูลซ้อนลึกเกินกำหนด');if(v===null||typeof v==='boolean')return;if(typeof v==='number'){if(!Number.isFinite(v))error('พบตัวเลขไม่ถูกต้อง');return;}if(typeof v==='string'){if(v.length>200000)error('ข้อความยาวเกินกำหนด');return;}if(Array.isArray(v)){if(v.length>10000)error('รายการมากเกินกำหนด');for(const x of v)validJson(x,depth+1);return;}if(object(v)){const keys=Object.keys(v);if(keys.length>20000)error('ข้อมูลมากเกินกำหนด');for(const k of keys){if(['__proto__','constructor','prototype'].includes(k))error('พบ key ที่ไม่อนุญาต');validJson(v[k],depth+1);}return;}error('ข้อมูล JSON ไม่ถูกต้อง');}
function normalize(input){
 if(!object(input))error('ไม่พบฐานข้อมูล');validJson(input);
 for(const k of Object.keys(input))if(!ROOT.includes(k))error('ไม่รองรับ field: '+k);
 const d=clone(input);for(const k of ['teachers','subjects','rooms','slots','days','announcements','customDepts']){if(!Array.isArray(d[k]))error('ข้อมูล '+k+' ต้องเป็นรายการ');}
 if(!object(d.school)||!object(d.sched)||!object(d.substitute))error('โครงสร้างข้อมูลไม่ถูกต้อง');
 for(const k of ['teachers','subjects','rooms']){const seen=new Set();for(const row of d[k]){if(!object(row)||typeof row.id!=='string'||!row.id||row.id.length>100||seen.has(row.id))error('รหัสซ้ำหรือไม่ถูกต้องใน '+k);seen.add(row.id);}}
 if(d.teachers.length>1000||d.rooms.length>500||d.subjects.length>5000||Object.keys(d.sched).length>20000)error('ฐานข้อมูลใหญ่เกินขอบเขตที่รองรับ');
 if(!['DAILY','SETUP'].includes(d.systemMode||'DAILY'))error('โหมดระบบไม่ถูกต้อง');d.systemMode=d.systemMode||'DAILY';
 if(Buffer.byteLength(JSON.stringify(d))>6*1024*1024)error('ฐานข้อมูลเกิน 6 MB');return d;
}
function publicView(data){
 const d=normalize(data),school={};for(const k of ['name','year','semester','logoUrl','logoSize'])if(typeof d.school[k]==='string')school[k]=d.school[k];
 // Only teacher names/IDs used by public timetable are published. Never copy
 // contacts, private notes, leave records or auth settings into public documents.
 const fields=(v,keys)=>Object.fromEntries(keys.filter(k=>v[k]!==undefined).map(k=>[k,clone(v[k])]));
 return {school,teachers:d.teachers.map(t=>fields(t,['id','prefix','first','last','dept','subjects'])),subjects:d.subjects.map(t=>fields(t,['id','code','name','grade','dept','hours','color'])),rooms:d.rooms.map(t=>fields(t,['id','level','grade','room','label','homeroom','homeroom2','homeroom3','planName'])),slots:d.slots.map(t=>fields(t,['id','label','start','end','isBreak'])),days:clone(d.days),sched:Object.fromEntries(Object.entries(d.sched).map(([k,v])=>[k,fields(v,['subject','teacher','teacher2','teacher3','learnRoom','locked'])])),substitute:{},announcements:[],customDepts:clone(d.customDepts),subjectColorSchemeVersion:d.subjectColorSchemeVersion||2,systemMode:'DAILY'};
}
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
function parts(data){const text=JSON.stringify(data),chars=Array.from(text),out=[];let current='',bytes=0;for(const char of chars){const n=Buffer.byteLength(char);if(bytes+n>150000){out.push(current);current='';bytes=0;}current+=char;bytes+=n;}if(current||!out.length)out.push(current);return {parts:out,hash:hash(text),bytes:Buffer.byteLength(text)};}
function unpack(chunks,expected){const text=chunks.join('');if(hash(text)!==expected)error('ข้อมูลไม่ครบหรือ checksum ไม่ตรง','data-loss');return JSON.parse(text);}
function counts(d){return {teachers:d.teachers.length,subjects:d.subjects.length,rooms:d.rooms.length,scheduleCells:Object.keys(d.sched).length,substituteDays:Object.keys(d.substitute).length,announcements:d.announcements.length};}
function assertAcademic(profile){if(!profile?.active||(!profile.identityAdmin&&profile.timetableRole!=='academic'))error('บัญชีนี้ไม่มีสิทธิ์ฝ่ายวิชาการ','permission-denied');}
function roles(input){const p=input||{};if(!['none','viewer','academic'].includes(p.timetableRole)||!['none','teacher','admin'].includes(p.attendanceRole)||!['none','editor','admin'].includes(p.budgetRole)||typeof p.identityAdmin!=='boolean')error('รูปแบบสิทธิ์ไม่ถูกต้อง');return {timetableRole:p.timetableRole,attendanceRole:p.attendanceRole,budgetRole:p.budgetRole,identityAdmin:p.identityAdmin};}
function identity(input){const r=roles(input);if(typeof input.name!=='string'||!input.name.trim()||input.name.length>160||typeof input.teacherId!=='string'||input.teacherId.length>100||typeof input.active!=='boolean')error('ข้อมูลบัญชีไม่ถูกต้อง');return {...r,name:input.name.trim(),teacherId:input.teacherId,active:input.active};}
function requestId(value){if(typeof value!=='string'||!value.match(/^[A-Za-z0-9_-]{12,100}$/))error('request ID ไม่ถูกต้อง');return value;}
module.exports={normalize,publicView,parts,unpack,counts,hash,assertAcademic,roles,identity,requestId,clone,error,validJson};
