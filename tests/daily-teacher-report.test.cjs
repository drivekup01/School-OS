const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../js/daily-teacher-report');
const fixture=()=>({school:{name:'School',year:2569,semester:2},teachers:[{id:'a',first:'A'},{id:'b',first:'B'},{id:'c',first:'C'}],subjects:[],rooms:[{id:'r1',label:'ม.1/1',baseRoom:'123'},{id:'r2',label:'ม.1/2',baseRoom:'124'}],days:['พุธ','พฤหัสบดี'],slots:[{id:1,label:'1',start:'08:30',end:'09:20'},{id:2,label:'2',start:'09:20',end:'10:10'},{id:3,label:'พัก',start:'11:00',end:'12:00',isBreak:true}],sched:{'r1_1_พุธ':{subject:'Math',teacher:'A'},'r1_2_พุธ':{subject:'Math',teacher:'A'},'r2_1_พฤหัสบดี':{subject:'Thai',teacher:'C'}}});
test('all teachers and breaks remain; replacements only on selected date weekday, consecutive slots stay separate',()=>{
 const db=fixture(),day={absentList:[{teacherId:'a',periods:[{slotId:1,roomId:'r1',subTeacher:'B'}]}]},before=JSON.stringify({db,day}),m=R.model(db,'2026-10-28',day);
 assert.equal(m.rows.length,3);assert.equal(m.slots.length,3);assert.equal(m.rows[1].cells['1'][0].kind,'substitute');assert.equal(m.rows[0].cells['1'][0].kind,'absent');assert.equal(m.rows[0].cells['2'][0].kind,'pending');assert.equal(m.pending,1);assert.equal(m.assigned,1);assert.equal(m.rows[1].cells['1'][0].location,'123');assert.equal(JSON.stringify({db,day}),before);
 const thursday=R.model(db,'2026-10-29',{});assert.equal(thursday.rows[0].cells['1'].length,0);assert.equal(thursday.rows[2].cells['1'][0].subject,'Thai');
});
test('manual substitution changes one slot only and preserves multiroom and teacher-only lessons',()=>{
 const db=fixture();db.sched['r2_1_พุธ']={subject:'Math',teacher:'A',teacher2:'C',learnRoom:'Lab'};db.teacherSched={x:{teacherId:'b',slotId:2,day:'พุธ',subject:'PLC'}};
 const m=R.model(db,'2026-10-28',{absentList:[{teacherId:'a',manualOnly:true,periods:[{slotId:1,roomId:'r1',subTeacher:'B'},{slotId:1,roomId:'r2',subTeacher:'B'}]}]});
 assert.equal(m.periods,1);assert.equal(m.assigned,1);assert.equal(m.rows[0].cells['2'][0].kind,'normal');assert.equal(m.rows[1].cells['1'].length,2);assert.equal(m.rows[1].cells['2'][0].subject,'PLC');assert.equal(m.rows[2].cells['1'][0].location,'Lab');
});
test('unmatched replacement is pending, never silently marked done; conflicts are visible',()=>{
 const db=fixture();let m=R.model(db,'2026-10-28',{absentList:[{teacherId:'a',periods:[{slotId:1,roomId:'r1',subTeacher:'Unknown'}]}]});assert.equal(m.assigned,0);assert.match(m.warnings.join(''),/Unknown/);
 db.sched['r2_1_พุธ']={subject:'Thai',teacher:'B'};m=R.model(db,'2026-10-28',{absentList:[{teacherId:'a',manualOnly:true,periods:[{slotId:1,roomId:'r1',subTeacher:'B'}]}]});assert.match(m.warnings.join(''),/ซ้อน/);assert.equal(m.rows[1].cells['1'].length,2);
});
test('exchange and combined labels follow explicit stored work types; HTML escapes content and includes legend/date',()=>{
 const db=fixture();db.school.name='<script>alert(1)</script>';const m=R.model(db,'2026-10-28',{absentList:[{teacherId:'a',periods:[{slotId:1,roomId:'r1',subTeacher:'B',workType:'แลกคาบ'},{slotId:2,roomId:'r1',subTeacher:'C',workType:'ควบชั้น',subNote:'<bad>'}]}]});
 assert.equal(m.rows[1].cells['1'][0].kind,'swap');assert.equal(m.rows[2].cells['2'][0].kind,'combined');const html=R.html(m);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;bad&gt;/);assert.match(html,/2569/);assert.match(html,/ยังขาดครูสอนแทน/);
});
test('weekend is visibly unscheduled and impossible dates rejected',()=>{assert.equal(R.model(fixture(),'2026-10-31',{}).scheduled,false);assert.throws(()=>R.model(fixture(),'2026-02-30',{}));});

test('single-digit hours sort chronologically and equivalent simultaneous class lessons display once',()=>{
 const db=fixture();db.slots=[{id:3,label:'3',start:'10:10',end:'11:00'},{id:1,label:'1',start:'8:30',end:'9:20'},{id:2,label:'2',start:'9:20',end:'10:10'}];
 const m=R.model(db,'2026-10-28',{});assert.deepEqual(m.slots.map(s=>s.id),[1,2,3]);assert.match(R.html(m),/08:30–09:20/);
 const common={subject:'English',location:'หอประชุม',kind:'substitute',source:'A',rooms:['ม.5/1']};const cells=[common,{...common,rooms:['ม.5/2']},{...common,rooms:['ม.5/3']}],before=JSON.stringify(cells),display=R.displayLessons(cells);
 assert.equal(display.length,1);assert.equal(R.roomLabel(display[0].rooms),'ม.5/1–3');assert.equal(JSON.stringify(cells),before);
 assert.equal(R.displayLessons([...cells,{...common,location:'Lab',rooms:['ม.5/4']}]).length,2);
 assert.equal(R.displayLessons([...cells,{...common,note:'Different instructions',rooms:['ม.5/4']}]).length,2);
 assert.equal(R.displayLessons([...cells,{...common,source:'B',rooms:['ม.5/4']}]).length,2);
});
