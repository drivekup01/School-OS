// School-OS Leave History module.
// Isolated from login, bootstrap, main DB and the daily substitute flow.
(function(){
  'use strict';

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  window.renderLeaveTest=async function(){
    var box=document.getElementById('leaveTestResult');
    var count=document.getElementById('leaveTestCount');
    if(!box||!count) return;

    var base=String(window.SCHOOL_OS_LEAVE_API_URL||'').replace(/\/+$/,'');
    if(!base){
      box.innerHTML='<div class="alert a-warn">ยังไม่ได้เชื่อม Leave API</div>';
      count.textContent='0 รายการ';
      return;
    }

    box.innerHTML='<div style="padding:24px;text-align:center;color:#7787A2">กำลังโหลดประวัติการลา...</div>';
    count.textContent='...';

    try{
      var url=base+'?action=leaveHistory&_='+Date.now();
      var res=await fetch(url,{method:'GET',cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      var out=await res.json();
      if(!out||out.ok===false) throw new Error((out&&out.error)||'Leave API ตอบกลับไม่สำเร็จ');

      var rows=Array.isArray(out.rows)?out.rows:[];
      count.textContent=rows.length+' รายการ';

      if(!rows.length){
        box.innerHTML='<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">ยังไม่มีข้อมูลการลา</div></div>';
        return;
      }

      box.innerHTML='<div style="overflow:auto"><table class="tbl"><thead><tr><th>#</th><th>ชื่อ-สกุล</th><th>ประเภทการลา</th><th>จากวันที่</th><th>ถึงวันที่</th><th>กำหนดการ</th></tr></thead><tbody>'+
        rows.map(function(r,i){
          return '<tr><td>'+(i+1)+'</td><td><b>'+esc(r.name)+'</b></td><td>'+esc(r.type)+'</td><td>'+esc(r.from)+'</td><td>'+esc(r.to)+'</td><td>'+esc(r.duration)+'</td></tr>';
        }).join('')+'</tbody></table></div>';
    }catch(err){
      count.textContent='0 รายการ';
      box.innerHTML='<div class="alert a-warn">เชื่อมฐานข้อมูลใบลาไม่สำเร็จ: '+esc(err&&err.message?err.message:err)+'</div>';
    }
  };
})();