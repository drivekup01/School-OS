'use strict';
const M=require('./grades-model');
const BUCKET='school-budget-3e69d-student-reports';
const clean=row=>JSON.parse(JSON.stringify(row));
function service(db,storage,stamp,repo,parser=require('./grades-parser').splitAndParse){
 const bucket=storage.bucket(BUCKET),ref=id=>db.doc('school_grade_batches/'+id);
 async function faculty(request){return M.requireFaculty(request.auth,(await db.doc('school_users/'+request.auth?.uid).get()).data());}
 function validate(input){
  const fields={gradeUpload:['method','requestId','name','base64','kind'],gradeList:['method'],gradeDetail:['method','batchId'],gradePreview:['method','batchId','page'],gradePublish:['method','batchId','pages','subjectNames','reviewed','replaceExisting','requestId'],gradeWithdraw:['method','batchId','requestId']};
  if(!input||!Object.hasOwn(fields,input.method)||Object.keys(input).some(k=>!fields[input.method].includes(k)))M.fail('คำขอไม่ถูกต้อง');
  if(input.method!=='gradeUpload'&&input.method!=='gradeList'&&!/^[a-f0-9]{64}$/.test(input.batchId||''))M.fail('รหัสชุดเอกสารไม่ถูกต้อง');
 }
 async function getBatch(batchId){const snap=await ref(batchId).get();if(!snap.exists)M.fail('ไม่พบชุดเอกสาร','not-found');return snap.data();}
 async function pagesOf(batchId){return (await ref(batchId).collection('pages').orderBy('page').get()).docs.map(d=>d.data());}
 async function storeFile(path,bytes){
  const digest=M.hash(bytes),file=bucket.file(path);
  try{await file.save(bytes,{resumable:false,validation:'crc32c',preconditionOpts:{ifGenerationMatch:0},metadata:{contentType:'application/pdf',cacheControl:'private,no-store',metadata:{sha256:digest}}});}
  catch(error){if(Number(error.code)!==412)throw error;const [meta]=await file.getMetadata();if(meta.metadata?.sha256!==digest)M.fail('เอกสารเดิมของรายการนี้ไม่ตรงกัน','aborted');}
 }
 async function upload(request,input,actor){
  if(!M.id(input.requestId)||typeof input.name!=='string'||!input.name.trim()||input.name.length>200||!['final','midterm'].includes(input.kind)||typeof input.base64!=='string'||input.base64.length>8.4*1024*1024||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64))M.fail('ไฟล์หรือข้อมูลการนำเข้าไม่ถูกต้อง');
  const bytes=Buffer.from(input.base64,'base64');if(bytes.toString('base64')!==input.base64)M.fail('ข้อมูล PDF ไม่สมบูรณ์');
  const digest=M.hash(bytes),batchId=M.hash(actor.uid+':'+input.requestId),target=ref(batchId),prior=await target.get();
  if(prior.exists){if(prior.data().hash!==digest)M.fail('รหัสนำเข้าเดิมใช้กับไฟล์อื่นแล้ว','already-exists');if(prior.data().status!=='staging')return {batchId,replayed:true};}
  const [parsed,table,classDocs]=await Promise.all([parser(bytes),repo.read(),db.collection('attendance_classes').get()]);
  const periods=[...new Set(parsed.filter(p=>p.identityReady).map(p=>p.year+'_'+p.term))];if(periods.length!==1)M.fail('ไฟล์ต้องอ่านปีและภาคเรียนได้ และเป็นปี/ภาคเดียวกันทั้งชุด');
  if(parsed.some(p=>p.kind&&p.kind!==input.kind))M.fail('ประเภทกลางภาค/ปลายภาคที่เลือกไม่ตรงกับเอกสาร');
  const classes=require('./attendance-catalog').currentClasses(table.data,classDocs.docs.map(d=>({id:d.id,...d.data()}))),roster=[];
  for(const room of classes){const students=await db.collection('attendance_classes/'+room.id+'/students').get();for(const student of students.docs){const s=student.data();if(s.active!==false)roster.push({studentId:student.id,classId:room.id,className:room.name,academicYear:room.academicYear,name:s.name,number:s.number,code:String(s.code||'').trim()});}}
  const rows=parsed.map(p=>M.matchPage(p,roster,table.data.subjects));
  const counts=new Map();for(const row of rows)if(row.match)counts.set(row.code,(counts.get(row.code)||0)+1);for(const row of rows)row.duplicate=Boolean(row.match&&counts.get(row.code)>1);
  if(parsed.reduce((n,p)=>n+p.pdf.length,0)>40*1024*1024)M.fail('แยกแล้วเอกสารใหญ่เกิน 40 MB กรุณาลดขนาด PDF');
  await db.runTransaction(async tx=>{const [live,old]=await Promise.all([tx.get(db.doc('school_users/'+actor.uid)),tx.get(target)]);M.requireFaculty(request.auth,live.data());if(old.exists&&old.data().hash!==digest)M.fail('รหัสนำเข้าเดิมใช้กับไฟล์อื่นแล้ว','already-exists');if(!old.exists)tx.create(target,{hash:digest,name:input.name.replace(/[\x00-\x1f]/g,''),year:Number(periods[0].split('_')[0]),term:Number(periods[0].split('_')[1]),kind:input.kind,pageCount:rows.length,matched:rows.filter(r=>r.ready).length,status:'staging',uploadedBy:actor.uid,uploadedName:actor.name,createdAt:stamp()});});
  await storeFile('batches/'+batchId+'/original.pdf',bytes);
  for(let i=0;i<parsed.length;i++)await storeFile('batches/'+batchId+'/pages/'+parsed[i].page+'.pdf',parsed[i].pdf);
  await faculty(request);const write=db.batch();for(const row of rows)write.set(target.collection('pages').doc(String(row.page)),clean(row));write.update(target,{status:'draft',completedAt:stamp()});await write.commit();
  return {batchId,pageCount:rows.length,matched:rows.filter(r=>r.ready).length};
 }
 async function publish(request,input,actor){
  if(!M.id(input.requestId)||input.reviewed!==true||typeof input.replaceExisting!=='boolean')M.fail('กรุณาตรวจต้นฉบับ รายชื่อ และตารางคะแนนก่อนยืนยัน');
  const batch=await getBatch(input.batchId),all=await pagesOf(input.batchId),rows=M.selectedPages(all,input.pages),names=M.validateNames(input.subjectNames,all);
  const signature=M.hash(JSON.stringify([input.batchId,[...input.pages].sort((a,b)=>a-b),names,input.replaceExisting])),operation=db.doc('school_grade_operations/'+M.hash(actor.uid+':'+input.requestId));
  return db.runTransaction(async tx=>{
   const [live,current,oldOperation]=await Promise.all([tx.get(db.doc('school_users/'+actor.uid)),tx.get(ref(input.batchId)),tx.get(operation)]);M.requireFaculty(request.auth,live.data());
   if(oldOperation.exists){if(oldOperation.data().signature!==signature)M.fail('รหัสยืนยันซ้ำกับข้อมูลอื่น','already-exists');return {count:oldOperation.data().count,replayed:true};}
   if(current.data()?.status!=='draft')M.fail('ชุดเอกสารนี้ไม่ได้อยู่ในสถานะรอเผยแพร่','failed-precondition');
   const entries=await Promise.all(rows.map(async row=>{const report=db.doc('school_grade_students/'+M.hash(row.code)+'/reports/'+batch.year+'_'+batch.term+'_'+batch.kind),student=await tx.get(db.doc('attendance_classes/'+row.match.classId+'/students/'+row.match.studentId)),room=await tx.get(db.doc('attendance_classes/'+row.match.classId)),prior=await tx.get(report);return {row,report,student,room,prior};}));
   for(const {row,student,room,prior}of entries){const s=student.data(),r=room.data(),parts=M.roomParts(r?.name);if(!student.exists||s.active===false||!r?.active||String(s.code).trim()!==row.code||M.personName(s.name)!==M.personName(row.match.name)||Number(s.number)!==row.number||parts?.level!==row.level||parts?.room!==row.room||r.academicYear!==row.year)M.fail('ทะเบียนเปลี่ยนแปลง กรุณานำเข้าและตรวจรายชื่อใหม่','aborted');if(prior.exists&&prior.data().published&&!input.replaceExisting)M.fail('มีผลการเรียนเดิมในปี/ภาค/ประเภทนี้แล้ว กรุณายืนยันการแทนที่','already-exists');}
   for(const {row,report,prior,student}of entries){const data={year:batch.year,term:batch.term,kind:batch.kind,batchId:input.batchId,page:row.page,studentId:row.match.studentId,classId:row.match.classId,code:row.code,ownerKey:M.ownerKey(row.code,student.data().name),className:row.match.className,published:true,publishedAt:stamp(),publishedBy:actor.uid,courses:row.courses.map(c=>({...c,name:names[c.code]||c.name})),gpa:row.gpa,cumulativeGpa:row.cumulativeGpa};tx.set(report,data);tx.create(db.collection('school_grade_audit').doc(),{action:'publish',uid:actor.uid,batchId:input.batchId,report:report.path,previousBatchId:prior.data()?.batchId||null,createdAt:stamp()});}
   tx.update(ref(input.batchId),{status:'published',publishedPages:rows.map(r=>r.page),publishedAt:stamp(),publishedBy:actor.uid});tx.create(operation,{signature,count:rows.length,createdAt:stamp()});return {count:rows.length};
  });
 }
 async function handle(request){
  const input=request.data||{};validate(input);const actor=await faculty(request);
  if(input.method==='gradeUpload')return upload(request,input,actor);
  if(input.method==='gradeList'){const snap=await db.collection('school_grade_batches').orderBy('createdAt','desc').limit(30).get();return {batches:snap.docs.map(d=>({id:d.id,...d.data(),createdAt:d.data().createdAt?.toDate?.().toISOString()||''})).map(({hash,...v})=>v)};}
  if(input.method==='gradeDetail'){const batch=await getBatch(input.batchId),pages=await pagesOf(input.batchId);return {batch:{id:input.batchId,name:batch.name,status:batch.status,year:batch.year,term:batch.term,kind:batch.kind,publishedPages:batch.publishedPages||[]},pages};}
  if(input.method==='gradePreview'){const batch=await getBatch(input.batchId);if(!Number.isInteger(input.page)||input.page<1||input.page>batch.pageCount)M.fail('หน้าเอกสารไม่ถูกต้อง');const [bytes]=await bucket.file('batches/'+input.batchId+'/pages/'+input.page+'.pdf').download();await faculty(request);return {base64:bytes.toString('base64')};}
  if(input.method==='gradePublish')return publish(request,input,actor);
  if(input.method==='gradeWithdraw'){
   if(!M.id(input.requestId))M.fail('รหัสรายการไม่ถูกต้อง');const batch=await getBatch(input.batchId),pages=await pagesOf(input.batchId);
   return db.runTransaction(async tx=>{const live=await tx.get(db.doc('school_users/'+actor.uid));M.requireFaculty(request.auth,live.data());const reports=await Promise.all(pages.filter(p=>p.match).map(async p=>{const target=db.doc('school_grade_students/'+M.hash(p.code)+'/reports/'+batch.year+'_'+batch.term+'_'+batch.kind);return {target,snap:await tx.get(target)};}));let count=0;for(const {target,snap}of reports)if(snap.data()?.batchId===input.batchId&&snap.data().published){tx.update(target,{published:false,withdrawnAt:stamp(),withdrawnBy:actor.uid});count++;}tx.update(ref(input.batchId),{status:'withdrawn',withdrawnAt:stamp()});tx.create(db.collection('school_grade_audit').doc(),{action:'withdraw',uid:actor.uid,batchId:input.batchId,count,createdAt:stamp()});return {count};});
  }
 }
 return {handle};
}
module.exports={service,BUCKET};
