'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {initializeApp,getApps}=require('firebase-admin/app');
const {getFirestore,FieldValue,Timestamp}=require('firebase-admin/firestore');
const {defineString}=require('firebase-functions/params');
const {getAuth}=require('firebase-admin/auth');
const M=require('./model'),I=require('./identity'),{repository}=require('./storage');
if(!getApps().length)initializeApp();const db=getFirestore(),stamp=()=>FieldValue.serverTimestamp(),identity=I.service(db,stamp),repo=repository(db,stamp),importSource=require('./migration').migration(db,repo,stamp);
const LEGACY_API=defineString('SCHOOL_TIMETABLE_LEGACY_API',{default:''}),LEAVE_API=defineString('SCHOOL_TIMETABLE_LEGACY_LEAVE_API',{default:''});
// Callable requests authenticate inside the Firebase handler. Cloud Run must
// accept the browser's CORS preflight before Firebase verifies its ID token.
const options={region:'asia-southeast1',invoker:'public',memory:'256MiB',maxInstances:3,timeoutSeconds:120,cors:['https://drivekup01.github.io','http://127.0.0.1:4173','http://localhost:4173']};
async function handle(work){try{return await work();}catch(e){if(e instanceof HttpsError)throw e;const valid=['invalid-argument','permission-denied','unauthenticated','not-found','failed-precondition','already-exists','aborted','data-loss','resource-exhausted'];throw new HttpsError(valid.includes(e.code)?e.code:'internal',e.message||'ดำเนินการไม่สำเร็จ');}}
async function academic(request){const p=await identity.resolve(request);M.assertAcademic(p);return p;}
async function legacy(url,action){if(!url||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url))M.error('ยังไม่ได้ตั้ง URL แหล่งข้อมูลเดิม','failed-precondition');const res=await fetch(url+'?action='+encodeURIComponent(action)+'&_='+Date.now(),{signal:AbortSignal.timeout(90000)});if(!res.ok)M.error('แหล่งข้อมูลเดิมตอบ HTTP '+res.status,'failed-precondition');const body=await res.json();if(!body.ok)M.error('แหล่งข้อมูลเดิมตอบไม่สำเร็จ','failed-precondition');return body;}
async function source(){const [body,leave]=await Promise.all([legacy(LEGACY_API.value(),'refresh'),legacy(LEAVE_API.value(),'leaveHistory')]);const data=M.normalize(body.data),rows=Array.isArray(leave.rows)?leave.rows:[];M.validJson(rows);if(Buffer.byteLength(JSON.stringify(rows))>800000)M.error('ประวัติลาใหญ่เกินขอบเขต');return {data,leaveRows:rows,sourceHash:M.hash({data,rows}),counts:{...M.counts(data),leaveRecords:rows.length}};}
const readiness=require('./readiness').service(db,identity,repo,getAuth(),stamp);
const attendanceSchedule=require('./attendance-schedule').service(db,identity,repo);
const morning=require('./morning').service(db,identity,repo,stamp,Timestamp);
exports.schoolIdentity=onCall(options,request=>handle(async()=>{const input=request.data||{};switch(input.method){case 'morningClasses':case 'morningSession':case 'saveMorningSession':return morning.handle(request,input);case 'attendanceSchedule':return attendanceSchedule.get(request,input);case 'readiness':return readiness.get(request);case 'reportReadiness':return readiness.report(request,input);case 'resolveProfile':return identity.resolve(request);case 'listUsers':return identity.list(request);case 'saveInvitation':return identity.saveInvite(request,input);case 'updateUser':return identity.updateUser(request,input);default:M.error('ไม่รองรับคำสั่งบัญชี');}}));
exports.timetableApi=onCall(options,request=>handle(async()=>{
 const input=request.data||{},method=input.method,p=await identity.resolve(request);
 const caps=require('./school-roles').capabilities(p);
 if(['bootstrap','leaveHistory'].includes(method)){if(!(caps?caps.readAll:p.active&&p.timetableRole==='academic'))M.error('ไม่มีสิทธิ์ดูข้อมูลตารางสอน','permission-denied');}else M.assertAcademic(p);
 if(method==='bootstrap')return {ok:true,...await repo.read()};
 if(method==='migrationPreview'){await identity.requireAdmin(request);const s=await source();return {ok:true,counts:s.counts,sourceHash:s.sourceHash};}
 if(method==='migrateLegacy'){
  await identity.requireAdmin(request);M.requestId(input.requestId);
  const receipt=await db.doc('timetable_operations/'+p.uid+'_'+input.requestId).get();
  if(receipt.exists){if(receipt.data().method!=='migrateLegacy')M.error('request ID ใช้แล้ว','already-exists');return receipt.data().result;}
  return importSource({source:await source(),sourceHash:input.sourceHash,uid:p.uid,requestId:input.requestId});
 }
 if(method==='leaveHistory'){const snap=await db.doc('timetable_leave/current').get();return {ok:true,rows:snap.exists?JSON.parse(snap.data().json):[],syncedAt:snap.exists?snap.data().updatedAt?.toDate?.().toISOString():null};}
 if(method==='refreshLeave'){const out=await legacy(LEAVE_API.value(),'leaveHistory');const rows=Array.isArray(out.rows)?out.rows:[];if(Buffer.byteLength(JSON.stringify(rows))>800000)M.error('ข้อมูลลาใหญ่เกินกำหนด');await db.doc('timetable_leave/current').set({json:JSON.stringify(rows),updatedAt:stamp(),updatedBy:p.uid});return {ok:true,rows};}
 const current=await repo.read();let data=M.clone(current.data);
 if(method==='saveDatabase'){data=typeof input.data==='string'?JSON.parse(input.data):input.data;}
 else if(method==='saveSubstitute'){data.substitute=typeof input.substitute==='string'?JSON.parse(input.substitute):input.substitute;}
 else if(method==='setMode'){if(!['DAILY','SETUP'].includes(input.mode))M.error('โหมดไม่ถูกต้อง');data.systemMode=input.mode;}
 else if(method==='saveAnnouncement'){const a=typeof input.announcement==='string'?JSON.parse(input.announcement):input.announcement||input;const id=String(a.id||'');if(!id||id.length>100||typeof a.title!=='string'||!a.title.trim()||a.title.length>500||typeof a.body!=='string'||a.body.length>10000)M.error('ประกาศไม่ถูกต้อง');const old=data.announcements.find(x=>x.id===id),next={id,title:a.title,body:a.body,type:String(a.type||'ทั่วไป').slice(0,80),date:String(a.date||'').slice(0,30),createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};data.announcements=data.announcements.filter(x=>x.id!==id).concat(next);}
 else if(method==='deleteAnnouncement'){data.announcements=data.announcements.filter(x=>x.id!==String(input.id));}
 else M.error('ไม่รองรับคำสั่งตารางสอน');
 if(caps&&!caps.admin&&JSON.stringify(data.school)!==JSON.stringify(current.data.school))M.error('การแก้ไขส่วนเว็บไซต์ใช้ได้เฉพาะผู้ดูแลระบบ','permission-denied');
 const result=await repo.save({data,expectedRevision:input.expectedRevision,requestId:input.requestId,uid:p.uid,method});return {...result,systemMode:data.systemMode};
}));
