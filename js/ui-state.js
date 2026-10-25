(function(){
 'use strict';
 const read=key=>{try{return sessionStorage.getItem(key)||'';}catch(e){return '';}};
 const initialPage=read('school_os_current_page');
 window.schoolRestorePage=function(){
  const page=initialPage;
  if(!page||!document.getElementById('page-'+page)||!canAccessPage(page))return;
  const room=read('school_os_builder_room');
  if(room&&DB.rooms.some(r=>r.id===room))currentBuilderRoom=room;
  nav(page);
 };
 window.schoolRememberBuilderRoom=function(room){try{sessionStorage.setItem('school_os_builder_room',room||'');}catch(e){}};
})();
