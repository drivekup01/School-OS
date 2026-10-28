(function(){
 'use strict';
 window.openDailyTeacherReport=async function(){
  const dialog=document.createElement('dialog');dialog.className='daily-report-dialog';
  dialog.innerHTML='<div class="daily-report-tools"><h2>ภาพตารางรวมครูรายวัน</h2><label>วันที่ <input type="date" data-date required></label><button class="btn btn-out" data-refresh>โหลดรายงาน</button><button class="btn btn-gold" data-download disabled>ดาวน์โหลดภาพ PNG</button><button class="btn btn-out" data-close>ปิด</button></div><p data-status role="status"></p><div class="daily-report-preview" data-preview></div>';
  document.body.append(dialog);dialog.showModal();
  const input=dialog.querySelector('[data-date]'),preview=dialog.querySelector('[data-preview]'),status=dialog.querySelector('[data-status]'),download=dialog.querySelector('[data-download]');
  const fallback=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  input.value=(typeof currentSubDate!=='undefined'&&currentSubDate)||document.getElementById('subDate')?.value||fallback;
  let generation=0,report=null,exporting=false;
  const close=()=>{if(exporting)return;generation++;dialog.close();dialog.remove();};dialog.querySelector('[data-close]').onclick=close;dialog.oncancel=ev=>{ev.preventDefault();close();};
  async function load(){
   const version=++generation;report=null;download.disabled=true;preview.replaceChildren();status.textContent='กำลังโหลดตารางสอนและข้อมูลสอนแทน…';
   try{
    if(window.SCHOOL_OS_STORAGE==='firebase'&&window.SCHOOL_ONLINE&&(!SCHOOL_ONLINE.isReady()||SCHOOL_ONLINE.isLoading()))throw Error('กำลังโหลดตารางสอน กรุณารอสักครู่แล้วกดโหลดรายงาน');
    const date=input.value;DailyTeacherReport.model(DB,date,{});
    if(typeof window.loadSubstituteReportDay!=='function')throw Error('ข้อมูลวันลายังไม่พร้อม กรุณาโหลดหน้าเว็บใหม่');
    const day=await window.loadSubstituteReportDay(date);
    if(version!==generation||!dialog.isConnected)return;
    const model=DailyTeacherReport.model(DB,date,day);if(!model.rows.length||!model.slots.length)throw Error('ยังไม่มีข้อมูลครูหรือคาบสอน');
    report={date,html:DailyTeacherReport.html(model)};preview.innerHTML=report.html;download.disabled=false;status.textContent='แสดงครูทุกคน · สีและข้อความระบุคาบเดิม สอนแทน และคาบที่ยังขาดครู · เลื่อนซ้าย–ขวาเพื่อดูครบทุกคาบ';
   }catch(error){if(version===generation&&dialog.isConnected)status.textContent=error.message;}
  }
  input.onchange=load;dialog.querySelector('[data-refresh]').onclick=load;
  download.onclick=async()=>{
   if(!report||exporting)return;exporting=true;download.disabled=true;input.disabled=true;const current=report;let node;
   try{
    if(typeof html2canvas!=='function')throw Error('เครื่องมือสร้างภาพยังไม่พร้อม กรุณาโหลดหน้าใหม่');
    status.textContent='กำลังสร้างภาพตารางรวมทุกแถว…';
    node=document.createElement('div');node.style.cssText='position:fixed;left:-100000px;top:0;pointer-events:none;background:white';node.innerHTML=current.html;document.body.append(node);
    if(document.fonts)await document.fonts.ready;
    const target=node.querySelector('.daily-report'),width=target.scrollWidth,height=target.scrollHeight,scale=Math.min(2,15000/Math.max(width,height),Math.sqrt(28000000/(width*height)));
    const canvas=await html2canvas(target,{scale,backgroundColor:'#ffffff',logging:false,useCORS:true,windowWidth:width,windowHeight:height,scrollX:0,scrollY:0});
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('สร้างไฟล์ภาพไม่สำเร็จ');
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ตารางรวมครู_สอนแทน_'+current.date+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='ดาวน์โหลดภาพ PNG แล้ว · วันที่ '+current.date;
   }catch(error){status.textContent='สร้างภาพไม่สำเร็จ: '+error.message;}
   finally{node?.remove();exporting=false;input.disabled=false;download.disabled=!report;}
  };
  await load();
 };
})();
