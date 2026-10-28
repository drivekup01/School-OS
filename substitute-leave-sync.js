// School-OS Substitute page <- Leave API sync
// Purpose: show real leave records in the existing daily timetable.
// Viewing is read-only; an explicit assignment persists the imported absence.
(function(){
  'use strict';

  var leaveByDate={},pending={},epoch=0,leaveError='';
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
        var table=window.PeriodExchange?PeriodExchange.effective(DB,dateStr):DB;
        var cv=table.sched[room.id+'_'+slot.id+'_'+schedDay];
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
      // teacherId from Leave API is the primary key. Name fallback is kept only
      // for old API deployments during migration and can be removed later.
      var t=null;
      if(r.teacherId) t=(DB.teachers||[]).find(function(x){return String(x.id)===String(r.teacherId);});
      if(!t&&!r.teacherId){
        var target=norm(r.name);
        t=(DB.teachers||[]).find(function(x){return teacherName(x)===target;});
      }
      if(!t) return null;
      return {teacherId:t.id,type:r.type||'ลา',note:'',periods:periodsFor(t,dateStr),_leaveApi:true};
    }).filter(Boolean);
  }

  window.getSubViewDay=getSubViewDay=function(dateStr){
    var day=originalGetSubViewDay(dateStr);
    var existing={};
    (day.absentList||[]).forEach(function(a){existing[String(a.teacherId)]=a;});
    apiAbsent(dateStr).forEach(function(a){
      var saved=existing[String(a.teacherId)];
      if(!saved){day.absentList.push(a);existing[String(a.teacherId)]=a;}
      else if(saved.manualOnly){
        // A later leave record expands the view while retaining prior assignments.
        var periods=a.periods.map(function(p){
          var old=(saved.periods||[]).find(function(x){return String(x.slotId)===String(p.slotId)&&String(x.roomId)===String(p.roomId);});
          return Object.assign({},p,old||{});
        });
        (saved.periods||[]).forEach(function(p){if(!periods.some(function(x){return String(x.slotId)===String(p.slotId)&&String(x.roomId)===String(p.roomId);}))periods.push(Object.assign({},p));});
        Object.assign(saved,a,{periods:periods});
        delete saved.manualOnly;
      }
    });
    return day;
  };

  async function fetchLeave(dateStr){
    if(Object.prototype.hasOwnProperty.call(leaveByDate,dateStr))return;
    if(pending[dateStr])return pending[dateStr];
    var version=epoch;
    var task=(async function(){
      try{
        var out;
        if(window.SCHOOL_OS_STORAGE==='firebase'){
          out=await (await window.schoolFirebaseReady).leave('teacherLeave',dateStr);
        }else{
          var base=String(window.SCHOOL_OS_LEAVE_API_URL||'').replace(/\/+$/,'');
          if(!base)throw Error('ยังไม่ได้เชื่อมข้อมูลวันลาครู');
          var res=await fetch(base+'?action=teacherLeave&date='+encodeURIComponent(dateStr)+'&_='+Date.now(),{method:'GET',cache:'no-store'});
          if(!res.ok)throw Error('โหลดข้อมูลวันลาไม่สำเร็จ');
          out=await res.json();
        }
        if(!out||out.ok===false||!Array.isArray(out.rows))throw Error('ข้อมูลวันลาไม่ถูกต้อง');
        if(version===epoch){leaveByDate[dateStr]=out.rows;leaveError='';}
      }catch(e){if(version===epoch)leaveError=e.message||'โหลดข้อมูลวันลาไม่สำเร็จ';}
      finally{if(version===epoch)delete pending[dateStr];}
    })();
    pending[dateStr]=task;
    return task;
  }

  window.loadSubstituteDay=loadSubstituteDay=function(){return originalLoadSubstituteDay();};
  window.loadSubstituteReportDay=async function(dateStr){
    var version=epoch;
    await fetchLeave(dateStr);
    if(version!==epoch)throw Error('ข้อมูลหรือบัญชีเปลี่ยนแล้ว กรุณาเปิดรายงานใหม่');
    if(leaveError)throw Error(leaveError);
    return getSubViewDay(dateStr);
  };

  // Only an explicit assignment copies an imported absence into saved data.
  var originalEnsure=window.ensurePersistentAbsentFromView_ || ensurePersistentAbsentFromView_;
  window.ensurePersistentAbsentFromView_=ensurePersistentAbsentFromView_=function(teacherId){
    var saved=originalEnsure(teacherId);
    if(saved&&!saved.manualOnly)return saved;
    var source=(getSubViewDay(currentSubDate).absentList||[]).find(function(a){return String(a.teacherId)===String(teacherId);});
    if(saved){
      if(source&&!source.manualOnly){Object.assign(saved,JSON.parse(JSON.stringify(source)));delete saved.manualOnly;delete saved._leaveApi;}
      return saved;
    }
    if(!source)return null;
    saved=JSON.parse(JSON.stringify(source));
    delete saved._leaveApi;
    getSubDay(currentSubDate).absentList.push(saved);
    return saved;
  };

  function invalidate(){epoch++;leaveByDate={};pending={};leaveError='';if(currentSubDate)renderSubContent();}
  window.addEventListener('school-leave-updated',invalidate);
  window.addEventListener('school-identity-changed',invalidate);

  // Keep all substitute exports in sync with the daily table view.
  // The legacy exporters read getSubDay(), which contains only saved substitute data
  // and therefore misses leave records that come from the read-only Leave API.
  function withViewDay(dateStr, fn){
    var savedGetSubDay=window.getSubDay;
    window.getSubDay=getSubDay=function(ds){
      return String(ds)===String(dateStr) ? getSubViewDay(ds) : savedGetSubDay(ds);
    };
    try{return fn();}finally{window.getSubDay=getSubDay=savedGetSubDay;}
  }

  function wrapExport(name){
    var original=window[name];
    if(typeof original!=='function') return;
    window[name]=function(){
      var dateStr=currentSubDate || ((document.getElementById('subDate')||{}).value||'');
      if(!dateStr) return original.apply(this,arguments);
      var self=this,args=arguments;
      return withViewDay(dateStr,function(){return original.apply(self,args);});
    };
  }
  ['downloadSubstitutePNG','copySubstituteSummary','shareSubstituteOnline','exportSubstituteDocx'].forEach(wrapExport);

  var originalRenderSubContent=window.renderSubContent || renderSubContent;
  window.renderSubContent=renderSubContent=async function(){
    var dateStr=currentSubDate,version=epoch;
    if(dateStr)await fetchLeave(dateStr);
    if(version!==epoch||dateStr!==currentSubDate)return;
    await originalRenderSubContent();
    var content=document.getElementById('subContent');
    if(leaveError&&content){
      var note=document.createElement('div');
      note.className='alert a-warn';note.setAttribute('role','status');
      note.textContent='ข้อมูลวันลายังไม่พร้อม: '+leaveError;
      content.prepend(note);
    }
  };
})();
