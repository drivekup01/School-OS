
// Semester report reads saved substitute assignments only; it never changes the database.
function subAcademicPeriod(date){
  var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date||'');
  if(!m)return null;
  var y=+m[1],month=+m[2],d=+m[3],check=new Date(Date.UTC(y,month-1,d));
  if(check.getUTCFullYear()!==y||check.getUTCMonth()!==month-1||check.getUTCDate()!==d)return null;
  return {year:y+543-(month<5?1:0),term:month>=5&&month<=10?1:2};
}
function subSemesterTotals(db,year,term){
  var names=new Map(),rows=new Map(),seen=new Set();
  (db.teachers||[]).forEach(function(t){var name=((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim();var key='id:'+t.id;names.set(name,key);rows.set(key,{name:name||'ไม่ระบุชื่อ',count:0});});
  Object.keys(db.substitute||{}).forEach(function(date){
    var period=subAcademicPeriod(date);if(!period||period.year!==+year||period.term!==+term)return;
    ((db.substitute[date]||{}).absentList||[]).forEach(function(a){(a.periods||[]).forEach(function(p){
      var name=String(p.subTeacher||'').trim();if(!name||p.slotId==null||p.slotId==='')return;
      var slot=(db.slots||[]).find(function(s){return String(s.id)===String(p.slotId);});if(slot&&slot.isBreak)return;
      var key=names.get(name)||'name:'+name,unique=JSON.stringify([date,String(p.slotId),key]);if(seen.has(unique))return;seen.add(unique);
      if(!rows.has(key))rows.set(key,{name:name,count:0});rows.get(key).count++;
    });});
  });
  return Array.from(rows.values()).sort(function(a,b){return b.count-a.count||a.name.localeCompare(b.name,'th');});
}
var subSemesterSelection=null;
function renderSubSemesterReport(){
  var host=document.getElementById('subSemesterReport');if(!host)return;
  var today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  var now=subAcademicPeriod(today)||subAcademicPeriod(new Date().toISOString().slice(0,10));
  if(!subSemesterSelection)subSemesterSelection={year:now.year,term:now.term};
  var selected=subSemesterSelection,years=new Set([now.year,selected.year]);
  Object.keys(DB.substitute||{}).forEach(function(d){var p=subAcademicPeriod(d);if(p)years.add(p.year);});
  var e=function(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var rows=subSemesterTotals(DB,selected.year,selected.term),total=rows.reduce(function(n,r){return n+r.count;},0);
  host.innerHTML='<h2 style="margin:0 0 12px">📊 สรุปรายงานสอนแทน</h2><div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center"><label>ภาคเรียน <select id="subReportTerm" onchange="subSemesterSelection.term=+this.value;renderSubSemesterReport()">'+[1,2].map(function(t){return '<option value="'+t+'"'+(t===selected.term?' selected':'')+'>'+t+'</option>';}).join('')+'</select></label><label>ปีการศึกษา <select id="subReportYear" onchange="subSemesterSelection.year=+this.value;renderSubSemesterReport()">'+Array.from(years).sort(function(a,b){return b-a;}).map(function(y){return '<option'+(y===selected.year?' selected':'')+'>'+y+'</option>';}).join('')+'</select></label><button class="btn btn-out btn-sm" onclick="subSemesterSelection=null;renderSubSemesterReport()">ปีการศึกษาปัจจุบัน</button></div><p>รวม <strong>'+total+'</strong> คาบ · ครูที่มีรายการสอนแทน <strong>'+rows.filter(function(r){return r.count>0;}).length+'</strong> คน</p><p style="color:var(--muted);font-size:12px">ภาคเรียน 1: พ.ค.–ต.ค. · ภาคเรียน 2: พ.ย.–เม.ย. ปีถัดไป · ครูคนเดียวกันสอนหลายห้องในวันและคาบเดียวกัน นับ 1 คาบ</p>'+(total?'':'<p role="status">ยังไม่มีรายการสอนแทนที่บันทึกไว้ในภาคเรียนนี้</p>')+'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ลำดับ</th><th>ชื่อครูสอนแทน</th><th>จำนวนคาบ</th></tr></thead><tbody>'+rows.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td>'+e(r.name)+'</td><td><strong>'+r.count+'</strong></td></tr>';}).join('')+'</tbody><tfoot><tr><th colspan="2">รวมทั้งหมด</th><th>'+total+'</th></tr></tfoot></table></div>';
}
