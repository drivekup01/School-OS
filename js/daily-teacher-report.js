(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./teacher-schedule-core'));else root.DailyTeacherReport=factory(root.TeacherSchedule);})(typeof globalThis==='object'?globalThis:this,function(T){
 'use strict';
 const e=T.escape,norm=v=>String(v||'').replace(/\s/g,'');
 const labels={normal:'สอนตามตาราง',absent:'คาบเดิมที่จัดแทนแล้ว',pending:'ยังขาดครูสอนแทน',substitute:'สอนแทน',swap:'แลกคาบ',combined:'ควบชั้น',break:'พัก'};
 function model(db,date,day={}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('กรุณาเลือกวันที่ที่ถูกต้อง');
  const weekday=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][new Date(date+'T12:00:00+07:00').getUTCDay()];
  const slots=(db.slots||[]).map((s,i)=>({...s,order:i})).sort((a,b)=>a.start&&b.start?a.start.localeCompare(b.start):a.order-b.order);
  const rows=(db.teachers||[]).map(t=>({id:String(t.id),name:T.name(t),cells:Object.fromEntries(slots.map(s=>[String(s.id),[]]))}));
  const warnings=[],sources=[],seen=new Set();
  for(const row of rows)for(const slot of slots){if(slot.isBreak)continue;
   const cells=row.cells[String(slot.id)];
   for(const {cv,room} of T.roomLessons(db,row.name,slot.id,weekday))cells.push({subject:cv.subject,rooms:[room.label],roomId:String(room.id),location:T.learnRoom(db,cv,room.id),kind:'normal'});
   for(const a of T.activities(db,row.name,slot.id,weekday))cells.push({subject:a.subject,rooms:[],roomId:'',location:'กิจกรรมครู',kind:'normal',teacherOnly:true});
  }
  for(const absent of day.absentList||[]){
   const owner=rows.find(r=>r.id===String(absent.teacherId));if(!owner){warnings.push('ไม่พบครูเจ้าของคาบในทะเบียนครู');continue;}
   const add=(p,lesson)=>{const key=JSON.stringify([owner.id,String(p.slotId),String(p.roomId||'')]);if(seen.has(key))return;seen.add(key);sources.push({owner,p,lesson});};
   for(const slot of slots){if(slot.isBreak)continue;const periods=(absent.periods||[]).filter(p=>String(p.slotId)===String(slot.id)&&(!p.day||p.day===weekday));
    if(absent.manualOnly&&!periods.length)continue;
    for(const lesson of owner.cells[String(slot.id)].filter(l=>!l.teacherOnly)){
     const p=periods.find(p=>String(p.roomId)===lesson.roomId)||{slotId:slot.id,roomId:lesson.roomId,subject:lesson.subject};add(p,lesson);
    }
    for(const p of periods){const room=(db.rooms||[]).find(r=>String(r.id)===String(p.roomId));let lesson=owner.cells[String(slot.id)].find(l=>l.roomId===String(p.roomId));
     if(!lesson){lesson={subject:p.subject||'ไม่ระบุวิชา',roomId:String(p.roomId||''),rooms:[room?.label||'ไม่ระบุชั้น'],location:room?.baseRoom||'',kind:'normal'};owner.cells[String(slot.id)].push(lesson);}add(p,lesson);
    }
   }
  }
  const groups=new Map();
  for(const {owner,p,lesson} of sources){
   const key=owner.id+'|'+p.slotId;if(!groups.has(key))groups.set(key,[]);
   const matches=rows.filter(r=>norm(r.name)===norm(p.subTeacher));const replacement=p.subTeacher&&matches.length===1?matches[0]:null;
   lesson.kind=replacement?'absent':'pending';lesson.status=replacement?'แทนโดย '+replacement.name:'รอจัดครูแทน';groups.get(key).push(!!replacement);
   if(p.subTeacher&&!replacement)warnings.push('ไม่พบหรือชื่อครูสอนแทนซ้ำ: '+p.subTeacher);
   if(replacement){const kind=p.workType==='แลกคาบ'?'swap':p.workType==='ควบชั้น'?'combined':'substitute';replacement.cells[String(p.slotId)].push({subject:p.subject||lesson.subject,rooms:lesson.rooms.slice(),roomId:lesson.roomId,location:lesson.location,kind,source:owner.name,workType:p.workType||'',note:p.subNote||''});}
  }
  for(const row of rows)for(const slot of slots){const cells=row.cells[String(slot.id)],received=cells.filter(l=>['substitute','swap','combined'].includes(l.kind));if(received.length&&cells.some(l=>l.kind==='normal')||received.some(l=>l.source===row.name))warnings.push(row.name+' คาบ '+slot.label+': มีงานสอนซ้อน กรุณาตรวจสอบ');
   const owners=new Set(received.map(l=>l.source));if(owners.size>1&&received.some(l=>l.kind!=='combined'))warnings.push(row.name+' คาบ '+slot.label+': รับแทนหลายครู กรุณาตรวจสอบ');
  }
  const assigned=[...groups.values()].filter(g=>g.every(Boolean)).length;
  return {date,weekday,dateLabel:new Date(date+'T12:00:00+07:00').toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'}),school:db.school||{},slots,rows,periods:groups.size,assigned,pending:groups.size-assigned,warnings:[...new Set(warnings)],scheduled:(db.days||[]).includes(weekday)};
 }
 const css=`.daily-report{box-sizing:border-box;width:1500px;padding:28px;background:white;color:#172538;font:15px/1.5 Tahoma,sans-serif}.daily-report *{box-sizing:border-box}.daily-report h1{font:700 26px/1.4 Tahoma,sans-serif;margin:0 0 5px}.daily-report header{text-align:center;margin-bottom:16px}.daily-report header p{margin:4px 0}.daily-report table{width:100%;table-layout:fixed;border-collapse:collapse;font:14px/1.5 Tahoma,sans-serif}.daily-report th,.daily-report td{border:1px solid #8f99a5;padding:6px;text-align:center;vertical-align:middle;overflow-wrap:anywhere}.daily-report thead th{background:#e7e9ee;color:#172538}.daily-report tbody th{text-align:left;font-weight:400;background:white}.daily-report .daily-lesson{padding:5px 2px}.daily-report .daily-lesson+.daily-lesson{border-top:1px solid #9aa1aa}.daily-report strong,.daily-report small{display:block}.daily-report small{font-size:11px;line-height:1.55}.daily-report .kind-normal{background:white}.daily-report .kind-absent{background:#d0d2d6}.daily-report .kind-pending{background:#ffd8d8}.daily-report .kind-substitute{background:#fff36b}.daily-report .kind-swap{background:#96c4ff}.daily-report .kind-combined{background:#ffc783}.daily-report .kind-break{background:#dfd5ee}.daily-report .daily-legend{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.daily-report .daily-legend span{border:1px solid #8f99a5;padding:6px 12px;font-size:12px}.daily-report .daily-warning{padding:8px 12px;margin:8px 0;background:#fff0dc;border:1px solid #cc9454}.daily-report .daily-meta{font-size:13px;color:#465366}.daily-report .daily-summary{text-align:center;margin:12px 0;font-size:14px}`;
 function html(m){
  const lesson=l=>'<div class="daily-lesson kind-'+l.kind+'"><strong>'+e(l.subject)+'</strong><span>'+e(l.rooms.join(', '))+(l.location?' · '+e(l.location):'')+'</span>'+(l.kind!=='normal'?'<small>'+e(labels[l.kind])+'</small>':'')+(l.source?'<small>แทน '+e(l.source)+'</small>':'')+(l.status?'<small>'+e(l.status)+'</small>':'')+(l.note?'<small>'+e(l.note)+'</small>':'')+'</div>';
  return '<style>'+css+'</style><article class="daily-report"><header><h1>ตารางสอนรวมครูและการจัดสอนแทน</h1><p>'+e(m.school.name||'โรงเรียน')+'</p><p>'+e(m.dateLabel)+'</p><p class="daily-meta">ปีการศึกษา '+e(m.school.year||'–')+' · ภาคเรียน '+e(m.school.semester||'–')+'</p></header><div class="daily-summary">ครู '+m.rows.length+' คน · ต้องจัดแทน '+m.periods+' คาบครู · จัดครบแล้ว '+m.assigned+' · ยังขาด '+m.pending+'</div>'+(!m.scheduled?'<p class="daily-warning">วันนี้ไม่มีตารางสอนประจำสัปดาห์</p>':'')+m.warnings.map(w=>'<p class="daily-warning">'+e(w)+'</p>').join('')+'<table><colgroup><col style="width:225px">'+m.slots.map(s=>'<col>').join('')+'</colgroup><thead><tr><th rowspan="2">ชื่อครู / คาบที่</th>'+m.slots.map(s=>'<th class="'+(s.isBreak?'kind-break':'')+'">'+e(s.label)+'</th>').join('')+'</tr><tr>'+m.slots.map(s=>'<th class="'+(s.isBreak?'kind-break':'')+'">'+e(s.start||'')+'–'+e(s.end||'')+'</th>').join('')+'</tr></thead><tbody>'+m.rows.map(row=>'<tr><th>'+e(row.name)+'</th>'+m.slots.map(s=>s.isBreak?'<td class="kind-break"></td>':'<td style="padding:0">'+row.cells[String(s.id)].map(lesson).join('')+'</td>').join('')+'</tr>').join('')+'</tbody></table><div class="daily-legend">'+Object.entries(labels).map(([k,v])=>'<span class="kind-'+k+'">'+e(v)+'</span>').join('')+'</div><p class="daily-meta">คาบครู = ครูเจ้าของคาบหนึ่งคนในหนึ่งคาบ แม้สอนหลายห้อง · ช่องว่าง = ไม่มีคาบตามตาราง · อ้างอิงตารางภาคเรียนปัจจุบันและการจัดแทนของวันที่เลือก</p></article>';
 }
 return {model,html,css};
});
