'use strict';
const M=require('./model');
function repository(db,serverTimestamp){
 const stateRef=db.doc('timetable_state/current');
 async function readVersion(id,scope='private'){
  const root=db.doc((scope==='public'?'timetable_public_versions/':'timetable_versions/')+id),snap=await root.get();if(!snap.exists)M.error('ไม่พบเวอร์ชันข้อมูล','not-found');const info=snap.data();if(info.status!=='ready')M.error('ข้อมูลยังไม่พร้อม','failed-precondition');const docs=await root.collection('parts').get(),chunks=[];for(const doc of docs.docs){const i=Number(doc.id);if(!Number.isInteger(i)||i<0||i>=info.partCount)M.error('ลำดับข้อมูลผิด','data-loss');chunks[i]=doc.data().json;}if(chunks.filter(x=>typeof x==='string').length!==info.partCount)M.error('ข้อมูลไม่ครบ','data-loss');return M.unpack(chunks,info.hash);
 }
 async function read(){const s=await stateRef.get();if(!s.exists)M.error('ยังไม่ย้ายข้อมูลเข้า Firebase','failed-precondition');const state=s.data();return {data:await readVersion(state.version),revision:state.revision,version:state.version,leaveRevision:state.leaveRevision||0};}
 async function stage(id,data){for(const [scope,payload]of [['timetable_versions',M.normalize(data)],['timetable_public_versions',M.publicView(data)]]){const ref=db.doc(scope+'/'+id),packed=M.parts(payload),batch=db.batch();for(let i=0;i<packed.parts.length;i++)batch.create(ref.collection('parts').doc(String(i)),{json:packed.parts[i]});batch.create(ref,{status:'ready',hash:packed.hash,bytes:packed.bytes,partCount:packed.parts.length,createdAt:serverTimestamp()});await batch.commit();}}
 async function save({data,expectedRevision,requestId,uid,method='saveDatabase',migration=false}){
  M.requestId(requestId);if(!Number.isInteger(expectedRevision)||expectedRevision<0)M.error('revision ไม่ถูกต้อง');const requestHash=M.hash(M.normalize(data)),version=db.collection('timetable_versions').doc().id,operation=db.doc('timetable_operations/'+uid+'_'+requestId);
  const receipt=await operation.get();if(receipt.exists){const r=receipt.data();if((r.requestHash||r.payloadHash)!==requestHash||r.method!==method)M.error('request ID เดิมใช้กับข้อมูลอื่นไม่ได้','already-exists');return r.result;}
  if(!Object.hasOwn(data,'teacherSched')){const current=await stateRef.get();if(current.exists){const prior=await readVersion(current.data().version);if(prior.teacherSched){const kept=Object.fromEntries(Object.entries(prior.teacherSched).filter(([k,v])=>data.teachers.some(t=>t.id===v.teacherId)&&data.slots.some(s=>String(s.id)===v.slotId&&!s.isBreak)&&data.days.includes(v.day)));data={...data,teacherSched:kept};}}}
  const clean=M.normalize(data);
  await stage(version,clean);
  return db.runTransaction(async tx=>{const [s,o]=await Promise.all([tx.get(stateRef),tx.get(operation)]);if(o.exists){if((o.data().requestHash||o.data().payloadHash)!==requestHash||o.data().method!==method)M.error('request ID ขัดแย้ง','already-exists');return o.data().result;}const current=s.exists?s.data():{revision:0};if(current.revision!==expectedRevision)M.error('ข้อมูลเปลี่ยนจากอีกหน้าจอ กรุณาโหลดใหม่ก่อนบันทึก','aborted');if(migration&&s.exists)M.error('มีข้อมูล Firebase แล้ว ไม่อนุญาตให้นำเข้าทับ','already-exists');const revision=expectedRevision+1,result={ok:true,revision,version,counts:M.counts(clean)};tx.set(stateRef,{...current,version,revision,updatedBy:uid,updatedAt:serverTimestamp()});tx.set(db.doc('timetable_public/current'),{version,revision,updatedAt:serverTimestamp()});tx.create(operation,{uid,method,requestHash,payloadHash:M.hash(clean),result,createdAt:serverTimestamp()});tx.create(db.collection('timetable_audit').doc(),{uid,method,fromVersion:current.version||null,toVersion:version,revision,createdAt:serverTimestamp()});return result;});
 }
 return {read,readVersion,save};
}
module.exports={repository};
