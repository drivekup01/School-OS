'use strict';
const {fail,validateCase}=require('./remedial-model');
function lines(items){const rows=[];for(const item of items){if(!item.str?.trim())continue;const y=item.transform[5],x=item.transform[4];let row=rows.find(r=>Math.abs(r.y-y)<2.5);if(!row){row={y,items:[]};rows.push(row);}row.items.push({s:item.str.trim(),x});}return rows.sort((a,b)=>b.y-a.y).map(r=>({...r,items:r.items.sort((a,b)=>a.x-b.x)}));}
function parsePage(items,width,page,context={}){
 const scale=595/width,rows=[],text=(row,a,b,sep=' ')=>row.items.filter(i=>i.x*scale>=a&&i.x*scale<b).map(i=>i.s).join(sep).trim();let student=context.student,room=context.room,last=null,lastY=0;
 for(const line of lines(items)){
  const full=text(line,0,595),numbers=full.match(/\d+/g)||[];
  if(/ช.*(?:ม.*ธยม)/.test(full)&&/ห.*อง/.test(full)&&numbers.length===2){room={level:Number(numbers[0]),room:Number(numbers[1])};student=null;last=null;continue;}
  if(text(line,423,448)==='เกรด'){last=null;continue;}
  const code=text(line,72,101,'').match(/^\d{1,20}$/),period=text(line,198,236,'').match(/(25\d{2})\/([12])/);
  if(code){student={code:code[0],rawStudentName:text(line,101,198),year:period?Number(period[1]):null,term:period?Number(period[2]):null,number:Number(text(line,47,72))||null};}
  const course=text(line,236,266,'').match(/^([ก-ฮ]\d{5})$/),grade=text(line,423,448,'').replace(/\s/g,'');
  if(course){const row={row:0,page,code:student?.code||'',rawStudentName:student?.rawStudentName||'',number:student?.number||null,year:student?.year||null,term:student?.term||null,originalClassName:room?'ม.'+room.level+'/'+room.room:'',courseCode:course[1],courseName:text(line,266,397),rawTeacherName:text(line,448,575),originalGrade:grade,credits:Number(text(line,397,423)),problem:''};try{validateCase(row);}catch(e){row.problem=e.message;}rows.push(row);last=row;lastY=line.y;}
  else if(last&&lastY-line.y<25&&lastY-line.y>3){const continuation=text(line,236,397);if(continuation&&!/\.{3}|ลงช/.test(continuation)){last.courseName+=' '+continuation;lastY=line.y;}}
 }
 return {rows,context:{student,room}};
}
async function parse(bytes){if(!Buffer.isBuffer(bytes)||bytes.length>6*1024*1024||!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))fail('ใช้ PDF ขนาดไม่เกิน 6 MB');const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs'),task=pdfjs.getDocument({data:Uint8Array.from(bytes),isEvalSupported:false,useSystemFonts:false,disableFontFace:true});let doc;try{doc=await task.promise;if(doc.numPages>100)fail('รองรับ PDF ไม่เกิน 100 หน้า');let rows=[],context={};for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i),content=await page.getTextContent(),result=parsePage(content.items,page.getViewport({scale:1}).width,i,context);rows.push(...result.rows);context=result.context;}if(!rows.length||rows.length>1000)fail('ไม่พบตารางรูปแบบที่รองรับ หรือเกิน 1,000 รายการ กรุณาแยกไฟล์ตามห้อง/ปี');return rows.map((r,i)=>({...r,row:i+1}));}catch(e){if(e.code)throw e;fail('อ่าน PDF ไม่สำเร็จ กรุณาใช้ไฟล์ที่เลือกคัดลอกข้อความได้และไม่ติดรหัสผ่าน');}finally{if(doc)await doc.destroy();else await task.destroy();}}
module.exports={parse,parsePage};
