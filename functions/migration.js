'use strict';
const M=require('./model');
function migration(db,repo,stamp){
 return async function importSource({source,sourceHash,uid,requestId}){
  M.requestId(requestId);const operation=db.doc('timetable_operations/'+uid+'_'+requestId),receipt=await operation.get();if(receipt.exists){if(receipt.data().method!=='migrateLegacy')M.error('request ID ใช้แล้ว','already-exists');return receipt.data().result;}
  if(source.sourceHash!==sourceHash)M.error('ข้อมูลต้นทางเปลี่ยน กรุณาตรวจตัวอย่างนำเข้าใหม่','aborted');
  const lock=db.doc('timetable_migration/lock'),state=db.doc('timetable_state/current');
  await db.runTransaction(async tx=>{const [current,held]=await Promise.all([tx.get(state),tx.get(lock)]);if(current.exists)M.error('ฐาน Firebase มีข้อมูลแล้ว ไม่อนุญาตให้นำเข้าทับ','already-exists');const previous=held.data();if(previous&&previous.requestId!==requestId)M.error('มีคำขอย้ายข้อมูลอื่นอยู่ กรุณาใช้คำขอเดิมหรือติดต่อผู้ดูแล','failed-precondition');if(previous&&previous.sourceHash!==sourceHash)M.error('ข้อมูลต้นทางเปลี่ยนในระหว่างนำเข้า ต้องตรวจสอบคำขอเดิมก่อน','aborted');tx.set(lock,{requestId,sourceHash,uid,createdAt:previous?.createdAt||stamp()});});
  await db.doc('timetable_leave/current').set({json:JSON.stringify(source.leaveRows),sourceHash,updatedAt:stamp(),updatedBy:uid});
  return repo.save({data:source.data,expectedRevision:0,requestId,uid,method:'migrateLegacy',migration:true});
 };
}
module.exports={migration};
