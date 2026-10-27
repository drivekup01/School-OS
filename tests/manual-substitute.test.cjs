const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const scripts=['substitute-v2-script','substitute-production-share-script'].map(id=>html.split('<script id="'+id+'">')[1].split('</script>')[0]);
function boot(){
 const nodes={},messages=[];
 const db={school:{name:'โรงเรียนทดสอบ'},teachers:[{id:'t1',first:'ครูหนึ่ง',last:'ทดสอบ'},{id:'t2',first:'ครูสอง',last:'ทดสอบ'},{id:'t3',first:'ครูสาม',last:'ทดสอบ'}],rooms:[{id:'r1',label:'ม.1/1'},{id:'r2',label:'ม.1/2'}],slots:[{id:1,label:'คาบที่ 1',start:'08:30',end:'09:20'},{id:2,label:'คาบที่ 2',start:'09:20',end:'10:10'},{id:3,isBreak:true}],sched:{r1_1_พุธ:{subject:'ไทย',teacher:'ครูหนึ่ง ทดสอบ'},r1_2_พุธ:{subject:'ไทย',teacher:'ครูหนึ่ง ทดสอบ'}},substitute:{}};
 const ctx={DB:db,currentSubDate:'2026-10-28',SCHOOL_AUTH:{loggedIn:true},TeacherSchedule:{activities:()=>[],learnRoom:()=>''},mapDayNameToSched:()=> 'พุธ',formatDateThai:d=>d,markDirty:()=>ctx.writes++,writes:0,toast:m=>messages.push(m),document:{getElementById:id=>nodes[id]??={innerHTML:'',textContent:''},querySelector:()=>ctx.picked?{value:ctx.picked}:null},Promise};
 ctx.getSubDay=date=>db.substitute[date]??={absentList:[]};ctx.peekSubDay=date=>db.substitute[date];
 ctx.getSubViewDay=date=>JSON.parse(JSON.stringify(db.substitute[date]||{absentList:[]}));
 ctx.ensurePersistentAbsentFromView_=id=>(ctx.getSubDay(ctx.currentSubDate).absentList||[]).find(a=>String(a.teacherId)===String(id))||null;
 ctx.window=ctx;vm.createContext(ctx);scripts.forEach(code=>vm.runInContext(code,ctx));
 ctx.subV2SelectedTeacherId='t1';ctx.subV2SelectedSlotId='1';return {ctx,nodes,messages};
}
test('manual button opens the existing picker without creating leave or saving until confirmation',async()=>{
 const {ctx,nodes}=boot();ctx.renderSubSidePanel();assert.match(nodes.subSidePanel.innerHTML,/>จัดสอนแทน<\/button>/);
 ctx.startSubV2Manual();assert.match(nodes.subSidePanel.innerHTML,/ยืนยันครูสอนแทน/);assert.equal(Object.keys(ctx.DB.substitute).length,0);
 ctx.picked='ครูสอง ทดสอบ';ctx.confirmSubV2Teacher();await ctx.renderSubContent();
 const day=ctx.getSubDay(ctx.currentSubDate),row=day.absentList[0];assert.equal(ctx.writes,1);assert.equal(row.manualOnly,true);assert.equal(row.periods.length,1);assert.equal(row.periods[0].slotId,1);
 assert.equal(row.periods[0].subTeacher,'ครูสอง ทดสอบ');assert.equal(nodes.sumAbsent.textContent,0);assert.equal(nodes.sumPeriods.textContent,1);
 assert.equal(ctx.subV2AbsentForTeacher(day,'t1'),null);assert.equal(ctx.subV2AbsentForTeacher(day,'t1',2),null);
 assert.doesNotMatch(nodes.subContent.innerHTML,/teacher-absent|sub-v2-leave-badge/);assert.match(nodes.subContent.innerHTML,/✓ ครูสอง/);
 assert.match(nodes.subAssignedList.innerHTML,/ครูหนึ่ง ทดสอบ/);assert.match(nodes.subAssignedList.innerHTML,/จัดสอนแทนเฉพาะคาบ/);
 const reload=JSON.parse(JSON.stringify(ctx.DB.substitute));ctx.DB.substitute=reload;await ctx.renderSubContent();assert.match(nodes.subContent.innerHTML,/✓ ครูสอง/);
});
test('second manual period adds one lesson, keeps metadata, and leaves the rest of the day unaffected',()=>{
 const {ctx}=boot();ctx.startSubV2Manual();ctx.picked='ครูสอง ทดสอบ';ctx.confirmSubV2Teacher();
 ctx.setSubWorkType(0,0,'ใบงาน');ctx.setSubMessageStatus(0,0,'ส่งแล้ว');
 ctx.subV2SelectedSlotId='2';ctx.startSubV2Manual();ctx.confirmSubV2Teacher();
 const rows=ctx.getSubDay(ctx.currentSubDate).absentList;assert.equal(rows.length,1);assert.equal(rows[0].periods.length,2);assert.equal(rows[0].periods[0].workType,'ใบงาน');assert.equal(rows[0].periods[0].messageStatus,'ส่งแล้ว');
 ctx.confirmSubV2Teacher();assert.equal(rows[0].periods.length,2);
});
test('confirmation rechecks busy teachers, absences and duplicate replacements before saving',()=>{
 for(const kind of ['busy','absent','assigned']){
  const {ctx}=boot();ctx.startSubV2Manual();ctx.picked='ครูสอง ทดสอบ';
  if(kind==='busy')ctx.DB.sched.r2_1_พุธ={subject:'อังกฤษ',teacher:'ครูสอง ทดสอบ'};
  if(kind==='absent')ctx.getSubDay(ctx.currentSubDate).absentList.push({teacherId:'t2',periods:[]});
  if(kind==='assigned')ctx.getSubDay(ctx.currentSubDate).absentList.push({teacherId:'t3',manualOnly:true,periods:[{slotId:1,roomId:'r2',subTeacher:ctx.picked}]});
  ctx.confirmSubV2Teacher();assert.equal(ctx.writes,0,kind);assert.ok(!ctx.DB.substitute[ctx.currentSubDate]?.absentList.some(a=>a.teacherId==='t1'),kind);
 }
});
test('reader, free period, break, teacher-only activity and changed date cannot create a manual assignment',()=>{
 for(const kind of ['reader','free','break','activity','date']){
  const {ctx,nodes}=boot();
  if(kind==='reader')ctx.SCHOOL_AUTH.loggedIn=false;
  if(kind==='free')delete ctx.DB.sched.r1_1_พุธ;
  if(kind==='break')ctx.subV2SelectedSlotId='3';
  if(kind==='activity'){delete ctx.DB.sched.r1_1_พุธ;ctx.TeacherSchedule.activities=()=>[{subject:'PLC'}];}
  ctx.renderSubSidePanel();if(kind!=='date')assert.doesNotMatch(nodes.subSidePanel.innerHTML,/>จัดสอนแทน<\/button>/,kind);
  ctx.startSubV2Manual();if(kind==='date')ctx.currentSubDate='2026-10-29';ctx.picked='ครูสอง ทดสอบ';ctx.confirmSubV2Teacher();assert.equal(ctx.writes,0,kind);
 }
});
test('three rooms render together, one confirmation covers all and later changes preserve room metadata',async()=>{
 const {ctx,nodes}=boot();ctx.DB.rooms.push({id:'r3',label:'ม.1/3'});
 ctx.DB.sched.r2_1_พุธ={subject:'สังคมศึกษา',teacher2:'ครูหนึ่ง ทดสอบ'};ctx.DB.sched.r3_1_พุธ={subject:'แนะแนว',teacher3:'ครูหนึ่ง ทดสอบ'};
 await ctx.renderSubContent();ctx.renderSubSidePanel();
 for(const text of ['ม.1/1','ม.1/2','ม.1/3','สังคมศึกษา','แนะแนว']){assert.ok(nodes.subContent.innerHTML.includes(text));assert.ok(nodes.subSidePanel.innerHTML.includes(text));}
 ctx.startSubV2Manual();ctx.picked='ครูสอง ทดสอบ';ctx.confirmSubV2Teacher();
 const group=ctx.getSubDay(ctx.currentSubDate).absentList[0];assert.equal(group.periods.length,3);assert.ok(group.periods.every(p=>p.subTeacher===ctx.picked));assert.equal(ctx.writes,1);
 group.periods[0].workType='ใบงาน';group.periods[1].subNote='ทดสอบ';ctx.picked='ครูสาม ทดสอบ';ctx.confirmSubV2Teacher();
 assert.equal(group.periods.length,3);assert.ok(group.periods.every(p=>p.subTeacher===ctx.picked));assert.equal(group.periods[0].workType,'ใบงาน');assert.equal(group.periods[1].subNote,'ทดสอบ');
 await ctx.renderSubContent();assert.equal(nodes.sumPeriods.textContent,1);assert.equal(nodes.sumAssigned.textContent,1);assert.match(nodes.subContent.innerHTML,/3\/3 ห้อง/);
 ctx.subV2ClearAssigned(0,1);assert.ok(group.periods.every(p=>!p.subTeacher));
});
test('summary preserves controls, accessible labels and escapes teacher/lesson text',()=>{
 const {ctx,nodes}=boot();ctx.DB.teachers[0].first='<script>one</script>';ctx.DB.substitute[ctx.currentSubDate]={absentList:[{teacherId:'t1',manualOnly:true,type:'จัดสอนแทนเฉพาะคาบ',periods:[{slotId:1,roomId:'r1',subject:'<b>test</b>'}]}]};
 ctx.renderSubAssignedList();const output=nodes.subAssignedList.innerHTML;
 assert.match(output,/&lt;script&gt;one/);assert.match(output,/&lt;b&gt;test/);assert.doesNotMatch(output,/<script>|<b>test/);
 assert.match(output,/aria-label="รูปแบบงาน/);assert.match(output,/aria-label="บันทึกข้อความ/);assert.match(output,/setSubWorkType\(0,0/);assert.match(output,/subV2EditAssigned\(0,0/);assert.match(output,/<\/section>/);
 assert.equal((output.match(/<td[ >]/g)||[]).length,7);assert.match(output,/data-label="คาบ \/ เวลา"/);assert.match(output,/data-label="วิชา \/ ชั้นเรียน"/);
});
