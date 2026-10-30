
(function(){
  function setSidebarCompact(collapsed){
    var sb=document.querySelector('.sidebar');
    var arrow=document.getElementById('sbCollapseArrow');
    var txt=document.querySelector('#sbCollapseBtn .sb-collapse-text');
    if(!sb) return;
    sb.classList.toggle('sidebar-collapsed', !!collapsed);
    if(arrow) arrow.textContent=collapsed?'':'«';
    if(txt) txt.textContent=collapsed?'ขยาย':'ย่อเมนู';
    try{ localStorage.setItem('timetable_sidebar_collapsed', collapsed?'1':'0'); }catch(e){}
    document.querySelectorAll('.sb-item').forEach(function(el){
      if(!el.dataset.fullTitle) el.dataset.fullTitle=(el.textContent||'').replace(/\s+/g,' ').trim();
      el.title=collapsed?el.dataset.fullTitle:'';
    });
  }
  window.toggleSidebarCompact=function(){
    var sb=document.querySelector('.sidebar');
    if(!sb) return;
    setSidebarCompact(!sb.classList.contains('sidebar-collapsed'));
  };
  function restoreSidebar(){
    var collapsed=false;
    try{ collapsed=localStorage.getItem('timetable_sidebar_collapsed')==='1'; }catch(e){}
    setSidebarCompact(collapsed);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',restoreSidebar);
  else restoreSidebar();
})();
