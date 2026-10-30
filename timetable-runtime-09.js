
window.SCHOOL_AUTH = window.SCHOOL_AUTH || {loggedIn:false,token:'',role:'guest',mode:'DAILY'};

function publicApiUrl(){ return window.SCHOOL_OS_API_URL || ''; }

async function postSchoolApi(params){
  if(window.SCHOOL_OS_STORAGE==='firebase')return (await window.schoolFirebaseReady).post(params);
  var url=publicApiUrl();
  if(!url) throw new Error('ยังไม่ได้เชื่อม School-OS API');
  var body=new URLSearchParams();
  Object.keys(params||{}).forEach(function(k){body.append(k,params[k]==null?'':params[k]);});
  var ctrl=new AbortController();
  var timeoutMs=(params&&params.action==='login')?25000:(params&&params.action==='saveDatabase')?30000:10000;
  var timer=setTimeout(function(){ctrl.abort();},timeoutMs);
  try{
    var res=await fetch(url,{method:'POST',body:body,redirect:'follow',signal:ctrl.signal});
    var out=await res.json();
    if(!out.ok) throw new Error(out.error||'ดำเนินการไม่สำเร็จ');
    return out;
  }catch(e){
    if(e&&e.name==='AbortError'){
      if(params&&params.action==='login') throw new Error('ระบบ Login ตอบช้า กรุณาลองอีกครั้ง');
      throw new Error('เซิร์ฟเวอร์ตอบช้าเกิน 10 วินาที');
    }
    throw e;
  }finally{
    clearTimeout(timer);
  }
}
function setModeButtons(){
  var s=document.getElementById('modeSetupBtn'),d=document.getElementById('modeDailyBtn');
  if(s) s.classList.toggle('active',SCHOOL_AUTH.mode==='SETUP');
  if(d) d.classList.toggle('active',SCHOOL_AUTH.mode==='DAILY');
}
function canAccessPage(p){
  if(window.SCHOOL_OS_STORAGE==='firebase')return window.schoolFirebaseCanAccess?window.schoolFirebaseCanAccess(p):['dashboard','teacher-view','teacher-all','substitute','export'].includes(p);
  var guestAllowed=['dashboard','teacher-view','teacher-all','substitute','export','announcements'];
  var supportAllowed=['dashboard','teacher-view','teacher-all','substitute','sub-history','leave-test'];
  var dailyAllowed=['dashboard','teacher-view','teacher-all','substitute','sub-history','announcements','leave-test'];
  if(!SCHOOL_AUTH.loggedIn) return guestAllowed.indexOf(p)>=0;
  if(SCHOOL_AUTH.role==='support') return supportAllowed.indexOf(p)>=0;
  if(SCHOOL_AUTH.mode==='DAILY') return dailyAllowed.indexOf(p)>=0;
  return true;
}
function applyAccessUI(){
  var b=document.body;
  b.classList.toggle('guest-mode',!SCHOOL_AUTH.loggedIn);
  b.classList.toggle('admin-mode',SCHOOL_AUTH.loggedIn&&SCHOOL_AUTH.role==='admin');
  b.classList.toggle('support-mode',SCHOOL_AUTH.loggedIn&&SCHOOL_AUTH.role==='support');
  b.classList.toggle('setup-mode',SCHOOL_AUTH.loggedIn&&SCHOOL_AUTH.role==='admin'&&SCHOOL_AUTH.mode==='SETUP');
  b.classList.toggle('daily-mode',SCHOOL_AUTH.loggedIn&&SCHOOL_AUTH.mode==='DAILY');
  var g=document.getElementById('guestLoginBox'),a=document.getElementById('adminTopBox');
  if(g) g.style.display=SCHOOL_AUTH.loggedIn?'none':'flex';
  if(a) a.style.display=SCHOOL_AUTH.loggedIn?'flex':'none';
  var roleTitle=document.getElementById('loginRoleTitle');
  var roleDesc=document.getElementById('loginRoleDescription');
  if(SCHOOL_AUTH.loggedIn){
    if(roleTitle) roleTitle.textContent=SCHOOL_AUTH.role==='support'?'Support':'Admin';
    if(roleDesc) roleDesc.textContent=SCHOOL_AUTH.role==='support'?'ผู้ดูแลระบบจัดสอนแทน':'ผู้ดูแลระบบ';
  }

  document.querySelectorAll('.dashboard-shortcut[data-page]').forEach(function(btn){
    btn.style.display=canAccessPage(btn.getAttribute('data-page'))?'flex':'none';
  });

  if(currentPage==='announcements') renderAnnouncements();
  setModeButtons();
  var title=document.getElementById('publicSchoolTitle');
  if(title&&window.DB&&DB.school&&DB.school.name) title.textContent=DB.school.name;
}
function toggleLoginSecret(){
  var el=document.getElementById('academicLoginPass');
  if(!el) return;
  var reveal=el.type==='password';
  el.type=reveal?'text':'password';
  var btn=document.querySelector('.login-secret-toggle');
  if(btn) btn.textContent=reveal?'🙈':'👁';
  el.focus();
}
var academicLoginPending=false;
async function academicLogin(){
  if(window.SCHOOL_OS_STORAGE==='firebase'){try{return await (await window.schoolFirebaseReady).login();}catch(e){toast(e.message,'err');return;}}
  if(academicLoginPending) return;
  var id=(document.getElementById('academicLoginId')||{}).value||'';
  var pass=(document.getElementById('academicLoginPass')||{}).value||'';
  if(!id||!pass){toast('กรุณากรอก ID และ Password','warn');return;}

  var btn=document.getElementById('academicLoginBtn');
  var status=document.getElementById('academicLoginStatus');
  var slowTimer=null;
  academicLoginPending=true;
  if(btn){btn.disabled=true;btn.textContent='⏳ กำลังเข้าสู่ระบบ...';}
  if(status){status.textContent='กำลังตรวจสอบบัญชี...';status.setAttribute('aria-live','polite');}
  slowTimer=setTimeout(function(){
    if(academicLoginPending&&status) status.textContent='ระบบกำลังตอบกลับ กรุณารอสักครู่...';
  },4000);

  try{
    var out=await postSchoolApi({action:'login',id:id,password:pass});
    SCHOOL_AUTH.loggedIn=true;SCHOOL_AUTH.token=out.token;SCHOOL_AUTH.role=out.role||'admin';SCHOOL_AUTH.mode=out.systemMode||'SETUP';
    sessionStorage.setItem('school_os_admin_token',SCHOOL_AUTH.token);
    sessionStorage.setItem('school_os_admin_mode',SCHOOL_AUTH.mode);
    sessionStorage.setItem('school_os_auth_role',SCHOOL_AUTH.role);
    document.getElementById('academicLoginPass').value='';
    if(status) status.textContent='เข้าสู่ระบบสำเร็จ · กำลังโหลดฐานข้อมูล...';
    if(window.SCHOOL_ONLINE&&typeof SCHOOL_ONLINE.loadDatabaseOnce==='function'){
      try{
        await SCHOOL_ONLINE.loadDatabaseOnce();
      }catch(loadErr){
        applyAccessUI();
        if(status) status.textContent='เข้าสู่ระบบสำเร็จ แต่โหลดฐานข้อมูลไม่สำเร็จ';
        toast('เข้าสู่ระบบแล้ว แต่โหลดฐานข้อมูลไม่สำเร็จ: '+(loadErr.message||loadErr),'warn');
        return;
      }
    }
    if(status) status.textContent='พร้อมใช้งาน';
    applyAccessUI();
    toast('✅ เข้าสู่ระบบฝ่ายวิชาการแล้ว','succ');
  }catch(e){
    if(status) status.textContent='เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบแล้วลองอีกครั้ง';
    toast('เข้าสู่ระบบไม่สำเร็จ: '+e.message,'warn');
  }finally{
    clearTimeout(slowTimer);
    academicLoginPending=false;
    if(btn){btn.disabled=false;btn.textContent='🔑 เข้าสู่ระบบ';}
    if(!SCHOOL_AUTH.loggedIn&&status){
      setTimeout(function(){
        if(!academicLoginPending&&!SCHOOL_AUTH.loggedIn) status.textContent='สำหรับฝ่ายวิชาการและผู้ดูแลระบบ';
      },3500);
    }
  }
}
async function academicLogout(){
  if(window.SCHOOL_OS_STORAGE==='firebase'){try{return await (await window.schoolFirebaseReady).logout();}catch(e){toast(e.message,'err');return;}}
  var oldToken=SCHOOL_AUTH.token||'';
  onlineSaveGeneration++;
  onlineSavePending=false;
  lastSavedSnapshotKey='';
  clearTimeout(saveTimer);
  saveTimer=null;
  SCHOOL_AUTH={loggedIn:false,token:'',role:'guest',mode:'DAILY'};
  window.SCHOOL_AUTH=SCHOOL_AUTH;
  sessionStorage.removeItem('school_os_admin_token');sessionStorage.removeItem('school_os_admin_mode');sessionStorage.removeItem('school_os_auth_role');
  applyAccessUI();nav('dashboard');toast('ออกจากระบบแล้ว','info');
  if(oldToken){
    postSchoolApi({action:'logout',token:oldToken}).catch(function(){});
  }
}
async function switchSystemMode(mode){
  if(!SCHOOL_AUTH.loggedIn || SCHOOL_AUTH.role!=='admin') return;

  try{
    var out=await postSchoolApi({action:'setMode',token:SCHOOL_AUTH.token,mode:mode});
    SCHOOL_AUTH.mode=out.systemMode;sessionStorage.setItem('school_os_admin_mode',SCHOOL_AUTH.mode);
    if(window.DB) DB.systemMode=SCHOOL_AUTH.mode;
    applyAccessUI();nav('dashboard');
    toast(SCHOOL_AUTH.mode==='SETUP'?'🔓 SETUP: เปิดการจัดการข้อมูล':'🔒 DAILY: ล็อกข้อมูลหลักแล้ว','succ');
  }catch(e){
    toast(e.message,'warn');
    if(/Session/.test(e.message)) academicLogout();
  }
}
function renderTeacherAll(query){
  if(window.SCHOOL_OS_STORAGE==='firebase'){nav('substitute');return;}
  var el=document.getElementById('teacherAllContent');if(!el||!window.DB)return;
  var q=String(query==null?((document.getElementById('teacherAllSearch')||{}).value||''):query).trim().toLowerCase();
  var list=(DB.teachers||[]).filter(function(t){
    var n=((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim();
    return !q || n.toLowerCase().indexOf(q)>=0 || String(t.dept||'').toLowerCase().indexOf(q)>=0;
  });
  if(!list.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-text">ไม่พบรายชื่อครู</div></div>';return;}
  el.innerHTML=list.map(function(t){
    var n=((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim();
    return '<div class="teacher-all-card"><div class="teacher-all-head"><div><div class="teacher-all-name">'+subV2Escape(n)+'</div><div class="teacher-all-dept">'+subV2Escape(t.dept||'ไม่ระบุกลุ่มสาระ')+'</div></div>'+
      '<button class="btn btn-out btn-xs no-print" onclick="nav(\'teacher-view\');setTimeout(function(){renderTeacherViewById(\''+String(t.id).replace(/'/g,"\\'")+'\')},50)">ดูรายคน</button></div>'+
      '<div class="teacher-all-body">'+buildTeacherViewTable(n)+'</div></div>';
  }).join('');
}
(function(){
  var oldNav=window.nav;
  if(typeof oldNav==='function'){
    window.nav=function(p){
      if(p==='teacher-all'&&window.SCHOOL_OS_STORAGE==='firebase')p='substitute';
      if(!canAccessPage(p)){
        if(!SCHOOL_AUTH.loggedIn) toast('เมนูนี้สำหรับฝ่ายวิชาการ กรุณาเข้าสู่ระบบ','warn');
        else toast('ขณะนี้อยู่โหมด DAILY ข้อมูลหลักถูกล็อก','info');
        return oldNav('dashboard');
      }
      var r=oldNav(p);
      if(p==='teacher-all') renderTeacherAll();
      return r;
    };
  }

  // Guest cannot mutate substitute data even if a hidden control is triggered.
  ['confirmSubV2Teacher','setSubTeacher','addAbsentTeacher','removeAbsent','removePeriodFromAbsent','saveManualPeriod','subV2ClearAssigned','setSubWorkType','setSubMessageStatus'].forEach(function(name){
    var fn=window[name];
    if(typeof fn!=='function') return;
    window[name]=function(){
      if(!SCHOOL_AUTH.loggedIn){toast('ดูได้อย่างเดียว กรุณาเข้าสู่ระบบเพื่อแก้ไข','warn');return;}
      return fn.apply(this,arguments);
    };
  });

  if(window.SCHOOL_OS_STORAGE==='firebase'){SCHOOL_AUTH={loggedIn:false,token:'',role:'guest',mode:'DAILY'};window.schoolFirebaseReady.then(function(m){m.start();});return;}
  var token=sessionStorage.getItem('school_os_admin_token')||'';

  // Remove legacy local-admin sessions from the old frontend-only login.
  // A logged-in state is valid only when the token was issued by Apps Script.
  if(token==='local-admin'){
    sessionStorage.removeItem('school_os_admin_token');
    sessionStorage.removeItem('school_os_admin_mode');
    token='';
  }

  if(token){
    SCHOOL_AUTH.loggedIn=true;
    SCHOOL_AUTH.token=token;
    SCHOOL_AUTH.role=sessionStorage.getItem('school_os_auth_role')||'admin';
    SCHOOL_AUTH.mode=sessionStorage.getItem('school_os_admin_mode')||'SETUP';
  }else{
    SCHOOL_AUTH.loggedIn=false;
    SCHOOL_AUTH.token='';
    SCHOOL_AUTH.role='guest';
    SCHOOL_AUTH.mode='DAILY';
  }
  applyAccessUI();
  if(token && window.SCHOOL_ONLINE && typeof SCHOOL_ONLINE.loadDatabaseOnce==='function'){
    SCHOOL_ONLINE.loadDatabaseOnce().catch(function(e){
      if(typeof toast==='function') toast('โหลดฐานข้อมูลไม่สำเร็จ: '+(e.message||e),'warn');
    });
  }
  var savedPage='';
  try{ savedPage=sessionStorage.getItem('school_os_current_page')||''; }catch(e){}
  if(savedPage && savedPage!=='dashboard' && canAccessPage(savedPage)) nav(savedPage);
  setTimeout(applyAccessUI,800);
  setTimeout(function(){ if(window.DB&&DB.systemMode&&!SCHOOL_AUTH.loggedIn){ /* guest stays read-only */ } applyAccessUI(); },1800);
})();

// ══ ISOLATED TEACHER LEAVE HISTORY ══
// Loaded on demand only; separate from bootstrap/login/main DB save/substitute state.
function syncLeaveTestDay_(){
  var iso=(document.getElementById('leaveTestDate')||{}).value||'';
  var el=document.getElementById('leaveTestDayName');
  if(el) el.textContent=iso ? getDayNameThai(iso)+'  |  '+formatDateThai(iso) : '–';
}
async function renderLeaveTest(){
  var input=document.getElementById('leaveTestDate');
  var box=document.getElementById('leaveTestResult');
  var count=document.getElementById('leaveTestCount');
  if(!input||!box||!count) return;
  var iso=String(input.value||'').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)){
    var now=new Date();
    iso=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    input.value=iso;
  }
  syncLeaveTestDay_();
  box.innerHTML='<div style="padding:24px;text-align:center;color:#7787A2">กำลังอ่านฐานข้อมูลใบลา...</div>';
  count.textContent='...';
  var controller=new AbortController();
  var timer=setTimeout(function(){controller.abort();},12000);
  try{
    var base=String(window.SCHOOL_OS_LEAVE_API_URL||'').replace(/\/+$/,'');
    if(!base) throw new Error('ยังไม่ได้เชื่อม Leave API แยก');
    var url=base+'?action=teacherLeave&date='+encodeURIComponent(iso)+'&_='+Date.now();
    var res=window.SCHOOL_OS_STORAGE==='firebase'?{ok:true,json:async function(){return (await window.schoolFirebaseReady).leave('teacherLeave',iso);}}:await fetch(url,{method:'GET',cache:'no-store',signal:controller.signal});
    if(!res.ok) throw new Error('Leave API HTTP '+res.status);
    var out=await res.json();
    if(!out||out.ok===false) throw new Error((out&&out.error)||'อ่านข้อมูลใบลาไม่สำเร็จ');
    var rows=Array.isArray(out.rows)?out.rows:[];
    count.textContent=rows.length+' คน';
    if(!rows.length){
      box.innerHTML='<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-text">ไม่พบครูลาในวันที่เลือก</div></div>';
      return;
    }
    box.innerHTML='<div style="overflow:auto"><table class="tbl"><thead><tr><th>#</th><th>ชื่อ-สกุล</th><th>ประเภทการลา</th><th>จากวันที่</th><th>ถึงวันที่</th><th>กำหนดการ</th></tr></thead><tbody>'+
      rows.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td><b>'+escapeHtml(String(r.name||''))+'</b></td><td>'+escapeHtml(String(r.type||''))+'</td><td>'+escapeHtml(String(r.from||''))+'</td><td>'+escapeHtml(String(r.to||''))+'</td><td>'+escapeHtml(String(r.duration||''))+'</td></tr>';}).join('')+'</tbody></table></div>';
  }catch(err){
    count.textContent='0 คน';
    var msg=(err&&err.name==='AbortError')?'Leave API ใช้เวลาตอบนานเกิน 12 วินาที':String(err&&err.message?err.message:err);
    box.innerHTML='<div class="alert a-warn">เชื่อมฐานข้อมูลใบลาไม่สำเร็จ: '+escapeHtml(msg)+'</div>';
  }finally{ clearTimeout(timer); }
}
