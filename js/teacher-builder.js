/* Uses the room builder's table and panel classes; independent periods have no student room. */
var teacherBuilderId='';
function teacherBuilderEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function renderTeacherBuilder(){
 const page=document.getElementById('page-teacher-builder');if(!page)return;
 if(!canAccessPage('teacher-builder')){page.innerHTML='<div class="alert a-warn">เฉพาะฝ่ายวิชาการ</div>';return;}
 if(window.SCHOOL_OS_STORAGE==='firebase'&&(!SCHOOL_ONLINE.isReady()||SCHOOL_ONLINE.isLoading())){page.innerHTML='<div class="alert a-info">กำลังโหลดตารางสอน…</div>';try{await SCHOOL_ONLINE.loadDatabaseOnce();}catch(e){page.innerHTML='<div class="alert a-warn">โหลดข้อมูลไม่ได้ กรุณาเปิดหน้านี้อีกครั้ง</div>';return;}}
 if(!DB.teachers.some(t=>t.id===teacherBuilderId))teacherBuilderId=DB.teachers[0]?.id||'';
 const e=teacherBuilderEscape,teacher=DB.teachers.find(t=>t.id===teacherBuilderId),name=teacher?TeacherSchedule.name(teacher):'';
 page.innerHTML=`<div class="ph builder-page-head"><div class="ph-left"><h1><span class="page-title-icon">🗓️</span> สร้างตารางรายครู</h1><p>ลงวิชาอิสระให้ครู โดยไม่ต้องเลือกห้องนักเรียน</p></div><div class="ph-actions"><button class="btn btn-out btn-sm" id="teacherBuilderView">ดูตารางรายครู</button></div></div><div class="builder-room-panel"><div class="builder-section-title">▣ เลือกครู</div><select id="teacherBuilderSelect" class="teacher-builder-select" aria-label="เลือกครู">${DB.teachers.map(t=>`<option value="${e(t.id)}" ${t.id===teacherBuilderId?'selected':''}>${e(TeacherSchedule.name(t))}</option>`).join('')}</select></div><div class="builder-table-panel"><div class="builder-table-titlebar"><span class="mini-icon">🗓️</span><span>ตารางสอน ${e(name)}</span></div><div class="card builder-grid-card"><div id="teacherBuilderGrid"></div></div></div>`;
 page.querySelector('#teacherBuilderSelect').onchange=event=>{teacherBuilderId=event.target.value;renderTeacherBuilder();};
 page.querySelector('#teacherBuilderView').onclick=()=>{nav('teacher-view');if(teacherBuilderId)renderTeacherViewById(teacherBuilderId);};
 if(currentPage==='teacher-builder')updateInlineBackButton('teacher-builder');
 const grid=page.querySelector('#teacherBuilderGrid');if(!teacher){grid.innerHTML='<div class="empty-state">ยังไม่มีข้อมูลครู</div>';return;}
 const head=DB.slots.map(s=>`<th ${s.isBreak?'class="teacher-builder-break"':''}>${e(s.label)}<div class="teacher-builder-time">${e(s.start)}–${e(s.end)}</div></th>`).join('');
 grid.innerHTML=`<div class="sched-wrap"><table class="sched-tbl teacher-builder-table"><thead><tr><th class="th-time">วัน/คาบ</th>${head}</tr></thead><tbody>${DB.days.map((day,di)=>`<tr><td class="td-period">${e(day)}</td>${DB.slots.map(slot=>{
  if(slot.isBreak)return di?'':`<td rowspan="${DB.days.length}" class="builder-break-cell teacher-builder-break">พักเที่ยง</td>`;
  const linked=TeacherSchedule.roomLessons(DB,name,slot.id,day),activity=(DB.teacherSched||{})[TeacherSchedule.key(teacher.id,slot.id,day)],subject=DB.subjects.find(s=>s.id===activity?.subjectId);
  return `<td class="teacher-builder-cell" style="background:${e(subject?.color||'#fff')}">${linked.map(m=>`<div class="teacher-builder-linked"><strong>${e(m.cv.subject)}</strong><small>${e(m.room.label)}</small><button class="btn btn-ghost btn-xs" data-room-id="${e(m.room.id)}">แก้ตารางห้องเรียน</button></div>`).join('')}<select class="cell-subj-sel" data-slot="${e(slot.id)}" data-day="${e(day)}" aria-label="วิชาของ ${e(name)} ${e(day)} ${e(slot.label)}" ${linked.length&&!activity?'disabled':''}><option value="">— วิชาอิสระ —</option>${DB.subjects.map(s=>`<option value="${e(s.id)}" ${activity?.subjectId===s.id?'selected':''}>${e((s.code?s.code+' | ':'')+s.name+(s.grade?' · '+s.grade:''))}</option>`).join('')}</select>${activity&&!subject?`<small>${e(activity.subject)} (วิชาถูกนำออกจากรายการแล้ว)</small>`:''}${!linked.length?'<small class="teacher-builder-note">เฉพาะครู · ไม่ผูกห้องนักเรียน</small>':''}</td>`;
 }).join('')}</tr>`).join('')}</tbody></table></div>`;
 grid.querySelectorAll('[data-room-id]').forEach(button=>button.onclick=()=>goToBuilder(button.dataset.roomId));
 grid.querySelectorAll('.cell-subj-sel').forEach(select=>select.onchange=()=>{
  if(!canAccessPage('teacher-builder'))return;
  try{TeacherSchedule.set(DB,{teacherId:teacherBuilderId,slotId:select.dataset.slot,day:select.dataset.day,subjectId:select.value});markDirty();renderTeacherBuilder();updateConflictBadge();}catch(error){toast(error.message,'warn');renderTeacherBuilder();}
 });
}
