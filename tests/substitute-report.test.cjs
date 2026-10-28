const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../js/substitute-report');
const fixture=()=>({school:{name:'โรงเรียนตัวอย่าง',year:'2569',semester:'2'},teachers:[{id:'t1',first:'ครูหนึ่ง'},{id:'t2',first:'ครูสอง'}],rooms:[{id:'r1',label:'ม.4/1'},{id:'r2',label:'ม.4/2'},{id:'r3',label:'ม.4/3'}],slots:[{id:'s10',label:'คาบที่ 10',start:'16:30',end:'17:20'},{id:'s2',label:'คาบที่ 2',start:'09:20',end:'10:10'},{id:'s1',label:'คาบที่ 1',start:'08:30',end:'09:20'}]});
test('PNG and Word group by substitute teacher, sort each group by period and merge matching rooms',()=>{
 const db=fixture(),day={absentList:[{teacherId:'t1',manualOnly:true,periods:[{slotId:'s10',roomId:'r1',subject:'ไทย',subTeacher:'ครูแทน'},{slotId:'s1',roomId:'r2',subject:'อังกฤษ',subTeacher:'ครูแทน'},{slotId:'s1',roomId:'r1',subject:'อังกฤษ',subTeacher:'ครูแทน'}]},{teacherId:'t2',periods:[{slotId:'s2',roomId:'r3',subject:'คณิตศาสตร์'}]}]},before=JSON.stringify(day),m=R.model(db,'2026-10-27',day);
 assert.deepEqual(m.rows.map(r=>r.number),[1,2,10]);assert.deepEqual(m.rows[0].rooms,['ม.4/1','ม.4/2']);assert.equal(m.periods,3);assert.equal(m.assigned,2);assert.equal(JSON.stringify(day),before);
 assert.equal(m.groups[0].teacher,'ครูแทน');assert.deepEqual(m.groups[0].rows.map(r=>r.number),[1,10]);assert.equal(m.groups[1].pending,true);
 const html=R.html(m,'logo.png');assert.ok(html.indexOf('คาบที่ 1')<html.indexOf('คาบที่ 10'));assert.ok(html.indexOf('คาบที่ 10')<html.indexOf('คาบที่ 2'));assert.match(html,/width:1280px/);assert.match(html,/table-layout:fixed/);assert.equal((html.match(/<table /g)||[]).length,m.groups.length);assert.equal((html.match(/<h2>/g)||[]).length,m.groups.length);assert.equal((html.match(/<th>/g)||[]).length,R.columns.length*m.groups.length);
});
test('different room notes and replacement teachers are retained rather than lost by grouping',()=>{
 const db=fixture(),m=R.model(db,'2026-10-27',{absentList:[{teacherId:'t1',type:'ลากิจ',note:'เหตุผลเพิ่มเติม',periods:[{slotId:'s1',roomId:'r1',subject:'อังกฤษ',subTeacher:'ครู ก',subNote:'แจกใบงาน'},{slotId:'s1',roomId:'r2',subject:'อังกฤษ',subTeacher:'ครู ข',messageStatus:'รอส่ง'}]}]});
 assert.equal(m.rows.length,2);const text=R.html(m,'logo.png');for(const value of ['ครู ก','ครู ข','แจกใบงาน','รอส่ง','เหตุผลเพิ่มเติม'])assert.ok(text.includes(value));
});
test('report content is escaped and empty days have a clear message',()=>{
 const db=fixture();db.school.name='<script>bad</script>';const m=R.model(db,'2026-10-27',{absentList:[]}),html=R.html(m,'logo.png');assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/ไม่มีรายการสอนแทน/);assert.equal(m.periods,0);
});

test('each covering teacher has one named table containing all assigned periods in ascending order',()=>{
 const m=R.model(fixture(),'2026-10-28',{absentList:[{teacherId:'t1',periods:[{slotId:'s10',roomId:'r1',subject:'ไทย',subTeacher:'ครู ก'},{slotId:'s2',roomId:'r2',subject:'ไทย',subTeacher:'ครู ข'},{slotId:'s1',roomId:'r3',subject:'ไทย',subTeacher:'ครู ก'}]}]});
 assert.deepEqual(m.groups.flatMap(g=>g.rows).map(r=>[r.replacement,r.number]),[['ครู ก',1],['ครู ก',10],['ครู ข',2]]);
 const html=R.html(m,'logo.png');assert.equal((html.match(/<table /g)||[]).length,2);assert.equal((html.match(/<thead>/g)||[]).length,2);assert.equal((html.match(/ครูสอนแทน: ครู ก/g)||[]).length,1);assert.equal((html.match(/ครูสอนแทน: ครู ข/g)||[]).length,1);assert.ok(html.indexOf('คาบที่ 1')<html.indexOf('คาบที่ 10'));assert.ok(html.indexOf('คาบที่ 10')<html.indexOf('ครูสอนแทน: ครู ข'));
});
