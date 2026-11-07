'use strict';
const {PDFDocument,PDFName}=require('pdf-lib');
const fail=message=>{throw Object.assign(Error(message),{code:'invalid-argument'});};
const digits=s=>String(s||'').replace(/[๐-๙]/g,c=>String(c.charCodeAt(0)-0x0e50));
function linesFor(items){
 const lines=[];
 for(const item of items.filter(i=>i.str?.trim()).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])){
  const y=item.transform[5];let line=lines.find(l=>Math.abs(l.y-y)<2.5);if(!line){line={y,items:[]};lines.push(line);}line.items.push(item);
 }
 return lines.sort((a,b)=>b.y-a.y).map(l=>({...l,items:l.items.sort((a,b)=>a.transform[4]-b.transform[4]),text:l.items.sort((a,b)=>a.transform[4]-b.transform[4]).map(i=>i.str).join(' ')}));
}
function parsePage(items,width,height){
 const lines=linesFor(items),header=lines.filter(l=>l.y>height*.84),text=digits(header.map(l=>l.text).join('\n'));
 const idLine=header.find(l=>/เลขประจ|รหัส(?:นักเรียน|ประจำตัว)/.test(l.text)),codes=idLine?digits(idLine.text).match(/\b\d{3,20}\b/g)||[]:[];
 const code=codes.length===1?codes[0]:'';
 const year=Number(text.match(/\b(25\d{2})\b/)?.[1])||null;
 const term=Number(text.match(/ภาค(?:เรียน|เรรยน)[^\d]*([12])/u)?.[1])||null;
 const level=Number(text.match(/(?:มัธยม|มจธยม)[^\d]*([1-6])/u)?.[1])||null;
 const room=Number(text.match(/(?:ห้อง|หหอง)\s*(\d{1,2})/u)?.[1])||null;
 const number=Number(text.match(/(?:เลขที่|เลขทรท)\s*(\d{1,3})/u)?.[1])||null;
 const label=idLine?.items.find(i=>/เลขประจ|รหัส/.test(i.str));
 const rawName=idLine?idLine.items.filter(i=>(!label||i.transform[4]<label.transform[4])&&!/^(ชื่อ|ชชทอ|นามสกุล|นามสกกล)$/.test(i.str.trim())).map(i=>i.str).join(' ').trim():'';
 const columns={};
 const names={credits:/^(หน่วย|หนนวย)$/,maximum:/^(เต็ม|เตตม)$/,score:/^(ได้|ไดผ)$/,grade:/^(ปกติ|ปกตว)$/,retake:/^(แก้ตัว|แกผตสว)$/,attributes:/^(คุณ|คคณ)$/,analysis:/^(คิด|ควด)$/};
 for(const [key,pattern]of Object.entries(names)){
  const candidate=items.filter(i=>pattern.test(i.str.trim())&&i.transform[5]<height*.88&&i.transform[5]>height*.7).sort((a,b)=>b.transform[5]-a.transform[5])[0];
  if(candidate)columns[key]=candidate.transform[4]+candidate.width/2;
 }
 const numeric=(row,key)=>{if(columns[key]===undefined)return '';const cell=row.items.filter(i=>Math.abs((i.transform[4]+i.width/2)-columns[key])<11).sort((a,b)=>Math.abs((a.transform[4]+a.width/2)-columns[key])-Math.abs((b.transform[4]+b.width/2)-columns[key]))[0];return digits(cell?.str||'').trim();};
 const value=text=>!text||text==='-'?null:/^\d+(?:\.\d+)?$/.test(text)?Number(text):text;
 const courses=[];
 for(const line of lines){
  const left=line.items.filter(i=>i.transform[4]<width*.125).map(i=>i.str).join('').replace(/\s/g,'');
  const match=digits(left).match(/^([ก-ฮ]\d{5})$/u);if(!match)continue;
  const rawSubject=line.items.filter(i=>i.transform[4]>=width*.125&&i.transform[4]<width*.405).map(i=>i.str).join(' ').trim();
  const course={code:match[1],name:rawSubject,rawName:rawSubject,group:match[1].startsWith('ก')?'activity':match[1][3]==='2'?'additional':'basic'};
  for(const key of ['credits','maximum','score','grade','retake','attributes','analysis'])course[key]=value(numeric(line,key));
  course.needsReview=columns.credits===undefined||columns.score===undefined||columns.grade===undefined||course.credits===null||course.grade===null||course.score===null||['credits','maximum','score','attributes','analysis'].some(k=>course[k]!==null&&(typeof course[k]!=='number'||course[k]<0||course[k]>10000));
  if(course.maximum!==null&&typeof course.maximum==='number'&&typeof course.score==='number'&&course.score>course.maximum)course.needsReview=true;
  if(typeof course.grade==='number'?(course.grade<0||course.grade>4||course.grade*2!==Math.round(course.grade*2)):!['ผ','มผ','ร','มส','ขร','ขส','มก','รอ'].includes(course.grade))course.needsReview=true;
  courses.push(course);
 }
 const gpaLine=lines.find(l=>/GPA/.test(l.text)),gpaValues=gpaLine?.items.map(i=>digits(i.str.trim())).filter(s=>/^\d\.\d{1,2}$/.test(s)).map(Number)||[];
 return {code,rawName,year,term,level,room,number,className:level&&room?'ม.'+level+'/'+room:'',kind:/ปลายภาค/.test(text)?'final':/กลางภาค/.test(text)?'midterm':'',courses,gpa:gpaValues[0]??null,cumulativeGpa:gpaValues[1]??null,identityReady:Boolean(code&&year&&term&&level&&room&&number),tableReady:courses.length>0&&new Set(courses.map(c=>c.code)).size===courses.length&&courses.every(c=>!c.needsReview)};
}
async function splitAndParse(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<8||bytes.length>6*1024*1024||!bytes.subarray(0,1024).includes(Buffer.from('%PDF-')))fail('เลือกไฟล์ PDF ขนาดไม่เกิน 6 MB');
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
 const task=pdfjs.getDocument({data:Uint8Array.from(bytes),isEvalSupported:false,useSystemFonts:false,disableFontFace:true});
 let source,document;
 try{
  source=await task.promise;if(source.numPages<1||source.numPages>100)fail('รองรับ PDF ครั้งละ 1–100 หน้า');
  document=await PDFDocument.load(bytes,{updateMetadata:false});if(document.getPageCount()!==source.numPages)fail('โครงสร้างหน้าของ PDF ไม่ตรงกัน');
  const pages=[];
  for(let index=0;index<source.numPages;index++){
   const page=await source.getPage(index+1),viewport=page.getViewport({scale:1}),content=await page.getTextContent();
   const parsed=parsePage(content.items,viewport.width,viewport.height);
   const original=document.getPage(index);for(const key of ['Annots','AA','Metadata','PieceInfo'])original.node.delete(PDFName.of(key));
   const single=await PDFDocument.create(),[copy]=await single.copyPages(document,[index]);single.addPage(copy);single.setTitle('รายงานผลการเรียนรายบุคคล');single.setProducer('School Portal');single.setCreationDate(new Date(0));single.setModificationDate(new Date(0));
   const pdf=Buffer.from(await single.save({useObjectStreams:true}));if(pdf.length>6*1024*1024)fail('เอกสารรายบุคคลใหญ่เกิน 6 MB');
   pages.push({page:index+1,...parsed,pdf});
  }
  return pages;
 }catch(error){if(error.code)throw error;fail('อ่าน PDF ไม่ได้ กรุณาใช้ไฟล์ที่ไม่ติดรหัสผ่านและเลือกคัดลอกข้อความได้');}
 finally{if(source)await source.destroy();else await task.destroy();}
}
module.exports={linesFor,parsePage,splitAndParse,digits};
