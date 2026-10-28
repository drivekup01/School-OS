(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./teacher-schedule-core'));else root.DailyTeacherReport=factory(root.TeacherSchedule);})(typeof globalThis==='object'?globalThis:this,function(T){
 'use strict';
 const e=T.escape,norm=v=>String(v||'').replace(/\s/g,'');
 const minutes=v=>{const m=String(v||'').match(/^(\d{1,2})[:.](\d{2})$/);return m?Number(m[1])*60+Number(m[2]):null;};
 const timeLabel=v=>{const n=minutes(v);return n===null?String(v||''):String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');};
 const labels={normal:'สอนตามตาราง',absent:'คาบเดิมที่จัดแทนแล้ว',pending:'ยังขาดครูสอนแทน',substitute:'สอนแทน',swap:'แลกคาบ',combined:'ควบชั้น',break:'พัก'};
 function model(db,date,day={}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('กรุณาเลือกวันที่ที่ถูกต้อง');
  const weekday=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][new Date(date+'T12:00:00+07:00').getUTCDay()];
  const slots=(db.slots||[]).map((s,i)=>({...s,order:i})).sort((a,b)=>minutes(a.start)!==null&&minutes(b.start)!==null?minutes(a.start)-minutes(b.start):a.order-b.order);
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
   lesson.kind=replacement?'absent':'pending';lesson.coveredBy=replacement?.name||'';lesson.status=replacement?'แทนโดย '+replacement.name:'รอจัดครูแทน';groups.get(key).push(!!replacement);
   if(p.subTeacher&&!replacement)warnings.push('ไม่พบหรือชื่อครูสอนแทนซ้ำ: '+p.subTeacher);
   if(replacement){const kind=p.workType==='แลกคาบ'?'swap':p.workType==='ควบชั้น'?'combined':'substitute';replacement.cells[String(p.slotId)].push({subject:p.subject||lesson.subject,rooms:lesson.rooms.slice(),roomId:lesson.roomId,location:lesson.location,kind,source:owner.name,workType:p.workType||'',note:p.subNote||''});}
  }
  for(const row of rows)for(const slot of slots){const cells=row.cells[String(slot.id)],received=cells.filter(l=>['substitute','swap','combined'].includes(l.kind));if(received.length&&cells.some(l=>l.kind==='normal')||received.some(l=>l.source===row.name))warnings.push(row.name+' คาบ '+slot.label+': มีงานสอนซ้อน กรุณาตรวจสอบ');
   const owners=new Set(received.map(l=>l.source));if(owners.size>1&&received.some(l=>l.kind!=='combined'))warnings.push(row.name+' คาบ '+slot.label+': รับแทนหลายครู กรุณาตรวจสอบ');
  }
  const assigned=[...groups.values()].filter(g=>g.every(Boolean)).length;
  return {date,weekday,dateLabel:new Date(date+'T12:00:00+07:00').toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'}),school:db.school||{},slots,rows,periods:groups.size,assigned,pending:groups.size-assigned,warnings:[...new Set(warnings)],scheduled:(db.days||[]).includes(weekday)};
 }
 const cleanLocation=v=>String(v||'').trim().replace(/^[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]+/,'');
 function displayLessons(cells){
  const grouped=new Map();
  for(const cell of cells){const key=JSON.stringify([cell.subject,cleanLocation(cell.location),cell.kind,cell.source,cell.status,cell.note,cell.workType,cell.teacherOnly]);if(!grouped.has(key))grouped.set(key,{...cell,location:cleanLocation(cell.location),rooms:[]});const target=grouped.get(key);for(const room of cell.rooms)if(!target.rooms.includes(room))target.rooms.push(room);}
  return [...grouped.values()];
 }
 function roomLabel(rooms){
  const sorted=[...rooms].sort((a,b)=>a.localeCompare(b,'th',{numeric:true})),matches=sorted.map(r=>String(r).match(/^ม\.(\d+)\/(\d+)$/));
  if(matches.length>=3&&matches.every(Boolean)&&matches.every((m,i)=>m[1]===matches[0][1]&&Number(m[2])===Number(matches[0][2])+i))return 'ม.'+matches[0][1]+'/'+matches[0][2]+'–'+matches.at(-1)[2];
  return sorted.join(', ');
 }
 const css=`.daily-report{box-sizing:border-box;width:1800px;padding:22px;background:white;color:#111827;font:16px/1.4 Tahoma,sans-serif}.daily-report *{box-sizing:border-box}.daily-report h1{font:700 27px/1.3 Tahoma,sans-serif;margin:0 0 4px}.daily-report header{text-align:center;margin-bottom:10px}.daily-report header p{margin:3px 0}.daily-report table{width:100%;table-layout:fixed;border-collapse:collapse;font:16px/1.35 Tahoma,sans-serif}.daily-report th,.daily-report td{border:1px solid #8290a0;padding:6px;text-align:center;vertical-align:middle;overflow-wrap:anywhere}.daily-report thead th{background:#e7e9ee;color:#111827;font-size:16px}.daily-report tbody th{text-align:left;font-weight:600;background:#f7f8fa}.daily-report .daily-lesson{padding:6px 4px;min-height:42px}.daily-report .daily-lesson+.daily-lesson{border-top:1px solid #9aa1aa}.daily-report strong,.daily-report small{display:block}.daily-report strong{font-size:16px;line-height:1.35}.daily-report .daily-room{font-size:14px;line-height:1.4;margin-top:3px}.daily-report small{font-size:13px;line-height:1.35;margin-top:3px}.daily-report .kind-normal{background:white}.daily-report .kind-absent{background:#d0d2d6}.daily-report .kind-pending{background:#ffd0d0}.daily-report .kind-substitute{background:#fff36b}.daily-report .kind-swap{background:#96c4ff}.daily-report .kind-combined{background:#ffc783}.daily-report .kind-break{background:#dfd5ee}.daily-report .daily-legend{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.daily-report .daily-legend span{border:1px solid #8290a0;padding:5px 10px;font-size:14px}.daily-report .daily-warning{padding:7px 10px;margin:7px 0;background:#fff0dc;border:1px solid #cc9454}.daily-report .daily-meta{font-size:13px;color:#374151}.daily-report .daily-summary{text-align:center;margin:9px 0;font-size:15px}`;
 function html(m){
  const shortNames=new Map(m.rows.map(row=>{const first=row.name.replace(/^(นางสาว|นาง|นาย|ว่าที่ร้อยตรี|ครู)\s*/,'').split(/\s+/)[0];return [row.name,'ครู'+first];}));
  const short=name=>{const value=shortNames.get(name);return value&&[...shortNames.values()].filter(v=>v===value).length===1?value:name;};
  const lesson=l=>'<div class="daily-lesson kind-'+l.kind+'"><strong>'+e(l.subject)+'</strong><div class="daily-room">'+e(roomLabel(l.rooms))+(l.location?' · '+e(l.location):'')+'</div>'+(l.source?'<small>แทน '+e(short(l.source))+'</small>':'')+(l.coveredBy?'<small>แทนโดย '+e(short(l.coveredBy))+'</small>':l.kind==='pending'?'<small>ยังไม่มีครูแทน</small>':'')+(['swap','combined'].includes(l.kind)?'<small>'+e(labels[l.kind])+'</small>':'')+(l.note?'<small>'+e(l.note)+'</small>':'')+'</div>';
  return '<style>'+css+'</style><article class="daily-report"><header><h1>ตารางสอนรวมครูและการจัดสอนแทน</h1><p>'+e(m.school.name||'โรงเรียน')+'</p><p>'+e(m.dateLabel)+'</p><p class="daily-meta">ปีการศึกษา '+e(m.school.year||'–')+' · ภาคเรียน '+e(m.school.semester||'–')+'</p></header><div class="daily-summary">ครู '+m.rows.length+' คน · ต้องจัดแทน '+m.periods+' คาบครู · จัดครบแล้ว '+m.assigned+' · ยังขาด '+m.pending+'</div>'+(!m.scheduled?'<p class="daily-warning">วันนี้ไม่มีตารางสอนประจำสัปดาห์</p>':'')+m.warnings.map(w=>'<p class="daily-warning">'+e(w)+'</p>').join('')+'<table><colgroup><col style="width:245px">'+m.slots.map(s=>'<col>').join('')+'</colgroup><thead><tr><th rowspan="2">ชื่อครู / คาบที่</th>'+m.slots.map(s=>'<th class="'+(s.isBreak?'kind-break':'')+'">'+e(s.label)+'</th>').join('')+'</tr><tr>'+m.slots.map(s=>'<th class="'+(s.isBreak?'kind-break':'')+'">'+e(timeLabel(s.start))+'–'+e(timeLabel(s.end))+'</th>').join('')+'</tr></thead><tbody>'+m.rows.map(row=>'<tr><th>'+e(row.name)+'</th>'+m.slots.map(s=>s.isBreak?'<td class="kind-break"></td>':'<td style="padding:0">'+displayLessons(row.cells[String(s.id)]).map(lesson).join('')+'</td>').join('')+'</tr>').join('')+'</tbody></table><div class="daily-legend">'+Object.entries(labels).map(([k,v])=>'<span class="kind-'+k+'">'+e(v)+'</span>').join('')+'</div><p class="daily-meta">รวมวิชาเดียวกันที่สอนพร้อมกันและสถานที่เดียวกันในช่องเดียว · ชื่ออ้างอิงย่อเป็นชื่อครูในตาราง · ช่องว่าง = ไม่มีคาบสอน · อ้างอิงตารางภาคเรียนปัจจุบันและวันที่เลือก</p></article>';
 }
 return {model,html,css,displayLessons,roomLabel};
});
