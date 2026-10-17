// School-OS Leave -> Timetable bridge.
// Read-only. Does not modify Leave History, DB, login, bootstrap or timetable data.
(function(){
  'use strict';

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function norm(v){ return String(v||'').replace(/\s+/g,' ').trim(); }
  function fullName(t){ return norm((t.prefix||'')+(t.first||'')+' '+(t.last||'')); }
  function dayFromIso(iso){
    var m=String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return '';
    var d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
    return ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][d.getDay()]||'';
  }
  function findTeacher(name){
    if(!window.DB||!Array.isArray(DB.teachers)) return null;
    var target=norm(name);
    return DB.teachers.find(function(t){return fullName(t)===target;})||null;
  }
  function affectedPeriods(teacher,day){
    if(!teacher||!window.DB||!DB.sched) return [];
    var name=fullName(teacher), out=[];
    (DB.slots||[]).forEach(function(sl){
      if(sl.isBreak) return;
      (DB.rooms||[]).forEach(function(room){
        var cv=DB.sched[room.id+'_'+sl.id+'_'+day];
        if(!cv||!cv.subject) return;
        if(cv.teacher!==name&&cv.teacher2!==name&&cv.teacher3!==name) return;
        out.push({
          slot:sl.label||('คาบ '+sl.id),
          time:(sl.start||'')+(sl.end?'–'+sl.end:''),
          subject:cv.subject||'',
          room:room.label||'',
          learnRoom:cv.learnRoom||''
        });
      });
    });
    return out;
  }
  function ensureBox(){
    var root=document.getElementById('leaveTestResult');
    if(!root) return null;
    var old=document.getElementById('leaveAffectedSchedule');
    if(old) old.remove();
    var box=document.createElement('div');
    box.id='leaveAffectedSchedule';
    box.style.marginTop='14px';
    root.parentNode.insertBefore(box,root.nextSibling);
    return box;
  }

  window.renderLeaveAffectedSchedule=function(rows,iso){
    var box=ensureBox();
    if(!box) return;
    if(!Array.isArray(rows)||!rows.length){ box.innerHTML=''; return; }
    var day=dayFromIso(iso);
    var html='<div class="card" style="margin-top:14px"><div class="card-hd"><div class="card-title">📚 คาบสอนที่ได้รับผลกระทบ</div></div><div style="padding:0 16px 16px">';
    rows.forEach(function(r){
      var teacher=findTeacher(r.name);
      html+='<div style="margin-top:12px;font-weight:800;color:#173a6b">'+esc(r.name)+'</div>';
      if(!teacher){
        html+='<div class="alert a-warn" style="margin-top:8px">ไม่พบชื่อครูนี้แบบตรงกันในฐานข้อมูล School-OS</div>';
        return;
      }
      var periods=affectedPeriods(teacher,day);
      if(!periods.length){
        html+='<div style="padding:10px 0;color:#7787A2">ไม่มีคาบสอนในวัน'+esc(day)+'</div>';
        return;
      }
      html+='<div style="overflow:auto;margin-top:8px"><table class="tbl"><thead><tr><th>คาบ</th><th>เวลา</th><th>วิชา</th><th>ห้อง</th><th>ห้องเรียน</th></tr></thead><tbody>'+
        periods.map(function(p){return '<tr><td>'+esc(p.slot)+'</td><td>'+esc(p.time)+'</td><td>'+esc(p.subject)+'</td><td>'+esc(p.room)+'</td><td>'+esc(p.learnRoom||'-')+'</td></tr>';}).join('')+
        '</tbody></table></div>';
    });
    box.innerHTML=html+'</div></div>';
  };
})();