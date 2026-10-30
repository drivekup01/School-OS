(function(){
 'use strict';
 const read=key=>{try{return sessionStorage.getItem(key)||'';}catch(e){return '';}};
 const initialPage=read('school_os_current_page');
 window.schoolRestorePage=function(){
  const page=window.schoolRequestedPage||initialPage;
  if(!page||!document.getElementById('page-'+page)||!canAccessPage(page))return;
  const room=read('school_os_builder_room');
  if(room&&DB.rooms.some(r=>r.id===room))currentBuilderRoom=room;
  nav(page);
 };
 window.schoolRememberBuilderRoom=function(room){try{sessionStorage.setItem('school_os_builder_room',room||'');}catch(e){}};
})();

function mountSchoolHomeButton(sidebar){
 if(!sidebar)return;
 sidebar.querySelectorAll('a.back-school,a[data-view="home"]').forEach(a=>a.remove());
 document.querySelectorAll('.school-portal-link').forEach(a=>a.remove());
 const area=document.createElement('div');area.className='school-home-area';
 const link=document.createElement('a');link.className='school-home-button';link.href='https://drivekup01.github.io/School-Portal/';link.target='_top';link.innerHTML='<span aria-hidden="true">←</span><span>หน้าหลักโรงเรียน</span>';link.setAttribute('aria-label','กลับหน้าหลักโรงเรียน');area.append(link);
 const bottom=sidebar.querySelector('.sidebar-bottom');if(bottom)bottom.prepend(area);else sidebar.append(area);
 const style=document.createElement('style');style.textContent=`
 .school-home-area{margin-top:auto;padding:16px 12px;flex-shrink:0;box-sizing:border-box}
 .sidebar-bottom>.school-home-area{margin:0;padding:0 0 16px}
 a.school-home-button{display:flex!important;align-items:center;justify-content:flex-start;gap:10px;box-sizing:border-box;min-height:44px;width:100%;padding:11px 14px!important;border:1px solid #ffffff30!important;border-radius:10px!important;background:#ffffff0c!important;color:#f0e5fa!important;font:13px/1.5 'IBM Plex Sans Thai',Tahoma,sans-serif!important;text-decoration:none!important;white-space:nowrap}
 a.school-home-button:hover{background:#ffffff20!important}a.school-home-button:focus-visible{outline:3px solid #cda4ed;outline-offset:3px}
 #budgetSidebar>.school-account{margin-top:0!important}.sidebar-collapsed .school-home-area{padding:10px 7px}.sidebar-collapsed .school-home-button{padding:10px!important;justify-content:center}.sidebar-collapsed .school-home-button span+span{display:none}
 @media(max-width:820px){body>.school-home-area{position:fixed;left:14px;bottom:84px;width:190px;z-index:45;padding:0}body>.school-home-area a.school-home-button{background:#472468!important;box-shadow:0 4px 14px #29174325}}
 @media print{.school-home-area{display:none!important}}`;
 document.head.append(style);
 const media=matchMedia('(max-width:820px)');function position(){if(media.matches)document.body.append(area);else if(bottom)bottom.prepend(area);else sidebar.insertBefore(area,sidebar.querySelector(':scope>.school-account'));}position();media.addEventListener('change',position);
}

document.addEventListener('DOMContentLoaded',()=>mountSchoolHomeButton(document.querySelector('.sidebar')),{once:true});
