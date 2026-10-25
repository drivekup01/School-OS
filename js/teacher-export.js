async function exportTeacherViewPng(){
 const teacher=DB.teachers.find(t=>t.id===_tvCurrentTeacherId);
 if(!teacher){toast('กรุณาเลือกครูก่อน','warn');return;}
 if(typeof html2canvas==='undefined'){toast('ระบบสร้าง PNG ยังไม่พร้อม','warn');return;}
 const name=TeacherSchedule.name(teacher),e=TeacherSchedule.escape;
 const wrap=document.createElement('div');
 wrap.className='teacher-png-export';
 wrap.style.cssText='position:fixed;left:-20000px;top:0;background:#fff;padding:26px 28px;box-sizing:border-box;font-family:Sarabun,sans-serif;color:#1a2a44;z-index:-1;width:'+Math.max(1500,120+DB.slots.length*118+56)+'px;';
 try{
  const logo=await getRequiredExportLogo();
  wrap.innerHTML=`<div style="text-align:center;margin-bottom:14px"><img alt="ตราโรงเรียน" src="${e(logo)}" style="width:60px;height:60px;object-fit:contain"><div style="font-size:20px;font-weight:700;margin:6px 0">ตารางสอน</div><div style="font-size:16px;font-weight:700">${e(name)}</div>${teacher.rank?`<div style="font-size:12px">${e(teacher.rank+(teacher.dept?' กลุ่มสาระ'+teacher.dept:''))}</div>`:''}<div style="font-size:15px;font-weight:700">โรงเรียน${e(DB.school.name)}</div><div style="font-size:13px">ภาคเรียนที่ ${e(DB.school.semester)} ปีการศึกษา ${e(DB.school.year)}</div></div>${buildTeacherViewTable(name)}`;
  wrap.querySelector('.teacher-view-wrap').style.overflow='visible';
  wrap.querySelectorAll('[style*="sticky"]').forEach(el=>el.style.position='static');
  document.body.append(wrap);
  await document.fonts.ready;
  await Promise.all([...wrap.querySelectorAll('img')].map(img=>img.decode()));
  const canvas=await html2canvas(wrap,{scale:2,useCORS:true,backgroundColor:'#fff',logging:false});
  _downloadCanvasPng(canvas,('ตารางสอน_'+name+'_ปี'+DB.school.year+'.png').replace(/[\\/]/g,'-'));
  toast('ดาวน์โหลด PNG ตารางสอนเรียบร้อยแล้ว','succ');
 }catch(error){toast('ส่งออก PNG ไม่สำเร็จ: '+error.message,'warn');}finally{wrap.remove();}
}
