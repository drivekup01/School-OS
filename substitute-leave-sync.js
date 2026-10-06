// School-OS Substitute page <- Leave API sync (read-only V1)
// Purpose: show real leave records in the existing daily timetable.
// Does not write DB.substitute and does not change the locked Leave History module.
(function(){
  'use strict';

  var leaveByDate={};
  var originalGetSubViewDay=window.getSubViewDay || getSubViewDay;
  var originalLoadSubstituteDay=window.loadSubstituteDay || loadSubstituteDay;

  function norm(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function teacherName(t){return norm((t.prefix||'')+(t.first||'')+' '+(t.last||''));}

  function periodsFor(t,dateStr){
    var schedDay=mapDayNameToSched(dateStr);
    var name=teacherName(t);
    var periods=[];
    (DB.rooms||[]).forEach(function(room){
      (DB.slots||[]).forEach(function(slot){
        if(slot.isBreak) return;
        var cv=DB.sched[room.id+'_'+slot.id+'_'+schedDay];
        if(!cv||!cv.subject) return;
        if(cv.teacher!==name&&cv.teacher2!==name&&cv.teacher3!==name) return;
        periods.push({slotId:slot.id,day:schedDay,roomId:room.id,subject:cv.subject||'',subTeacher:'',subNote:''});
      });
    });
    return periods;
  }

  function apiAbsent(dateStr){
    var rows=leaveByDate[dateStr];
    if(!Array.isArray(rows)) return [];
    return rows.map(function(r){
      var target=norm(r.name);
      var t=(DB.teachers||[]).find(function(x){return teacherName(x)===target;});
      if(!t) return null;
      return {teacherId:t.id,type:r.type||'ลา',note:'',periods:periodsFor(t,dateStr),_leaveApi:true};
    }).filter(Boolean);
  }

  window.getSubViewDay=getSubViewDay=function(dateStr){
    var day=originalGetSubViewDay(dateStr);
    var existing={};
    (day.absentList||[]).forEach(function(a){existing[String(a.teacherId)]=true;});
    apiAbsent(dateStr).forEach(function(a){
      if(!existing[String(a.teacherId)]) day.absentList.push(a);
    });
    return day;
  };

  async function fetchLeave(dateStr){
    var base=String(window.SCHOOL_OS_LEAVE_API_URL||'').replace(/\/+$/,'');
    if(!base) return;
    try{
      var res=await fetch(base+'?action=teacherLeave&date='+encodeURIComponent(dateStr)+'&_='+Date.now(),{method:'GET',cache:'no-store'});
      var out=await res.json();
      leaveByDate[dateStr]=(out&&out.ok!==false&&Array.isArray(out.rows))?out.rows:[];
    }catch(e){
      leaveByDate[dateStr]=[];
    }
  }

  window.loadSubstituteDay=loadSubstituteDay=function(){
    originalLoadSubstituteDay();
    var dateStr=(document.getElementById('subDate')||{}).value||'';
    if(!dateStr) return;
    fetchLeave(dateStr).then(function(){
      if(currentSubDate===dateStr) renderSubContent();
    });
  };

  // V1 display rule requested: leave row/cells are gray; teaching cells keep subject+room and show "ลา".
  var style=document.createElement('style');
  style.textContent=
    '.sub-v2-table tr.teacher-absent td{background:#f1f3f5!important;}'+
    '.sub-v2-table tr.teacher-absent .sub-v2-cell{background:#e5e7eb!important;border-color:#d1d5db!important;color:#374151!important;}'+
    '.sub-v2-table tr.teacher-absent .sub-v2-cell .sub-v2-action{color:#6b7280!important;}';
  document.head.appendChild(style);

  var originalRenderSubContent=window.renderSubContent || renderSubContent;
  window.renderSubContent=renderSubContent=function(){
    originalRenderSubContent();
    var rows=document.querySelectorAll('#subContent tr.teacher-absent');
    rows.forEach(function(row){
      row.querySelectorAll('.sub-v2-action').forEach(function(el){
        if(el.textContent.indexOf('เลือกครูแทน')>=0) el.textContent='ลา';
      });
    });
  };
})();