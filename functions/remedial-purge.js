'use strict';
const M=require('./remedial-model');
// Remove import/case content while retaining a minimal deletion receipt for retry safety.
function service(db,bucket,stamp){
 async function purge(a,i,kind){
  if(!a.faculty)M.fail('เฉพาะฝ่ายวิชาการและผู้ดูแลระบบ','permission-denied');
  if(i.confirmed!==true||!M.token(i.requestId))M.fail('ยืนยันการลบถาวรก่อนดำเนินการ');
  const isBatch=kind==='batch',id=isBatch?i.batchId:i.caseId;
  if(!/^[a-f0-9]{64}$/.test(id||''))M.fail('รหัสรายการไม่ถูกต้อง');
  if(!isBatch&&!Number.isInteger(i.revision))M.fail('เวอร์ชันรายการไม่ถูกต้อง');
  const root=db.doc((isBatch?'school_remedial_batches/':'school_remedial_cases/')+id),marker=db.doc('school_remedial_'+kind+'_purges/'+id),op=db.doc('school_remedial_operations/'+M.hash(a.uid+':'+i.requestId)),signature=M.hash(JSON.stringify(i)),result={ok:true,permanentlyDeleted:true};
  const authorized=p=>{if(!M.faculty(p))M.fail('สิทธิ์เปลี่ยนแปลง','permission-denied');};
  const start=await db.runTransaction(async tx=>{const [p,o,r,m]=await Promise.all([tx.get(db.doc('school_users/'+a.uid)),tx.get(op),tx.get(root),tx.get(marker)]);authorized(p.data());if(o.exists){if(o.data().signature!==signature)M.fail('รหัสยืนยันซ้ำกับข้อมูลอื่น','already-exists');return {done:true,result:o.data().result};}if(!r.exists){if(m.data()?.status!=='complete')M.fail('ไม่พบรายการ','not-found');tx.create(op,{signature,result,createdAt:stamp()});return {done:true,result};}const d=r.data();if(isBatch&&d.status==='staging')M.fail('ไฟล์กำลังนำเข้า กรุณารอให้เสร็จก่อนลบ','failed-precondition');if(!isBatch&&d.state!=='purging'&&d.revision!==i.revision)M.fail('ข้อมูลเปลี่ยนแปลง กรุณาโหลดใหม่','aborted');const token=d.purgeToken||M.hash(a.uid+':'+i.requestId);tx.update(root,isBatch?{status:'purging',purgeToken:token}:{state:'purging',published:false,purgeToken:token});tx.set(marker,{status:'running',token,by:a.uid,at:stamp()});return {token};});
  if(start.done)return start.result;
  const check=(p,r,m)=>{authorized(p.data());if(r.exists&&r.data().purgeToken!==start.token||m.data()?.token!==start.token)M.fail('รายการลบเปลี่ยนแปลง','aborted');};
  if(isBatch){authorized((await db.doc('school_users/'+a.uid).get()).data());await bucket.file('remedial/'+id+'/original.pdf').delete({ignoreNotFound:true});}
  const children=root.collection(isBatch?'rows':'events');
  while(true){const count=await db.runTransaction(async tx=>{const [p,r,m,s]=await Promise.all([tx.get(db.doc('school_users/'+a.uid)),tx.get(root),tx.get(marker),tx.get(children.limit(400))]);check(p,r,m);for(const d of s.docs)tx.delete(children.doc(d.id));return s.docs.length;});if(count<400)break;}
  return db.runTransaction(async tx=>{const [p,r,m,o,left]=await Promise.all([tx.get(db.doc('school_users/'+a.uid)),tx.get(root),tx.get(marker),tx.get(op),tx.get(children.limit(1))]);check(p,r,m);if(left.docs.length)M.fail('ยังมีข้อมูลรอลบ กรุณาลองอีกครั้ง','aborted');if(o.exists){if(o.data().signature!==signature)M.fail('รหัสยืนยันซ้ำ','already-exists');return o.data().result;}if(r.exists)tx.delete(root);tx.set(marker,{status:'complete',token:start.token,by:a.uid,at:stamp()});tx.create(op,{signature,result,createdAt:stamp()});return result;});
 }
 return {batch:(a,i)=>purge(a,i,'batch'),case:(a,i)=>purge(a,i,'case')};
}
module.exports={service};
