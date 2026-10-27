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
 async function print(db,teachers,options={}){
  const frame=document.createElement('iframe');frame.title='พิมพ์ตารางสอนแนวนอน';frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;left:-20000px;top:0;width:1123px;height:794px;border:0;';
  const loaded=new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=()=>reject(Error('เตรียมหน้าพิมพ์ไม่สำเร็จ'));});frame.srcdoc=documentHTML(db,teachers,options);document.body.appendChild(frame);
  try{await loaded;const doc=frame.contentDocument;for(const face of document.fonts){if(face.status==='loaded')doc.fonts.add(face);}await doc.fonts.ready;await Promise.all([...doc.images].map(img=>img.decode()));fit(doc);await new Promise(resolve=>frame.contentWindow.requestAnimationFrame(resolve));
   const cleanup=()=>{setTimeout(()=>frame.remove(),0);};frame.contentWindow.addEventListener('afterprint',cleanup,{once:true});frame.contentWindow.focus();frame.contentWindow.print();
  }catch(error){frame.remove();throw error;}
 }
 return {pages,documentHTML,fit,print,css};
});

if(typeof document!=='undefined'){const style=document.createElement('style');style.textContent='@media screen{html body.guest-mode #page-teacher-view .tv-header-controls{display:flex!important}html body.guest-mode #tvExportBar:not([style*="display: none"]):not([style*="display:none"]){display:flex!important}}';document.head.appendChild(style);}
