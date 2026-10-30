
(function(){
  function syncBuilderRoomTitle(){
    var el=document.getElementById('builderTableRoomTitle');
    if(!el) return;
    try{
      var r=(typeof DB!=='undefined'&&DB.rooms)?DB.rooms.find(function(x){return x.id===currentBuilderRoom;}):null;
      el.textContent=r?('ตารางเรียน ห้อง '+r.label):'ตารางเรียน';
    }catch(e){el.textContent='ตารางเรียน';}
  }
  window.addEventListener('load',function(){
    syncBuilderRoomTitle();
    setTimeout(syncBuilderRoomTitle,300);
    document.addEventListener('click',function(e){
      if(e.target.closest&&e.target.closest('#builderRoomTabs')) setTimeout(syncBuilderRoomTitle,30);
    });
  });
  var _si=setInterval(function(){
    if(document.readyState==='complete'){syncBuilderRoomTitle();}
  },1200);
  setTimeout(function(){clearInterval(_si)},15000);
})();
