window.schoolExportLibraries={};window.schoolLoadExportLibrary=function(kind){var key=kind==='canvas'?'html2canvas':'docx';if(window[key])return Promise.resolve(window[key]);if(window.schoolExportLibraries[kind])return window.schoolExportLibraries[kind];return window.schoolExportLibraries[kind]=new Promise(function(resolve,reject){var script=document.createElement('script');script.src='https://drivekup01.github.io/School-OS/'+(kind==='canvas'?'vendor/html2canvas.min.js':'vendor/docx.min.js')+'?v=20261030-unified1';script.onload=function(){resolve(window[key]);};script.onerror=function(){delete window.schoolExportLibraries[kind];script.remove();reject(Error('โหลดเครื่องมือส่งออกไม่สำเร็จ กรุณาลองใหม่'));};document.head.append(script);});};
async function exportTeacherViewPng(){
 const teacher=DB.teachers.find(t=>t.id===_tvCurrentTeacherId);
 if(!teacher){toast('กรุณาเลือกครูก่อน','warn');return;}
 if(typeof html2canvas==='undefined'){toast('ระบบสร้าง PNG ยังไม่พร้อม','warn');return;}
 const name=TeacherSchedule.name(teacher),e=TeacherSchedule.escape;
 const wrap=document.createElement('div');
 wrap.className='teacher-png-export';
 wrap.style.cssText='position:fixed;left:-20000px;top:0;background:#fff;padding:26px 28px;box-sizing:border-box;font-family:Sarabun,sans-serif;color:#1a2a44;z-index:-1;width:'+Math.max(1500,120+DB.slots.length*118+56)+'px;';
 try{
  const logo=await getRequiredExportLogo();
  wrap.innerHTML=`<div style="text-align:center;margin-bottom:14px"><img alt="ตราโรงเรียน" src="${e(logo)}" style="width:60px;height:60px;object-fit:contain"><div style="font-size:20px;font-weight:700;margin:6px 0">ตารางสอน</div><div style="font-size:16px;font-weight:700">${e(name)}</div>${teacher.rank?`<div style="font-size:12px">${e(teacher.rank+(teacher.dept?' กลุ่มสาระ'+teacher.dept:''))}</div>`:''}<div style="font-size:15px;font-weight:700">โรงเรียน${e(DB.school.name)}</div><div style="font-size:13px">ภาคเรียนที่ ${e(DB.school.semester)} ปีการศึกษา ${e(DB.school.year)}</div></div>${buildTeacherViewTable(name)}`;
  wrap.querySelector('.teacher-view-wrap').style.overflow='visible';
  wrap.querySelectorAll('[style*="sticky"]').forEach(el=>el.style.position='static');
  document.body.append(wrap);
  await document.fonts.ready;
  await Promise.all([...wrap.querySelectorAll('img')].map(img=>img.decode()));
  const canvas=await html2canvas(wrap,{scale:2,useCORS:true,backgroundColor:'#fff',logging:false});
  _downloadCanvasPng(canvas,('ตารางสอน_'+name+'_ปี'+DB.school.year+'.png').replace(/[\\/]/g,'-'));
  toast('ดาวน์โหลด PNG ตารางสอนเรียบร้อยแล้ว','succ');
 }catch(error){toast('ส่งออก PNG ไม่สำเร็จ: '+error.message,'warn');}finally{wrap.remove();}
}

;
(function(){
 'use strict';
 const read=key=>{try{return sessionStorage.getItem(key)||'';}catch(e){return '';}};
 const initialPage=read('school_os_current_page');
 window.schoolRestorePage=function(){
  const page=window.schoolRequestedPage||initialPage;
  if(!page||!document.getElementById('page-'+page)||!canAccessPage(page))return;
  const room=read('school_os_builder_room');
  if(room&&DB.rooms.some(r=>r.id===room))currentBuilderRoom=room;
  nav(page);
 };
 window.schoolRememberBuilderRoom=function(room){try{sessionStorage.setItem('school_os_builder_room',room||'');}catch(e){}};
})();

function mountSchoolHomeButton(sidebar){
 if(!sidebar)return;
 sidebar.querySelectorAll('a.back-school,a[data-view="home"]').forEach(a=>a.remove());
 document.querySelectorAll('.school-portal-link').forEach(a=>a.remove());
 const area=document.createElement('div');area.className='school-home-area';
 const link=document.createElement('a');link.className='school-home-button';link.href='https://drivekup01.github.io/School-Portal/';link.target='_top';link.innerHTML='<span aria-hidden="true">←</span><span>หน้าหลักโรงเรียน</span>';link.setAttribute('aria-label','กลับหน้าหลักโรงเรียน');area.append(link);
 const bottom=sidebar.querySelector('.sidebar-bottom');if(bottom)bottom.prepend(area);else sidebar.append(area);
 const style=document.createElement('style');style.textContent=`
 .school-home-area{margin-top:auto;padding:16px 12px;flex-shrink:0;box-sizing:border-box}
 .sidebar-bottom>.school-home-area{margin:0;padding:0 0 16px}
 a.school-home-button{display:flex!important;align-items:center;justify-content:flex-start;gap:10px;box-sizing:border-box;min-height:44px;width:100%;padding:11px 14px!important;border:1px solid #ffffff30!important;border-radius:10px!important;background:#ffffff0c!important;color:#f0e5fa!important;font:13px/1.5 'IBM Plex Sans Thai',Tahoma,sans-serif!important;text-decoration:none!important;white-space:nowrap}
 a.school-home-button:hover{background:#ffffff20!important}a.school-home-button:focus-visible{outline:3px solid #cda4ed;outline-offset:3px}
 #budgetSidebar>.school-account{margin-top:0!important}.sidebar-collapsed .school-home-area{padding:10px 7px}.sidebar-collapsed .school-home-button{padding:10px!important;justify-content:center}.sidebar-collapsed .school-home-button span+span{display:none}
 @media(max-width:820px){body>.school-home-area{position:fixed;left:14px;bottom:84px;width:190px;z-index:45;padding:0}body>.school-home-area a.school-home-button{background:#472468!important;box-shadow:0 4px 14px #29174325}}
 @media print{.school-home-area{display:none!important}}`;
 document.head.append(style);
 const media=matchMedia('(max-width:820px)');function position(){if(media.matches)document.body.append(area);else if(bottom)bottom.prepend(area);else sidebar.insertBefore(area,sidebar.querySelector(':scope>.school-account'));}position();media.addEventListener('change',position);
}

document.addEventListener('DOMContentLoaded',()=>mountSchoolHomeButton(document.querySelector('.sidebar')),{once:true});

;
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.StudentSignatures=factory();})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const roles=[['Deputy','รองผู้อำนวยการ'],['Principal','ผู้อำนวยการ']],limit=160000;
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function png(value){return typeof value==='string'&&value.length<=limit&&/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/.test(value)?value:'';}
function size(image){try{const bytes=Uint8Array.from(atob(image.split(',')[1]),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer),w=view.getUint32(16),h=view.getUint32(20),scale=Math.min(160/w,46/h);if(w&&h)return {width:Math.round(w*scale),height:Math.round(h*scale)};}catch{}return {width:160,height:46};}
function signers(school={}){return roles.map(([key,title])=>({key,name:school['student'+key+'Name']||'',position:school['student'+key+'Position']||title,image:png(school['student'+key+'Signature'])}));}
function html(school){return '<div class="student-signatures" style="margin-top:16px;display:flex;justify-content:flex-end;gap:24px;padding:10px;flex-wrap:wrap">'+signers(school).map(s=>'<div style="text-align:center;width:220px;break-inside:avoid"><div style="height:48px;display:flex;align-items:center;justify-content:center">'+(s.image?'<img src="'+s.image+'" alt="ลายเซ็น'+escape(s.position)+'" style="max-width:160px;max-height:46px;object-fit:contain">':'')+'</div><div style="border-bottom:1px solid #888;width:190px;margin:0 auto 5px"></div><div style="font-weight:700;font-size:13px">('+escape(s.name||'..............................')+')</div><div style="font-size:12px;color:#5a6a80">'+escape(s.position)+'</div></div>').join('')+'</div>';}
let draft={},busy=0,revision=0,uploads={};
function paint(key,doc){const image=doc.getElementById('student'+key+'Preview'),remove=doc.getElementById('student'+key+'Remove');if(image){image.src=draft[key]||'';image.hidden=!draft[key];image.style.display=draft[key]?'inline-block':'none';}if(remove){remove.hidden=!draft[key];remove.style.display=draft[key]?'inline-flex':'none';}}
function fill(school,doc=document){revision++;draft={};uploads={};for(const s of signers(school)){for(const [field,value]of [['Name',s.name],['Position',s.position]]){const input=doc.getElementById('student'+s.key+field);if(input)input.value=value;}draft[s.key]=s.image;const file=doc.getElementById('student'+s.key+'File');if(file)file.value='';paint(s.key,doc);}}
async function readImage(file){if(!file||file.size>5*1024*1024)throw Error('กรุณาเลือกไฟล์ PNG หรือ JPG ขนาดไม่เกิน 5 MB');const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());const isPNG=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),isJPEG=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if(!isPNG&&!isJPEG)throw Error('รองรับเฉพาะไฟล์ PNG หรือ JPG');const bitmap=await createImageBitmap(file);try{if(!bitmap.width||!bitmap.height)throw Error('รูปภาพไม่ถูกต้อง');const canvas=document.createElement('canvas');let scale=Math.min(1,600/bitmap.width,200/bitmap.height);for(let attempt=0;attempt<4;attempt++){canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/png');if(png(data))return data;scale*=.7;}throw Error('รูปภาพใหญ่เกินไป กรุณาครอบภาพให้เหลือเฉพาะลายเซ็น');}finally{bitmap.close();}}
async function upload(key,input){if(!roles.some(r=>r[0]===key)||!input.files?.[0])return;const epoch=revision,sequence=(uploads[key]||0)+1;uploads[key]=sequence;busy++;try{const data=await readImage(input.files[0]);if(epoch!==revision||sequence!==uploads[key])return;draft[key]=data;paint(key,document);window.toast?.('เตรียมลายเซ็นแล้ว กดบันทึกข้อมูลโรงเรียนเพื่อบันทึก','info');}catch(e){window.toast?.(e.message,'warn');}finally{input.value='';busy--;}}
function remove(key){uploads[key]=(uploads[key]||0)+1;draft[key]='';paint(key,document);}
function values(doc=document){if(busy)throw Error('กรุณารออัปโหลดลายเซ็นให้เสร็จก่อน');const out={};for(const [key,title]of roles){out['student'+key+'Name']=doc.getElementById('student'+key+'Name')?.value.trim()||'';out['student'+key+'Position']=doc.getElementById('student'+key+'Position')?.value.trim()||title;out['student'+key+'Signature']=png(draft[key]);}return out;}
return {signers,html,png,size,fill,upload,remove,values,readImage};
});

;
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TeacherSchedule=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const name=t=>((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim();
 const subjectNames=['บูรณาการ','ลดเวลาเรียน','ลูกเสือเนตรนารี','ชุมนุม','ประชุมระดับ','ขนมอบยอดนิยม','กฎหมายธุรกิจ','หลักการตลาด','เทคนิคการนำเสนอ','เทคนิค ม.4','เทคนิค ม.5','ติวonet','PLC'];
 const normalizeSubject=value=>String(value||'').toLowerCase().replace(/[\s/–—-]/g,'');
 function subjects(db){return subjectNames.map((label,i)=>{const existing=db.subjects.find(s=>normalizeSubject(s.name)===normalizeSubject(label));return {...existing,id:existing?.id||'teacher-independent-'+String([1,2,3,4,5,6,7,8,9,12,13,11,14][i]).padStart(2,'0'),name:label};});}
 function studentSlots(db){return db.slots.filter(s=>!s.teacherOnly);}
 function setSlotTeacherOnly(db,slotId,value){
  const slot=db.slots.find(s=>String(s.id)===String(slotId));if(!slot)throw Error('ไม่พบคาบเรียน');
  if(value&&slot.isBreak)throw Error('คาบพักไม่สามารถเป็นคาบเฉพาะครูได้');
  if(value&&db.rooms.some(r=>db.days.some(d=>db.sched[r.id+'_'+slot.id+'_'+d]?.subject)))throw Error('คาบนี้มีตารางนักเรียนอยู่แล้ว กรุณาย้ายหรือลบวิชาของห้องเรียนในคาบนี้ก่อน');
  slot.teacherOnly=!!value;
 }
 const key=(teacherId,slotId,day)=>JSON.stringify([teacherId,String(slotId),day]);
 function activities(db,teacherName,slotId,day){return Object.entries(db.teacherSched||{}).flatMap(([id,v])=>{
  const teacher=db.teachers.find(t=>t.id===v.teacherId),slot=db.slots.find(s=>String(s.id)===String(v.slotId));
  if(!teacher||!slot||slot.isBreak||!db.days.includes(v.day)||(teacherName&&name(teacher)!==teacherName)||(slotId!=null&&String(v.slotId)!==String(slotId))||(day&&v.day!==day))return [];
  const subject=db.subjects.find(s=>s.id===v.subjectId);
  return [{...v,key:id,teacher:name(teacher),subject:subject?.name||v.subject,roomId:null,roomLabel:'เลือกวิชา'}];
 });}
 function roomLessons(db,teacherName,slotId,day){return db.rooms.flatMap(room=>{const cellKey=room.id+'_'+slotId+'_'+day,cv=db.sched[cellKey];return cv?.subject&&[cv.teacher,cv.teacher2,cv.teacher3].includes(teacherName)?[{cv,room,cellKey}]:[];});}
 function set(db,{teacherId,slotId,day,subjectId}){
  const teacher=db.teachers.find(t=>t.id===teacherId),slot=db.slots.find(s=>String(s.id)===String(slotId));
  if(!teacher||!slot||slot.isBreak||!db.days.includes(day))throw Error('ครู วัน หรือคาบไม่ถูกต้อง');
  const id=key(teacherId,slotId,day);db.teacherSched||={};
  if(!subjectId){delete db.teacherSched[id];return;}
  const subject=db.subjects.find(s=>s.id===subjectId)||subjects(db).find(s=>s.id===subjectId);if(!subject)throw Error('ไม่พบรายวิชา');
  if(roomLessons(db,name(teacher),slotId,day).length)throw Error('ครูมีคาบสอนของห้องเรียนในช่วงนี้แล้ว กรุณาเลือกคาบอื่น');
  db.teacherSched[id]={teacherId,slotId:String(slotId),day,subjectId,subject:subject.name};
 }
 function prune(db){if(!db.teacherSched)return;for(const [id,v]of Object.entries(db.teacherSched)){if(!db.teachers.some(t=>t.id===v.teacherId)||!db.slots.some(s=>String(s.id)===String(v.slotId)&&!s.isBreak)||!db.days.includes(v.day))delete db.teacherSched[id];}}
 function learnRoom(db,cell,roomId){
  const override=String(cell?.learnRoom||'').trim();if(override)return override;
  let room=roomId?db.rooms.find(r=>r.id===roomId):null;
  if(!room&&cell){const entry=Object.entries(db.sched).find(([,v])=>v===cell);if(entry)room=db.rooms.find(r=>entry[0].startsWith(r.id+'_'));}
  return String(room?.baseRoom||'').trim();
 }
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return {studentSlots,setSlotTeacherOnly,subjects,name,key,activities,roomLessons,set,prune,learnRoom,escape};
});

;
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./teacher-schedule-core'));else root.TeacherPrint=factory(root.TeacherSchedule);})(typeof globalThis==='object'?globalThis:this,function(T){
 'use strict';
 const e=T.escape;
 function pages(db,teachers,options={}){
  if(!teachers.length||!db.days.length||!db.slots.length)throw Error('ยังไม่มีข้อมูลครู วัน หรือคาบสอนสำหรับพิมพ์');
  return teachers.map((teacher,index)=>{
   const name=T.name(teacher),school=db.school||{};
   const logo=options.logo?'<img class="teacher-print-logo" src="'+e(options.logo)+'" alt="ตราโรงเรียน">':'';
   const rank=teacher.rank?'<p class="teacher-print-rank">'+e(teacher.rank+(teacher.dept?'  กลุ่มสาระ'+teacher.dept:''))+'</p>':'';
   const breaks=db.slots.filter(s=>s.isBreak).length,normal=db.slots.length-breaks,normalWidth=(15750-1250-breaks*900)/Math.max(1,normal);
   const columns='<colgroup><col style="width:'+1250/15750*100+'%">'+db.slots.map(slot=>'<col style="width:'+(slot.isBreak?900:normalWidth)/15750*100+'%">').join('')+'</colgroup>';
   const head='<tr><th>วัน / คาบ</th>'+db.slots.map(s=>'<th'+(s.isBreak?' class="teacher-print-break"':'')+'>'+e(s.label)+'<small>'+e(s.start)+'–'+e(s.end)+'</small></th>').join('')+'</tr>';
   const rows=db.days.map(day=>'<tr><th>'+e(day)+'</th>'+db.slots.map(slot=>{
    if(slot.isBreak)return '<td class="teacher-print-break">พักเที่ยง</td>';
    const lessons=T.roomLessons(db,name,slot.id,day).map(({cv,room})=>({subject:cv.subject,room:room.label,learnRoom:T.learnRoom(db,cv,room.id)}));
    lessons.push(...T.activities(db,name,slot.id,day).map(a=>({subject:a.subject,room:'เลือกวิชา'})));
    return '<td>'+lessons.map(l=>'<div class="teacher-print-lesson"><strong>'+e(l.subject)+'</strong><small>'+e(l.room)+'</small>'+(l.learnRoom?'<small>ห้อง '+e(l.learnRoom)+'</small>':'')+'</div>').join('')+'</td>';
   }).join('')+'</tr>').join('');
   return '<section class="teacher-print-page" data-teacher-id="'+e(teacher.id)+'"><div class="teacher-print-inner"><header>'+logo+'<h1>ตารางสอน</h1><h2>'+e(name)+'</h2>'+rank+'<p class="teacher-print-school">โรงเรียน'+e(school.name)+'</p><p class="teacher-print-term">ภาคเรียนที่ '+e(school.semester)+'   ปีการศึกษา '+e(school.year)+'</p></header><table>'+columns+'<thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div></section>';
  }).join('');
 }
 const css=`
@page{size:A4 landscape;margin:9.525mm}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:white;color:#1a3a6e;font-family:'TH SarabunPSK','TH Sarabun New','Sarabun',sans-serif;font-size:9pt;line-height:1.1;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.teacher-print-page{width:277mm;height:190mm;margin:0;padding:0;overflow:hidden;break-after:page;page-break-after:always;break-inside:avoid;page-break-inside:avoid;position:relative}
.teacher-print-page:last-child{break-after:auto;page-break-after:auto}.teacher-print-inner{width:277mm;transform-origin:top left}
header{text-align:center;margin:0 0 2.1mm}header p{margin:0}.teacher-print-logo{display:block;width:90px;height:90px;object-fit:contain;margin:0 auto 1mm}h1{font-size:15pt;margin:0 0 .9mm;font-weight:700}h2{font-size:12pt;margin:0 0 .6mm;font-weight:700}.teacher-print-rank{font-size:9pt;color:#4a5568;margin-bottom:.5mm}.teacher-print-school{font-size:11.25pt;font-weight:700;color:#111}.teacher-print-term{font-size:9.75pt;color:#111;margin-top:.5mm}
table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:.2mm solid #c5d3ea;padding:.97mm 1.32mm;text-align:center;vertical-align:middle;overflow-wrap:anywhere}thead th{background:#1a3a6e;color:white;border-color:#1a3a6e;font-size:9pt;font-weight:700}thead small{font-size:7.5pt;color:white}tbody th{background:#eef3ff;font-weight:700;font-size:9pt}.teacher-print-break{background:#fff8e1;color:#e65100;font-weight:700}thead .teacher-print-break{background:#e65100;color:white}small{display:block;font-size:7.5pt;line-height:1.1;color:#666}strong{font-size:8.5pt;font-weight:700;line-height:1.1}.teacher-print-lesson{margin:0 0 .15mm}.teacher-print-lesson:last-child{margin-bottom:0}
`;
 function documentHTML(db,teachers,options={}){return '<!doctype html><html lang="th"><head><meta charset="utf-8"><title>ตารางสอน</title><style>'+css+'</style></head><body>'+pages(db,teachers,options)+'</body></html>';}
 function fit(root){
  return [...root.querySelectorAll('.teacher-print-page')].map(page=>{const inner=page.querySelector('.teacher-print-inner');inner.style.transform='none';const scale=Math.min(1,(page.clientWidth-2)/inner.scrollWidth,(page.clientHeight-3)/inner.scrollHeight);inner.style.transform='scale('+scale+')';return {scale,width:inner.scrollWidth*scale,height:inner.scrollHeight*scale,pageHeight:page.clientHeight};});
 }
 async function printHTML(html){
  const frame=document.createElement('iframe');frame.title='พิมพ์ตารางสอนแนวนอน';frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;left:-20000px;top:0;width:1123px;height:794px;border:0;';
  const loaded=new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=()=>reject(Error('เตรียมหน้าพิมพ์ไม่สำเร็จ'));});frame.srcdoc=html;document.body.appendChild(frame);
  try{await loaded;const doc=frame.contentDocument;for(const face of document.fonts){if(face.status==='loaded')doc.fonts.add(face);}await doc.fonts.ready;await Promise.all([...doc.images].map(img=>img.decode()));fit(doc);await new Promise(resolve=>frame.contentWindow.requestAnimationFrame(resolve));
   const cleanup=()=>{setTimeout(()=>frame.remove(),0);};frame.contentWindow.addEventListener('afterprint',cleanup,{once:true});frame.contentWindow.focus();frame.contentWindow.print();
  }catch(error){frame.remove();throw error;}
 }
 async function print(db,teachers,options={}){return printHTML(documentHTML(db,teachers,options));}
 return {pages,documentHTML,fit,print,printHTML,css};
});

if(typeof document!=='undefined'){const style=document.createElement('style');style.textContent='@media screen{html body.guest-mode #page-teacher-view .tv-header-controls{display:flex!important}html body.guest-mode #tvExportBar:not([style*="display: none"]):not([style*="display:none"]){display:flex!important}}';document.head.appendChild(style);}

;
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./teacher-print'),require('./teacher-schedule-core'));else root.StudentPrint=factory(root.TeacherPrint,root.TeacherSchedule);})(typeof globalThis==='object'?globalThis:this,function(P,T){
'use strict';
function documentHTML(rooms,render){if(!rooms.length)throw Error('กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง');const css=P.css+'\n:root{--pri:#1a3a6e;--muted:#5a6a80}.student-room-print table{width:100%!important}.student-room-print td,.student-room-print th{min-width:0!important;overflow-wrap:anywhere}.student-room-print [style*="overflow:auto"]{overflow:visible!important}.student-room-print .cell-room-tag{display:table;margin:2px auto;padding:1px 4px;font-size:9px;background:#eef3ff;color:#2a5298}.student-room-print .student-signatures{flex-wrap:nowrap!important;margin-top:6px!important}.student-room-print .student-signatures>div{width:220px!important}';return '<!doctype html><html lang="th"><head><meta charset="utf-8"><title>ตารางเรียนนักเรียน</title><style>'+css+'</style></head><body>'+rooms.map(room=>'<section class="teacher-print-page student-room-print" data-room-id="'+T.escape(room.id)+'"><div class="teacher-print-inner">'+render(room)+'</div></section>').join('')+'</body></html>';}
return {documentHTML};
});

;
/* Uses the room builder's table and panel classes; independent periods have no student room. */
var teacherBuilderId='';
function teacherBuilderEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function renderTeacherBuilder(){
 const page=document.getElementById('page-teacher-builder');if(!page)return;
 if(!canAccessPage('teacher-builder')){page.innerHTML='<div class="alert a-warn">เฉพาะฝ่ายวิชาการ</div>';return;}
 if(window.SCHOOL_OS_STORAGE==='firebase'&&(!SCHOOL_ONLINE.isReady()||SCHOOL_ONLINE.isLoading())){page.innerHTML='<div class="alert a-info">กำลังโหลดตารางสอน…</div>';try{await SCHOOL_ONLINE.loadDatabaseOnce();}catch(e){page.innerHTML='<div class="alert a-warn">โหลดข้อมูลไม่ได้ กรุณาเปิดหน้านี้อีกครั้ง</div>';return;}}
 if(!DB.teachers.some(t=>t.id===teacherBuilderId))teacherBuilderId=DB.teachers[0]?.id||'';
 const e=teacherBuilderEscape,teacher=DB.teachers.find(t=>t.id===teacherBuilderId),name=teacher?TeacherSchedule.name(teacher):'';
 page.innerHTML=`<div class="ph builder-page-head"><div class="ph-left"><h1><span class="page-title-icon">🗓️</span> สร้างตารางรายครู</h1><p>เลือกวิชาให้ครู โดยไม่ต้องเลือกห้องนักเรียน</p></div><div class="ph-actions"><button class="btn btn-out btn-sm" id="teacherBuilderView">ดูตารางรายครู</button></div></div><div class="builder-room-panel"><div class="builder-section-title">▣ เลือกครู</div><select id="teacherBuilderSelect" class="teacher-builder-select" aria-label="เลือกครู">${DB.teachers.map(t=>`<option value="${e(t.id)}" ${t.id===teacherBuilderId?'selected':''}>${e(TeacherSchedule.name(t))}</option>`).join('')}</select></div><div class="builder-table-panel"><div class="builder-table-titlebar"><span class="mini-icon">🗓️</span><span>ตารางสอน ${e(name)}</span></div><div class="card builder-grid-card"><div id="teacherBuilderGrid"></div></div></div>`;
 page.querySelector('#teacherBuilderSelect').onchange=event=>{teacherBuilderId=event.target.value;renderTeacherBuilder();};
 page.querySelector('#teacherBuilderView').onclick=()=>{nav('teacher-view');if(teacherBuilderId)renderTeacherViewById(teacherBuilderId);};
 if(currentPage==='teacher-builder')updateInlineBackButton('teacher-builder');
 const grid=page.querySelector('#teacherBuilderGrid');if(!teacher){grid.innerHTML='<div class="empty-state">ยังไม่มีข้อมูลครู</div>';return;}
 const availableSubjects=TeacherSchedule.subjects(DB);
 const head=DB.slots.map(s=>`<th ${s.isBreak?'class="teacher-builder-break"':''}>${e(s.label)}<div class="teacher-builder-time">${e(s.start)}–${e(s.end)}</div></th>`).join('');
 grid.innerHTML=`<div class="sched-wrap"><table class="sched-tbl teacher-builder-table"><thead><tr><th class="th-time">วัน/คาบ</th>${head}</tr></thead><tbody>${DB.days.map((day,di)=>`<tr><td class="td-period">${e(day)}</td>${DB.slots.map(slot=>{
  if(slot.isBreak)return di?'':`<td rowspan="${DB.days.length}" class="builder-break-cell teacher-builder-break">พักเที่ยง</td>`;
  const linked=TeacherSchedule.roomLessons(DB,name,slot.id,day),activity=(DB.teacherSched||{})[TeacherSchedule.key(teacher.id,slot.id,day)],subject=availableSubjects.find(s=>s.id===activity?.subjectId)||DB.subjects.find(s=>s.id===activity?.subjectId);
  return `<td class="teacher-builder-cell" style="background:${e(subject?.color||'#fff')}">${linked.map(m=>`<div class="teacher-builder-linked"><strong>${e(m.cv.subject)}</strong><small>${e(m.room.label)}</small><button class="btn btn-ghost btn-xs" data-room-id="${e(m.room.id)}">แก้ตารางห้องเรียน</button></div>`).join('')}<select class="cell-subj-sel" data-slot="${e(slot.id)}" data-day="${e(day)}" aria-label="วิชาของ ${e(name)} ${e(day)} ${e(slot.label)}" ${linked.length&&!activity?'disabled':''}><option value="">— เลือกวิชา —</option>${activity&&!availableSubjects.some(s=>s.id===activity.subjectId)?`<option value="${e(activity.subjectId)}" selected disabled>${e(activity.subject)} (รายการเดิม)</option>`:''}${availableSubjects.map(s=>`<option value="${e(s.id)}" ${activity?.subjectId===s.id?'selected':''}>${e(s.name)}</option>`).join('')}</select>${activity&&!subject?`<small>${e(activity.subject)} (วิชาถูกนำออกจากรายการแล้ว)</small>`:''}${!linked.length?'<small class="teacher-builder-note">เฉพาะครู · ไม่ผูกห้องนักเรียน</small>':''}</td>`;
 }).join('')}</tr>`).join('')}</tbody></table></div>`;
 grid.querySelectorAll('[data-room-id]').forEach(button=>button.onclick=()=>goToBuilder(button.dataset.roomId));
 grid.querySelectorAll('.cell-subj-sel').forEach(select=>select.onchange=()=>{
  if(!canAccessPage('teacher-builder'))return;
  try{TeacherSchedule.set(DB,{teacherId:teacherBuilderId,slotId:select.dataset.slot,day:select.dataset.day,subjectId:select.value});markDirty();renderTeacherBuilder();updateConflictBadge();}catch(error){toast(error.message,'warn');renderTeacherBuilder();}
 });
}
