'use strict';
const {createHash}=require('node:crypto');
const hash=s=>createHash('sha256').update(s).digest('hex');
const personName=s=>String(s||'').normalize('NFKC').replace(/\s/g,'').replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.)/,'');
const ownerKey=(code,name)=>hash(JSON.stringify([code,personName(name)]));
const fail=(message,code='invalid-argument')=>{throw Object.assign(Error(message),{code});};
const id=s=>typeof s==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(s);
function requireFaculty(auth,p){
 if(!auth?.uid||auth.token?.email_verified!==true||auth.token?.firebase?.sign_in_provider!=='google.com')fail('กรุณาเข้าสู่ระบบฝ่ายวิชาการ','unauthenticated');
 if(!p?.active||!(p.schoolRole?['admin','deputy','timetable'].includes(p.schoolRole):p.identityAdmin===true||p.timetableRole==='academic'))fail('เฉพาะผู้ดูแลและครูฝ่ายวิชาการที่ได้รับสิทธิ์','permission-denied');
 return {uid:auth.uid,name:p.name||auth.token.name||'ฝ่ายวิชาการ'};
}
const roomParts=name=>{const m=String(name||'').replace(/\s/g,'').match(/(?:ม\.?|มัธยมศึกษาปีที่)([1-6])[\/-](\d+)/u);return m?{level:Number(m[1]),room:Number(m[2])}:null;};
function resolveCourses(courses,subjects){
 return courses.map(c=>{const names=[...new Set((subjects||[]).filter(s=>String(s.code||'').replace(/\s/g,'')===c.code).map(s=>String(s.name||'').trim()).filter(Boolean))];return {...c,name:names.length===1?names[0]:c.name,nameSource:names.length===1?'catalog':c.nameSource||'pdf'};});
}
function matchPage(page,roster,subjects){
 const matches=roster.filter(s=>s.code===page.code);
 const row={...page};delete row.pdf;
 row.match=null;row.problem='';
 if(!page.identityReady)row.problem='อ่านรหัส ปี ภาค ห้อง หรือเลขที่ไม่ครบ';
 else if(matches.length!==1)row.problem=matches.length?'รหัสนี้ซ้ำในทะเบียนปัจจุบัน':'ไม่พบรหัสนี้ในทะเบียนปัจจุบัน';
 else{
  const student=matches[0],room=roomParts(student.className);
  if(!room||room.level!==page.level||room.room!==page.room||Number(student.number)!==page.number||Number(student.academicYear)!==page.year)row.problem='ห้อง เลขที่ หรือปีการศึกษาไม่ตรงกับทะเบียน';
  else row.match={studentId:student.studentId,classId:student.classId,name:student.name,code:student.code,className:student.className,number:student.number};
 }
 row.courses=resolveCourses(page.courses,subjects);
 if(!page.tableReady)row.problem+=(row.problem?' · ':'')+'ตารางคะแนนอ่านไม่ครบ';
 row.ready=Boolean(row.match&&page.tableReady);return row;
}
function validateNames(names,pages){
 if(!names||typeof names!=='object'||Array.isArray(names)||Object.keys(names).length>300)fail('รายชื่อวิชาไม่ถูกต้อง');
 const codes=new Set(pages.flatMap(p=>p.courses.map(c=>c.code))),clean={};
 for(const [code,name]of Object.entries(names)){if(!codes.has(code)||typeof name!=='string'||!name.trim()||name.length>150)fail('ชื่อวิชาต้องตรงกับรหัสที่อ่านจาก PDF และยาวไม่เกิน 150 ตัวอักษร');clean[code]=name.trim();}
 return clean;
}
function selectedPages(pages,selected){
 if(!Array.isArray(selected)||!selected.length||selected.length>100||new Set(selected).size!==selected.length||selected.some(n=>!Number.isInteger(n)))fail('เลือกหน้าเอกสาร 1–100 หน้าโดยไม่ซ้ำ');
 const rows=selected.map(n=>pages.find(p=>p.page===n));if(rows.some(p=>!p?.ready||!p.match))fail('มีหน้าที่ยังจับคู่หรืออ่านคะแนนไม่ครบ ไม่สามารถเผยแพร่');
 if(new Set(rows.map(p=>p.code)).size!==rows.length)fail('เลือกได้เพียงหนึ่งหน้าต่อรหัสนักเรียนในชุดนี้');return rows;
}
module.exports={resolveCourses,hash,personName,ownerKey,fail,id,requireFaculty,roomParts,matchPage,validateNames,selectedPages};
