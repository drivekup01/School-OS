(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SubstituteReport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const full=t=>t?((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim():'ไม่ระบุครู';
 const compare=(a,b)=>String(a).localeCompare(String(b),'th',{numeric:true});
 const columns=['คาบ / เวลา','วิชา / ชั้นเรียน','ครูเจ้าของคาบ','ครูสอนแทน','งานและบันทึก','สถานะ'];
 function model(db,date,day){
  const grouped=new Map();
  for(const a of day?.absentList||[]){
   const teacher=(db.teachers||[]).find(t=>String(t.id)===String(a.teacherId));
   for(const p of a.periods||[]){
    const slot=(db.slots||[]).find(s=>String(s.id)===String(p.slotId)),room=(db.rooms||[]).find(r=>String(r.id)===String(p.roomId));
    const item={slotId:String(p.slotId),period:slot?.label||'คาบ '+p.slotId,number:Number(String(slot?.label||p.slotId).match(/\d+/)?.[0]||999),time:slot?slot.start+'–'+slot.end:'ไม่ระบุเวลา',start:slot?.start||'',teacherId:String(a.teacherId),teacher:full(teacher),reason:a.type||'ไม่ระบุ',reasonNote:a.note||'',manualOnly:!!a.manualOnly,subject:p.subject||'ไม่ระบุวิชา',replacement:p.subTeacher||'',workType:p.workType||'ภาระงาน',message:p.messageStatus||'',note:p.subNote||'',rooms:[]};
    const key=JSON.stringify([item.slotId,item.teacherId,item.subject,item.replacement,item.workType,item.message,item.note,item.reason,item.reasonNote,item.manualOnly]);
    if(!grouped.has(key))grouped.set(key,item);
    const row=grouped.get(key),label=room?.label||String(p.roomId||'ไม่ระบุห้อง');if(!row.rooms.includes(label))row.rooms.push(label);
   }
  }
  const rows=[...grouped.values()];rows.forEach(r=>r.rooms.sort(compare));
  rows.sort((a,b)=>a.number-b.number||compare(a.start,b.start)||compare(a.teacher,b.teacher)||compare(a.rooms.join(','),b.rooms.join(','))||compare(a.subject,b.subject));
  const slots=new Map();rows.forEach(r=>{const key=r.teacherId+'|'+r.slotId;if(!slots.has(key))slots.set(key,[]);slots.get(key).push(r);});
  const byReplacement=new Map();for(const row of rows){const key=row.replacement.trim();if(!byReplacement.has(key))byReplacement.set(key,[]);byReplacement.get(key).push(row);}
  const groups=[...byReplacement].sort(([a,ar],[b,br])=>!a?1:!b?-1:ar[0].number-br[0].number||compare(ar[0].start,br[0].start)||compare(a,b)).map(([teacher,items])=>({teacher,pending:!teacher,rows:items,periods:new Set(items.map(r=>r.slotId)).size}));
  const school=db.school||{},dateLabel=new Date(date+'T12:00:00+07:00').toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'});
  return {school,date,dateLabel,rows,groups,periods:slots.size,rooms:new Set(rows.flatMap(r=>r.rooms)).size,assigned:[...slots.values()].filter(group=>group.every(r=>!!r.replacement)).length};
 }
 function cells(r){return [[r.period,r.time],[r.subject,r.rooms.join(', ')],[r.teacher,r.reason+(r.reasonNote?' · '+r.reasonNote:'')],[r.replacement||'รอจัดครูแทน'],[r.workType,...(r.message?['บันทึกข้อความ: '+r.message]:[]),...(r.note?['หมายเหตุ: '+r.note]:[])],[r.replacement?'จัดแล้ว':'รอจัดแทน']];}
 function summary(m){return m.periods+' คาบ  ·  '+m.rooms+' ห้อง  ·  จัดครูแทนแล้ว '+m.assigned+' คาบ  ·  รอจัด '+(m.periods-m.assigned)+' คาบ';}
 const css=`
 .sub-report{box-sizing:border-box;width:1280px;padding:40px 42px 32px;background:#fff;color:#25364d;font:16px/1.65 Tahoma,sans-serif}
 .sub-report *{box-sizing:border-box}.sub-report-head{text-align:center;margin-bottom:24px}.sub-report-logo{width:68px;height:68px;object-fit:contain;display:block;margin:0 auto 14px}
 .sub-report h1{font-size:30px;line-height:1.45;font-weight:700;color:#000;margin:0 0 4px}.sub-report-school{font-size:21px;color:#000}.sub-report-date{font-size:19px;color:#405a78;margin-top:6px}.sub-report-meta{font-size:14px;color:#718197;margin-top:5px}
 .sub-report-summary{padding:0 0 18px;color:#3f5875;font-size:16px}.sub-report-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:15px;line-height:1.7}
 .sub-report-table th{background:#193f6b;color:#fff;text-align:left;padding:14px 13px;font-size:15px;border:1px solid #d9d9d9;font-weight:700}
 .sub-report-table td{padding:15px 13px;border:1px solid #d9d9d9;vertical-align:middle;overflow-wrap:anywhere}.sub-report-table tbody tr:nth-child(even){background:#f1f5fa}
 .sub-report-table th:nth-child(1){width:11%}.sub-report-table th:nth-child(2){width:20%}.sub-report-table th:nth-child(3){width:21%}.sub-report-table th:nth-child(4){width:21%}.sub-report-table th:nth-child(5){width:18%}.sub-report-table th:nth-child(6){width:9%}
 .sub-report-table strong{font-weight:700;display:block}.sub-report-table small{font-size:13px;display:block;color:#637791;line-height:1.65;margin-top:4px}.sub-report-table .report-assigned{color:#247557;font-weight:700}.sub-report-table .report-pending{color:#a16b1c;font-weight:700}.sub-report-period{border-top:2px solid #bbcce0!important}
 .sub-report-empty{padding:30px;text-align:center;color:#6b7d94}
 `;
 function html(m,logo){
  const ordered=m.groups.flatMap(group=>group.rows);
  const rows=ordered.map((r,i)=>{const values=cells(r),newTeacher=i===0||ordered[i-1].replacement!==r.replacement;return '<tr'+(newTeacher?' class="sub-report-period"':'')+'>'+values.map((lines,col)=>'<td'+(col===5?' class="'+(r.replacement?'report-assigned':'report-pending')+'"':'')+'>'+lines.map((line,k)=>(k===0?'<strong>':'<small>')+esc(line)+(k===0?'</strong>':'</small>')).join('')+'</td>').join('')+'</tr>';}).join('');
  const tables=rows?'<table class="sub-report-table"><thead><tr>'+columns.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table>':'';
  const s=m.school;
  return '<style>'+css+'</style><article class="sub-report"><header class="sub-report-head"><img class="sub-report-logo" src="'+esc(logo)+'" alt="ตราโรงเรียน"><h1>ตารางสอนแทนประจำวัน</h1><div class="sub-report-school">'+esc(s.name||'โรงเรียน')+'</div><div class="sub-report-date">'+esc(m.dateLabel)+'</div><div class="sub-report-meta">ปีการศึกษา '+esc(s.year||'–')+' · ภาคเรียนที่ '+esc(s.semester||'–')+'</div></header><div class="sub-report-summary">'+esc(summary(m))+'</div>'+(tables||'<div class="sub-report-empty">ไม่มีรายการสอนแทนในวันที่เลือก</div>')+'</article>';
 }
 function word(m,D,logo){
  const {Document,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell,WidthType,BorderStyle,ShadingType,AlignmentType,VerticalAlign,PageOrientation,TableLayoutType}=D;
  const width=15398,widths=[1694,3080,3234,3234,2772,1384],font='Tahoma';
  const run=(text,opts={})=>new TextRun({text:String(text),font,size:20,color:'25364D',...opts});
  const para=(text,opts={},runOpts={})=>new Paragraph({spacing:{after:65,line:290},children:[run(text,runOpts)],...opts});
  const children=[];
  if(logo)children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:100},children:[new ImageRun({type:logo.type||'png',data:logo.data,transformation:{width:58,height:58},altText:{title:'ตราโรงเรียน',description:'ตราโรงเรียน',name:'School logo'}})]}));
  children.push(para('ตารางสอนแทนประจำวัน',{style:'Title',alignment:AlignmentType.CENTER,spacing:{after:70}},{size:36,bold:true,color:'000000'}),para(m.school.name||'โรงเรียน',{alignment:AlignmentType.CENTER},{size:25,color:'000000'}),para(m.dateLabel,{alignment:AlignmentType.CENTER},{size:23,color:'405A78'}),para('ปีการศึกษา '+(m.school.year||'–')+' · ภาคเรียนที่ '+(m.school.semester||'–'),{alignment:AlignmentType.CENTER,spacing:{after:190}},{size:18,color:'718197'}),para(summary(m),{spacing:{after:150}},{size:20,color:'405A78'}));
  const border={style:BorderStyle.SINGLE,size:4,color:'D9D9D9'},borders={top:border,bottom:border,left:border,right:border};
  const cell=(lines,index,fill,header=false,row)=>new TableCell({width:{size:widths[index],type:WidthType.DXA},borders,margins:{top:145,bottom:145,left:125,right:125},verticalAlign:VerticalAlign.CENTER,shading:{fill,type:ShadingType.CLEAR},children:lines.map((line,i)=>para(line,{spacing:{after:i===lines.length-1?0:60,line:290}},{bold:header||i===0,size:header?20:i===0?20:18,color:header?'FFFFFF':index===5?(row?.replacement?'247557':'A16B1C'):i===0?'25364D':'637791'}))});
  const ordered=m.groups.flatMap(group=>group.rows);
  const rows=[new TableRow({tableHeader:true,cantSplit:true,children:columns.map((c,i)=>cell([c],i,'193F6B',true))}),...ordered.map((r,i)=>new TableRow({cantSplit:true,children:cells(r).map((lines,col)=>cell(lines,col,i%2?'F1F5FA':'FFFFFF',false,r))}))];
  children.push(new Table({width:{size:width,type:WidthType.DXA},columnWidths:widths,layout:TableLayoutType.FIXED,rows}));
  return new Document({styles:{default:{document:{run:{font,size:20,color:'25364D'},paragraph:{spacing:{line:290}}}},paragraphStyles:[{id:'Title',name:'Title',basedOn:'Normal',run:{font,size:36,bold:true,color:'000000'}}]},sections:[{properties:{page:{size:{width:11906,height:16838,orientation:PageOrientation.LANDSCAPE},margin:{top:650,right:720,bottom:650,left:720}}},children}]});
 }
 return {model,cells,summary,html,word,columns};
});
