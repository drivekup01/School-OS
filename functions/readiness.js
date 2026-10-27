'use strict';
const {labels,grants}=require('./school-roles');
const modules=['attendance','timetable','budget','procurement'];
const clean=v=>String(v||'').replace(/\s+/g,'').toLowerCase();
const day=t=>t?.toDate?new Date(t.toDate().getTime()+7*3600000).toISOString().slice(0,10):typeof t==='string'?t.slice(0,10):'';
const iso=t=>t?.toDate?t.toDate().toISOString():typeof t==='string'?t:null;
function build({users=[],invites=[],authUsers=[],timetable,classes=[],assignments=[],reports=[],now=new Date()}){
 const authByUid=new Map(authUsers.map(u=>[u.uid,u])),authByEmail=new Map(authUsers.filter(u=>u.email).map(u=>[u.email.toLowerCase(),u]));
 const profiles=new Map(users.map(p=>[p.uid,p])),covered=new Set(),input=[];
 for(const invite of invites){const account=invite.claimedUid?authByUid.get(invite.claimedUid):authByEmail.get((invite.email||'').toLowerCase());const uid=invite.claimedUid||account?.uid||'';const profile=profiles.get(uid);if(profile)covered.add(uid);input.push({invite,profile,account,uid});}
 for(const p of users)if(!covered.has(p.uid))input.push({profile:p,account:authByUid.get(p.uid),uid:p.uid});
 const teaching=r=>!['admin','director','deputy'].includes(r),idCounts=new Map();for(const x of input){const p=x.profile||x.invite;if(p?.active&&p.teacherId&&teaching(p.schoolRole))idCounts.set(p.teacherId,(idCounts.get(p.teacherId)||0)+1);}
 const stamp=new Date(now.getTime()+7*3600000).toISOString().slice(0,10),native=timetable?.teachers||[],rooms=timetable?.rooms||[],slots=timetable?.slots||[],days=timetable?.days||[];
 const rows=input.map(({invite,profile,account,uid})=>{
  const p=profile||invite||{},teacher=native.find(t=>t.id===p.teacherId),issues=[],warnings=[];
  if(p.active!==true)issues.push('บัญชีถูกระงับ');if(account?.disabled)issues.push('บัญชีเข้าสู่ระบบถูกระงับ');
  if(!labels[p.schoolRole])issues.push('ยังไม่ได้กำหนดบทบาทกลาง');
  if(profile&&labels[p.schoolRole]){const g=grants(p.schoolRole);if(Object.keys(g).some(k=>p[k]!==g[k]))issues.push('สิทธิ์ในโปรไฟล์ไม่ตรงกับบทบาทกลาง');}
  if(teaching(p.schoolRole)){if(!p.teacherId)issues.push('ยังไม่ผูกรหัสครู');else if(!teacher)issues.push('ไม่พบรหัสครูในตารางสอน');if(idCounts.get(p.teacherId)>1)issues.push('รหัสครูถูกใช้ซ้ำหลายบัญชี');}
  if(teacher&&clean(p.name)!==clean((teacher.prefix||'')+(teacher.first||'')+' '+(teacher.last||'')))warnings.push('ชื่อบัญชีไม่ตรงกับชื่อในตารางสอน');
  const expectedRooms=rooms.filter(r=>[r.homeroom,r.homeroom2,r.homeroom3].includes(p.teacherId)&&p.teacherId).map(r=>r.label);
  const jobs=assignments.filter(a=>a.teacherUid===uid&&a.active===true&&(!day(a.from)||day(a.from)<=stamp)&&(!day(a.to)||day(a.to)>=stamp));
  const morning=[...new Map(jobs.filter(a=>a.kind==='morning').map(a=>[a.classId,a.className])).values()];
  const name=teacher?clean((teacher.prefix||'')+(teacher.first||'')+' '+(teacher.last||'')):'';let expectedLessons=0;
  for(const room of rooms)for(const slot of slots.filter(s=>!s.isBreak&&!s.teacherOnly))for(const d of days){const cell=timetable?.sched?.[room.id+'_'+slot.id+'_'+d];if(name&&cell?.subject&&[cell.teacher,cell.teacher2,cell.teacher3].some(v=>clean(v)===name))expectedLessons++;}
  const lessons=jobs.filter(a=>a.kind==='subject').length;
  for(const room of expectedRooms)if(!morning.some(m=>clean(m)===clean(room)))issues.push('ยังไม่มอบหมายเช็คชื่อประจำชั้น '+room);
  if(expectedLessons>0&&lessons===0&&!['director','deputy'].includes(p.schoolRole))issues.push('มีคาบในตารางสอน แต่ยังไม่มอบหมายงานเช็คชื่อรายคาบ');else if(expectedLessons!==lessons&&teaching(p.schoolRole))warnings.push('จำนวนคาบในตารางสอนและงานเช็คชื่อรายคาบต่างกัน');
  const ownClassIds=new Set(jobs.map(a=>a.classId));const emptyClasses=classes.filter(c=>ownClassIds.has(c.id)&&c.active!==false&&c.studentCount===0).map(c=>c.name);for(const name of emptyClasses)issues.push('ห้อง '+name+' ยังไม่มีนักเรียน');
  const report=reports.find(r=>r.uid===uid),checks=report?.checks||[];
  const errors=checks.filter(c=>c.status==='error');if(errors.length)issues.push('การทดสอบอ่านข้อมูลล่าสุดพบปัญหา');
  const checkedAt=iso(report?.checkedAt),fresh=checkedAt&&now.getTime()-Date.parse(checkedAt)<86400000;
  const complete=modules.every(m=>checks.some(c=>c.module===m&&c.status==='ok'));
  const status=!profile&&p.active===true?'pending':issues.length||warnings.length?'issue':fresh&&complete?'ready':'unverified';
  return {uid,email:account?.email||invite?.email||'',name:p.name||account?.displayName||'ไม่ระบุชื่อ',schoolRole:p.schoolRole||'',active:p.active===true,linked:!!profile,teacherId:p.teacherId||'',teacherName:teacher?(teacher.prefix||'')+(teacher.first||'')+' '+(teacher.last||''):'',expectedRooms,morningRooms:morning,expectedLessons,assignedLessons:lessons,studentClasses:classes.filter(c=>ownClassIds.has(c.id)).map(c=>({name:c.name,count:c.studentCount})),lastLogin:account?.metadata?.lastSignInTime||null,checkedAt,checks,fresh:!!fresh,status,issues,warnings};
 });
 return {checkedAt:now.toISOString(),rows:rows.sort((a,b)=>a.name.localeCompare(b.name,'th')),summary:{total:rows.length,ready:rows.filter(r=>r.status==='ready').length,issue:rows.filter(r=>r.status==='issue').length,pending:rows.filter(r=>r.status==='pending').length,unverified:rows.filter(r=>r.status==='unverified').length}};
}
function service(db,identity,repo,authAdmin,stamp){
 async function get(request){await identity.requireAdmin(request);const [p,i,a,c,r,table]=await Promise.all([db.collection('school_users').get(),db.collection('school_invites').get(),db.collection('attendance_assignments').get(),db.collection('attendance_classes').get(),db.collection('school_access_checks').get(),repo.read()]);const classes=await Promise.all(c.docs.filter(d=>d.data().active!==false).map(async d=>{const students=await d.ref.collection('students').select('active').get();return {id:d.id,...d.data(),studentCount:students.docs.filter(s=>s.data().active!==false).length};}));let page,authUsers=[];do{const batch=await authAdmin.listUsers(1000,page);authUsers.push(...batch.users.map(u=>({uid:u.uid,email:u.email,displayName:u.displayName,disabled:u.disabled,metadata:u.metadata})));page=batch.pageToken;}while(page);return build({users:p.docs.map(d=>({uid:d.id,...d.data()})),invites:i.docs.map(d=>d.data()),assignments:a.docs.map(d=>({id:d.id,...d.data()})),classes,reports:r.docs.map(d=>({uid:d.id,...d.data()})),timetable:table.data,authUsers});}
 async function report(request,input){const p=await identity.resolve(request);if(p.active!==true||p.registered!==true)throw Object.assign(Error('ยังไม่เชื่อมบัญชี'),{code:'permission-denied'});if(Object.keys(input).some(k=>!['method','checks'].includes(k))||!Array.isArray(input.checks)||input.checks.length!==4)throw Object.assign(Error('ผลตรวจไม่ถูกต้อง'),{code:'invalid-argument'});const seen=new Set(),checks=input.checks.map(c=>{if(!c||Object.keys(c).some(k=>!['module','status','code'].includes(k))||!modules.includes(c.module)||seen.has(c.module)||!['ok','error'].includes(c.status)||typeof c.code!=='string'||c.code.length>80||!/^[a-zA-Z0-9_./-]*$/.test(c.code))throw Object.assign(Error('ผลตรวจไม่ถูกต้อง'),{code:'invalid-argument'});seen.add(c.module);return {module:c.module,status:c.status,code:c.status==='error'?c.code:''};});await db.doc('school_access_checks/'+request.auth.uid).set({checks,checkedAt:stamp(),source:'portal-read-probe-v1'});return {ok:true};}
 return {get,report};
}
module.exports={build,service,modules};
