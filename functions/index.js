'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {initializeApp,getApps}=require('firebase-admin/app');
const {getFirestore,FieldValue,Timestamp}=require('firebase-admin/firestore');
const {defineString}=require('firebase-functions/params');
const {defineSecret}=require('firebase-functions/params');
const TELEGRAM_BOT_TOKEN=defineSecret('TELEGRAM_BOT_TOKEN');
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
const attendanceSchedule=require('./attendance-schedule').service(db,identity,repo,stamp,Timestamp);
const morning=require('./morning').service(db,identity,repo,stamp,Timestamp);
exports.schoolNotifications=onCall({...options,secrets:[TELEGRAM_BOT_TOKEN]},request=>handle(()=>require('./school-notifications').service(db,identity,repo,stamp,()=>TELEGRAM_BOT_TOKEN.value()).handle(request)));
exports.schoolIdentity=audited('schoolIdentity',options,request=>handle(async()=>{const input=request.data||{};switch(input.method){case 'academicOverview':return require('./academic-overview').service(db,identity,repo).get(request,input);case 'regularAttendanceSession':case 'saveRegularAttendance':return require('./regular-attendance').service(db,identity,repo,Timestamp).handle(request,input);case 'attendanceSpecialReport':case 'attendanceTermCatalog':case 'attendanceTermReport':return require('./attendance-term-report').service(db,identity,repo).get(request,input);case 'morningClasses':case 'morningSession':case 'saveMorningSession':return morning.handle(request,input);case 'attendanceCatalog':return require('./attendance-catalog').service(db,identity,repo).get(request,input);case 'morningReport':return morning.handle(request,input);case 'attendanceHome':return require('./attendance-home').service(db,identity,repo).get(request,input);case 'attendanceSchedule':return attendanceSchedule.get(request,input);case 'readiness':return readiness.get(request);case 'reportReadiness':return readiness.report(request,input);case 'resolveProfile':return identity.resolve(request);case 'listUsers':return identity.list(request);case 'saveInvitation':return identity.saveInvite(request,input);case 'updateUser':return identity.updateUser(request,input);default:M.error('ไม่รองรับคำสั่งบัญชี');}}));
exports.timetableApi=audited('timetableApi',options,request=>handle(async()=>{
 const input=request.data||{},method=input.method,p=await identity.resolve(request);
 const caps=require('./school-roles').capabilities(p),academicPermissions=require('./academic-permissions');
 if(academicPermissions.scheduler(p)&&!['bootstrap','leaveHistory','saveDatabase','saveSubstitute'].includes(method)&&!String(method).startsWith('exchange'))M.error('สิทธิ์วิชาการ #2 ใช้ได้เฉพาะจัดตารางสอนและเพิ่มข้อมูลพื้นฐาน','permission-denied');
 if(['bootstrap','leaveHistory'].includes(method)){if(!(caps?caps.readAll:p.active&&p.timetableRole==='academic'))M.error('ไม่มีสิทธิ์ดูข้อมูลตารางสอน','permission-denied');}else M.assertAcademic(p);
 if(typeof method==='string'&&method.startsWith('exchange'))return require('./exchanges').service(db,identity,repo,stamp).handle(request,input);
 if(method==='bootstrap')return {ok:true,...await repo.read()};
 if(method==='migrationPreview'){await identity.requireAdmin(request);const s=await source();return {ok:true,counts:s.counts,sourceHash:s.sourceHash};}
 if(method==='migrateLegacy'){
  await identity.requireAdmin(request);M.requestId(input.requestId);
  const receipt=await db.doc('timetable_operations/'+p.uid+'_'+input.requestId).get();
  if(receipt.exists){if(receipt.data().method!=='migrateLegacy')M.error('request ID ใช้แล้ว','already-exists');return receipt.data().result;}
  return importSource({source:await source(),sourceHash:input.sourceHash,uid:p.uid,requestId:input.requestId});
 }
 if(method==='leaveHistory'){const snap=await db.doc('timetable_leave/current').get();return {ok:true,rows:snap.exists?JSON.parse(snap.data().json):[],syncedAt:snap.exists?snap.data().updatedAt?.toDate?.().toISOString():null};}
 if(method==='refreshLeave'){const out=await legacy(LEAVE_API.value(),'leaveHistory');const rows=Array.isArray(out.rows)?out.rows:[];if(Buffer.byteLength(JSON.stringify(rows))>800000)M.error('ข้อมูลลาใหญ่เกินกำหนด');await db.runTransaction(async tx=>{const live=(await tx.get(db.doc('school_users/'+p.uid))).data();if(!academicPermissions.full(live))M.error('สิทธิ์เปลี่ยนแปลง','permission-denied');tx.set(db.doc('timetable_leave/current'),{json:JSON.stringify(rows),updatedAt:stamp(),updatedBy:p.uid});});return {ok:true,rows};}
 const current=await repo.read();let data=M.clone(current.data);
 if(method==='saveDatabase'){data=typeof input.data==='string'?JSON.parse(input.data):input.data;}
 else if(method==='saveSubstitute'){data.substitute=typeof input.substitute==='string'?JSON.parse(input.substitute):input.substitute;}
 else if(method==='setMode'){if(!['DAILY','SETUP'].includes(input.mode))M.error('โหมดไม่ถูกต้อง');data.systemMode=input.mode;}
 else if(method==='saveAnnouncement'){const a=typeof input.announcement==='string'?JSON.parse(input.announcement):input.announcement||input;const id=String(a.id||'');if(!id||id.length>100||typeof a.title!=='string'||!a.title.trim()||a.title.length>500||typeof a.body!=='string'||a.body.length>10000)M.error('ประกาศไม่ถูกต้อง');const old=data.announcements.find(x=>x.id===id),next={id,title:a.title,body:a.body,type:String(a.type||'ทั่วไป').slice(0,80),date:String(a.date||'').slice(0,30),createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};data.announcements=data.announcements.filter(x=>x.id!==id).concat(next);}
 else if(method==='deleteAnnouncement'){data.announcements=data.announcements.filter(x=>x.id!==String(input.id));}
 else M.error('ไม่รองรับคำสั่งตารางสอน');
 require('./exchanges').preserve(data,current.data);require('./exchanges').compatible(data);
 data=M.normalize(data);academicPermissions.change(p,M.normalize(current.data),data,method);
 const result=await repo.save({data,expectedRevision:input.expectedRevision,requestId:input.requestId,uid:p.uid,method,precondition:async tx=>{const live=(await tx.get(db.doc('school_users/'+p.uid))).data();M.assertAcademic(live);academicPermissions.change(live,M.normalize(current.data),data,method);}});
 if(['saveSubstitute','saveDatabase'].includes(method)){
  const published=await repo.read();
  if(published.version===result.version)await require('./substitute-attendance').service(db,stamp,Timestamp).revokeMissing({data:published.data,version:published.version,uid:p.uid});
 }
 return {...result,systemMode:data.systemMode};
}));

function audited(name,options,handler){const db=require('firebase-admin/firestore').getFirestore(),stamp=()=>require('firebase-admin/firestore').FieldValue.serverTimestamp();const audit=require('./usage-audit').service(db,stamp);return onCall(options,request=>audit.track(name,request,()=>handler(request)));}

const gradeReports=require('./grades-service').service(db,require('firebase-admin/storage').getStorage(),stamp,repo);
exports.schoolGrades=audited('schoolGrades',{...options,memory:'512MiB',timeoutSeconds:300},request=>handle(()=>gradeReports.handle(request)));

const remedial=require('./remedial-service').service(db,require('firebase-admin/storage').getStorage(),stamp,repo);
exports.schoolRemedial=onCall({...options,memory:'512MiB',timeoutSeconds:300},request=>require('./usage-audit').service(db,stamp).track('schoolRemedial',{auth:request.auth,data:{method:'remedial'+String(request.data?.method||'').replace(/^./,c=>c.toUpperCase())},rawRequest:request.rawRequest},()=>handle(()=>remedial.handle(request))));

const academicStudents=require('./academic-students').service(db,repo,stamp);
exports.schoolAcademicStudents=onCall(options,request=>require('./usage-audit').service(db,stamp).track('schoolAcademicStudents',{auth:request.auth,data:{method:request.data?.method==='save'?'academicSaveStudent':'read'},rawRequest:request.rawRequest},()=>handle(()=>academicStudents.handle(request))));
