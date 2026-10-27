'use strict';
const M=require('./model');
function auth(request){const a=request.auth;if(!a||a.token.email_verified!==true||a.token.firebase?.sign_in_provider!=='google.com'||typeof a.token.email!=='string')M.error('กรุณาเข้าสู่ระบบด้วยบัญชี Google ที่ยืนยันอีเมลแล้ว','unauthenticated');return a;}
const inviteId=email=>M.hash(email.trim().toLowerCase());
function service(db,stamp){
 async function resolve(request){
  const a=auth(request),ref=db.doc('school_users/'+a.uid),email=a.token.email.trim().toLowerCase();
  const existing=await ref.get();if(existing.exists){if(!existing.data().active)M.error('บัญชีนี้ถูกระงับ','permission-denied');return {...existing.data(),uid:a.uid,email,registered:true};}
  const invitation=db.doc('school_invites/'+inviteId(email));
  return db.runTransaction(async tx=>{
   const [current,invite,attendance,budget]=await Promise.all([tx.get(ref),tx.get(invitation),tx.get(db.doc('attendance_teachers/'+a.uid)),tx.get(db.doc('budget_users/'+a.uid))]);
   if(current.exists){if(!current.data().active)M.error('บัญชีนี้ถูกระงับ','permission-denied');return {...current.data(),uid:a.uid,email,registered:true};}
   let p;
   if(invite.exists){const i=invite.data();if(!i.active||i.email!==email||(i.claimedUid&&i.claimedUid!==a.uid))M.error('บัญชีนี้ยังไม่ได้รับอนุมัติ','permission-denied');p=M.identity(i);tx.update(invitation,{claimedUid:a.uid,claimedAt:stamp()});}
   else {const ap=attendance.data(),bp=budget.data(),att=ap?.active&&ap.email?.toLowerCase()===email?ap:null,bud=bp?.active&&bp.email?.toLowerCase()===email?bp:null;
    if(!att&&!bud)return {uid:a.uid,email,name:a.token.name||email,active:true,teacherId:'',identityAdmin:false,timetableRole:'viewer',attendanceRole:'none',budgetRole:'none',registered:false};
    p=M.identity({name:att?.name||bud?.name||a.token.name||email,active:true,teacherId:att?.teacherId||'',identityAdmin:att?.role==='admin',timetableRole:att?.role==='admin'?'academic':'viewer',attendanceRole:att?.role==='admin'?'admin':att?'teacher':'none',budgetRole:['admin','editor'].includes(bud?.role)?bud.role:'none'});
   }
   tx.create(ref,{...p,createdAt:stamp(),updatedAt:stamp()});tx.create(db.collection('school_identity_audit').doc(),{action:'claim-profile',uid:a.uid,createdAt:stamp()});return {...p,uid:a.uid,email,registered:true};
  });
 }
 async function requireAdmin(request){const p=await resolve(request);if(!p.active||(p.schoolRole?p.schoolRole!=='admin':!p.identityAdmin))M.error('เฉพาะผู้ดูแลบัญชีกลาง','permission-denied');return p;}
 async function liveAdmin(tx,uid){const snap=await tx.get(db.doc('school_users/'+uid)),p=snap.data();if(!snap.exists||!p.active||(p.schoolRole?p.schoolRole!=='admin':!p.identityAdmin))M.error('สิทธิ์ผู้ดูแลเปลี่ยนแล้ว','permission-denied');}
 async function saveInvite(request,input){const actor=await requireAdmin(request);if(typeof input.email!=='string'||!input.email.trim().match(/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/)||input.email.length>254)M.error('อีเมลไม่ถูกต้อง');const email=input.email.trim().toLowerCase(),profile=M.identity(input),ref=db.doc('school_invites/'+inviteId(email));
  await db.runTransaction(async tx=>{await liveAdmin(tx,actor.uid);const old=await tx.get(ref);if(old.exists&&old.data().claimedUid)M.error('บัญชีนี้เชื่อมแล้ว ให้แก้สิทธิ์จากรายการผู้ใช้','failed-precondition');tx.set(ref,{...profile,email,createdAt:old.data()?.createdAt||stamp(),updatedAt:stamp(),updatedBy:actor.uid});tx.create(db.collection('school_identity_audit').doc(),{action:'save-invitation',uid:actor.uid,inviteId:ref.id,createdAt:stamp()});});return {ok:true};
 }
 async function list(request){await requireAdmin(request);const [users,invites]=await Promise.all([db.collection('school_users').get(),db.collection('school_invites').get()]);return {users:users.docs.map(s=>({...s.data(),uid:s.id})),invites:invites.docs.map(s=>({...s.data(),id:s.id}))};}
 async function updateUser(request,input){const actor=await requireAdmin(request);if(typeof input.uid!=='string'||!input.uid.match(/^[A-Za-z0-9_-]{1,128}$/))M.error('UID ไม่ถูกต้อง');const p=M.identity(input);if(actor.uid===input.uid&&(!p.active||!p.identityAdmin))M.error('ไม่สามารถระงับหรือลดสิทธิ์ผู้ดูแลของบัญชีตนเอง','failed-precondition');const ref=db.doc('school_users/'+input.uid);await db.runTransaction(async tx=>{await liveAdmin(tx,actor.uid);const s=await tx.get(ref);if(!s.exists)M.error('ไม่พบบัญชี','not-found');tx.update(ref,{...p,updatedAt:stamp()});tx.create(db.collection('school_identity_audit').doc(),{action:'update-user',uid:actor.uid,targetUid:input.uid,before:s.data(),after:p,createdAt:stamp()});});return {ok:true};}
 return {resolve,requireAdmin,saveInvite,list,updateUser};
}
module.exports={service,auth,inviteId};
