
(function(){
  var SAFE_LOGO_URL='https://drivekup01.github.io/School-OS/assets/school-logo.svg';
  var ready={core:false,schedule:false,substitute:false};
  var pending={};
  var fullReady=false;
  var fullLoadPromise=null;

  function badge(text,cls){
    var el=document.getElementById('onlineDbBadge');
    if(!el){el=document.createElement('div');el.id='onlineDbBadge';var host=document.querySelector('.public-topbar-tools');(host||document.body).appendChild(el);}
    el.className=cls||''; el.textContent=text;
  }
  async function getApi(action,timeoutMs){
    if(window.SCHOOL_OS_STORAGE==='firebase')return (await window.schoolFirebaseReady).read(action,true);
    var url=window.SCHOOL_OS_API_URL||'';
    if(!url) throw new Error('ยังไม่ได้เชื่อม School-OS API');
    var sep=url.indexOf('?')>=0?'&':'?';
    var ctrl=new AbortController();
    var timer=setTimeout(function(){ctrl.abort();},timeoutMs||12000);
    try{
      var req=url+sep+'action='+encodeURIComponent(action)+'&_='+Date.now();
      var res=await fetch(req,{method:'GET',redirect:'follow',cache:'no-store',signal:ctrl.signal});
      if(!res.ok) throw new Error('HTTP '+res.status);
      var payload=await res.json();
      if(!payload||!payload.ok) throw new Error((payload&&payload.error)||'ข้อมูลไม่ถูกต้อง');
      return payload;
    }catch(err){
      if(err&&err.name==='AbortError') throw new Error(action+' โหลดเกินเวลาที่กำหนด');
      throw err;
    }finally{
      clearTimeout(timer);
    }
  }
  function applyHome(data){
    data=data||{};
    DB.school=DB.school||{};
    if(data.year) DB.school.year=data.year;
    DB.announcements=Array.isArray(data.announcements)?data.announcements:[];
    if(data.systemMode) DB.systemMode=data.systemMode;
    if(typeof updateTopbar==='function') updateTopbar();
    if(typeof renderDashboardAnnouncements==='function') renderDashboardAnnouncements();
    if(currentPage==='announcements'&&typeof renderAnnouncements==='function') renderAnnouncements();
  }
  async function getStaticJson(path,timeoutMs){
    if(window.SCHOOL_OS_STORAGE==='firebase'){var action=path.includes('home')?'home':path.includes('schedule')?'schedule':'core';return (await (await window.schoolFirebaseReady).read(action)).data;}
    var ctrl=new AbortController();
    var timer=setTimeout(function(){ctrl.abort();},timeoutMs||8000);
    try{
      var res=await fetch(path,{method:'GET',cache:'no-cache',signal:ctrl.signal});
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }finally{
      clearTimeout(timer);
    }
  }
  async function loadHome(){
    badge('กำลังโหลดข้อมูลหน้าแรก...','');
    try{
      var data=await getStaticJson('database/home.json',5000);
      applyHome(data);
      badge('● ฐานข้อมูลพร้อมใช้งาน','ok');
      return true;
    }catch(staticErr){
      try{
        var payload=await getApi('home',10000);
        applyHome(payload.data);
        badge('● ฐานข้อมูลโรงเรียนออนไลน์','ok');
        return true;
      }catch(err){
        badge('ฐานข้อมูลหน้าแรกเชื่อมต่อไม่ได้','err');
        console.warn('School-OS Home JSON/API:',staticErr,err);
        return false;
      }
    }
  }
  function mergeData(part){
    part=part||{};
    ['school','teachers','subjects','rooms','slots','days','customDepts','subjectColorSchemeVersion','systemMode','sched','teacherSched','exchanges','exchangeTerm','substitute'].forEach(function(k){
      if(part[k]!==undefined) DB[k]=part[k];
    });
  }

  function finalizeLoadedDatabase(){
    DB.school=DB.school||{};
    if(!DB.school.logoDataUrl) DB.school.logoDataUrl=DB.school.logoUrl||SAFE_LOGO_URL;
    if(!DB.school.logoUrl) DB.school.logoUrl=DB.school.logoDataUrl||SAFE_LOGO_URL;
    DB.customDepts=DB.customDepts||[];

    var wiz=document.getElementById('setupWizard');
    if(wiz) wiz.style.display='none';
    if(typeof applySubjectColorScheme==='function') applySubjectColorScheme(false);
    if(typeof refreshAllDeptDropdowns==='function') refreshAllDeptDropdowns();
    if(typeof renderCustomDeptList==='function') renderCustomDeptList();
    if(typeof renderAllUI==='function') renderAllUI();
    else {updateTopbar();updateSidebarCounts();renderDashboard();}
  }

  async function loadMainFromStatic(){
    var parts=await Promise.all([
      getStaticJson('database/core.json',8000),
      getStaticJson('database/schedule.json',8000)
    ]);
    mergeData(parts[0]);
    mergeData(parts[1]);
    ready.core=true;
    ready.schedule=true;
    return true;
  }

  async function loadMainFromApi(){
    // Emergency/manual fallback only. Normal page load uses static JSON.
    var payload=await getApi('bootstrap',300000);
    var data=payload.data||{};
    mergeData({
      school:data.school||{},
      teachers:data.teachers||[],
      subjects:data.subjects||[],
      rooms:data.rooms||[],
      slots:data.slots||[],
      days:data.days||[],
      customDepts:data.customDepts||[],
      subjectColorSchemeVersion:data.subjectColorSchemeVersion||2,
      systemMode:data.systemMode||'DAILY',
      sched:data.sched||{},
      teacherSched:data.teacherSched||{},
      substitute:data.substitute||{}
    });
    if(Array.isArray(data.announcements)) DB.announcements=data.announcements;
    ready.core=true;
    ready.schedule=true;
    return true;
  }

  async function loadDatabaseOnce(force){
    if(fullLoadPromise) return fullLoadPromise;
    if(fullReady && !force) return true;

    badge(force?'กำลังรีเฟรชฐานข้อมูล...':'กำลังโหลดฐานข้อมูล...','');
    fullLoadPromise=(async function(){
      try{
        if(force){
          await loadMainFromApi();
        }else{
          try{
            await loadMainFromStatic();
          }catch(staticErr){
            console.warn('School-OS static JSON unavailable; using API fallback:',staticErr);
            await loadMainFromApi();
          }
        }

        fullReady=true;
        finalizeLoadedDatabase();
        if(typeof rememberCurrentSaveState==='function') rememberCurrentSaveState();
        badge('● ฐานข้อมูลพร้อมใช้งาน','ok');
        return true;
      }catch(err){
        fullReady=false;
        var detail=(err&&err.message)?err.message:String(err||'ไม่ทราบสาเหตุ');
        badge('โหลดฐานข้อมูลไม่สำเร็จ: '+detail,'err');
        console.error('School-OS DB:',err);
        throw err;
      }finally{
        fullLoadPromise=null;
      }
    })();
    return fullLoadPromise;
  }

  async function refreshDatabase(){
    return loadDatabaseOnce(true);
  }

  window.SCHOOL_ONLINE={
    loadHome:loadHome,
    loadDatabaseOnce:loadDatabaseOnce,
    refreshDatabase:refreshDatabase,
    isReady:function(){return fullReady;},
    isLoading:function(){return !!fullLoadPromise;},
    reset:function(){fullReady=false;ready.core=false;ready.schedule=false;}
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',loadHome);
  else setTimeout(loadHome,0);
})();
