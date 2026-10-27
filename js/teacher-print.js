(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./teacher-schedule-core'));else root.TeacherPrint=factory(root.TeacherSchedule);})(typeof globalThis==='object'?globalThis:this,function(T){
 'use strict';
 const e=T.escape;
 function pages(db,teachers){
  if(!teachers.length||!db.days.length||!db.slots.length)throw Error('ยังไม่มีข้อมูลครู วัน หรือคาบสอนสำหรับพิมพ์');
  return teachers.map((teacher,index)=>{
   const name=T.name(teacher),school=db.school||{};
   const head='<tr><th>วัน / คาบ</th>'+db.slots.map(s=>'<th'+(s.isBreak?' class="teacher-print-break"':'')+'>'+e(s.label)+'<small>'+e(s.start)+'–'+e(s.end)+'</small></th>').join('')+'</tr>';
   const rows=db.days.map(day=>'<tr><th>'+e(day)+'</th>'+db.slots.map(slot=>{
    if(slot.isBreak)return '<td class="teacher-print-break">พักเที่ยง</td>';
    const lessons=T.roomLessons(db,name,slot.id,day).map(({cv,room})=>({subject:cv.subject,room:room.label,learnRoom:T.learnRoom(db,cv,room.id)}));
    lessons.push(...T.activities(db,name,slot.id,day).map(a=>({subject:a.subject,room:'กิจกรรมรายครู'})));
    return '<td>'+lessons.map(l=>'<div class="teacher-print-lesson"><strong>'+e(l.subject)+'</strong><small>'+e(l.room)+'</small>'+(l.learnRoom?'<small>ห้อง '+e(l.learnRoom)+'</small>':'')+'</div>').join('')+'</td>';
   }).join('')+'</tr>').join('');
   return '<section class="teacher-print-page" data-teacher-id="'+e(teacher.id)+'"><header><h1>ตารางสอน</h1><h2>'+e(name)+'</h2><p>'+e(school.name)+' · ภาคเรียนที่ '+e(school.semester)+' ปีการศึกษา '+e(school.year)+'</p></header><table><thead>'+head+'</thead><tbody>'+rows+'</tbody></table><footer>รหัสครู '+e(teacher.id)+' · '+(index+1)+' / '+teachers.length+'</footer></section>';
  }).join('');
 }
 return {pages};
});

if(typeof document!=='undefined'){const style=document.createElement('style');style.textContent='@media screen{html body.guest-mode #page-teacher-view .tv-header-controls{display:flex!important}html body.guest-mode #tvExportBar:not([style*="display: none"]):not([style*="display:none"]){display:flex!important}}';document.head.appendChild(style);}
