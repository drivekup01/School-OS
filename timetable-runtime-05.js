
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function tName(t){return t?(((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim()):'';}
  function ensurePeriodMeta(p){
    if(!p.workType) p.workType='ภาระงาน';
    if(typeof p.messageStatus==='undefined') p.messageStatus='';
    return p;
  }
  window.setSubWorkType=function(ai,pi,val){
    var d=getSubDay(currentSubDate),a=d.absentList[ai]; if(!a||!a.periods[pi]) return;
    a.periods[pi].workType=val; markDirty(); renderSubAssignedList();
  };
  window.setSubMessageStatus=function(ai,pi,val){
    var d=getSubDay(currentSubDate),a=d.absentList[ai]; if(!a||!a.periods[pi]) return;
    a.periods[pi].messageStatus=val; markDirty(); renderSubAssignedList();
  };

  function subSummaryPeriodRows(periods){
    return periods.map(function(p,index){
      var slot=(DB.slots||[]).find(function(s){return String(s.id)===String(p.slotId);});
      var number=String(slot?slot.label:p.slotId).match(/\d+/);
      var clock=String(slot&&slot.start||'').match(/^(\d{1,2})[:.](\d{2})$/);
      return {p:p,index:index,number:number?Number(number[0]):Infinity,time:clock?Number(clock[1])*60+Number(clock[2]):Infinity};
    }).sort(function(a,b){return (a.number===b.number?0:a.number-b.number)||(a.time===b.time?0:a.time-b.time)||a.index-b.index;});
  }

  window.renderSubAssignedList=function(){
    var wrap=document.getElementById('subAssignedList');
    if(!wrap) return;
    if(!currentSubDate){wrap.innerHTML='<div class="sub-v2-assigned-empty">ยังไม่ได้เลือกวันที่</div>';return;}
    var day=peekSubDay(currentSubDate) || {absentList:[]};
    var groups=(day.absentList||[]);
    if(!groups.length){wrap.innerHTML='<div class="sub-v2-assigned-empty">ยังไม่มีครูลาในวันนี้</div>';return;}
    var h='<div class="sub-group-wrap">';
    groups.forEach(function(a,ai){
      var t=(DB.teachers||[]).find(function(x){return String(x.id)===String(a.teacherId);});
      var name=tName(t)||'ไม่ระบุครู';
      var dept=t&&t.dept?t.dept:'ไม่ระบุกลุ่มสาระ';
      var periods=a.periods||[];
      var periodGroups=subV2SlotGroups(a),assigned=periodGroups.filter(function(group){return group.every(function(p){return !!p.subTeacher;});}).length;
      h+='<section class="sub-group-card"><header class="sub-group-head">'+
        '<div class="sub-group-avatar">'+(ai+1)+'</div>'+
        '<div class="sub-group-main"><div class="sub-group-eyebrow">'+(a.manualOnly?'จัดสอนแทนเฉพาะคาบ':'จัดสอนแทน • ครูลา')+'</div><h3 class="sub-group-name">'+esc(name)+'</h3>'+
        '<div class="sub-group-meta">'+esc(dept)+'<span aria-hidden="true"> · </span>'+esc(a.type||'ไม่ระบุสาเหตุ')+(a.note?' · '+esc(a.note):'')+'</div></div>'+
        '<span class="sub-group-count">'+periodGroups.length+' คาบ · '+periods.length+' รายการห้อง</span></header>'+
        '<div class="sub-group-progress"><span><i class="sub-summary-dot done"></i>จัดแล้ว <strong>'+assigned+'</strong></span><span><i class="sub-summary-dot pending"></i>รอจัดครู <strong>'+(periodGroups.length-assigned)+'</strong></span></div>';
      if(!periods.length){
        h+='<div style="padding:14px;color:#7b8798;font-size:12px">ไม่มีคาบสอนในวันนี้</div>';
      }else{
        h+='<div class="sub-group-table-wrap"><table class="sub-group-table"><caption class="sub-summary-sr">คาบสอนแทนของ '+esc(name)+'</caption><thead><tr>'+
          '<th scope="col">คาบ / เวลา</th><th scope="col">วิชา / ชั้นเรียน</th><th scope="col">ครูสอนแทน</th><th scope="col">ภาระงาน</th><th scope="col">บันทึกข้อความ</th><th scope="col">สถานะ</th><th scope="col"><span class="sub-summary-sr">จัดการ</span></th>'+
          '</tr></thead><tbody>';
        subSummaryPeriodRows(periods).forEach(function(entry){
          var p=entry.p,pi=entry.index;
          ensurePeriodMeta(p);
          var slot=(DB.slots||[]).find(function(s){return String(s.id)===String(p.slotId);});
          var room=(DB.rooms||[]).find(function(r){return String(r.id)===String(p.roomId);});
          var done=!!p.subTeacher;
          var works=['ภาระงาน','ใบงาน','แบบทดสอบ','งานเก่า','ออนไลน์','ปฏิบัติ'];
          var msgs=['','ส่งแล้ว','รอส่ง','ไม่ต้องส่ง'];
          h+='<tr class="'+(done?'done':'pending')+'">'+
            '<td data-label="คาบ / เวลา"><strong class="sub-summary-period">'+esc(slot?slot.label:p.slotId)+'</strong><small>'+esc(slot?(slot.start+'–'+slot.end):'–')+'</small></td>'+
            '<td data-label="วิชา / ชั้นเรียน"><strong>'+esc(p.subject||'–')+'</strong><small>'+esc(room?room.label:'–')+'</small></td>'+
            '<td data-label="ครูสอนแทน"><span class="sub-summary-teacher '+(done?'assigned':'unassigned')+'">'+(done?esc(p.subTeacher):'ยังไม่ได้จัดครู')+'</span></td>'+
            '<td data-label="รูปแบบงาน"><select aria-label="รูปแบบงาน '+esc(slot?slot.label:p.slotId)+' '+esc(room?room.label:'')+'" class="sub-group-select" onchange="setSubWorkType('+ai+','+pi+',this.value)">'+(!works.includes(p.workType)?'<option value="'+esc(p.workType)+'" selected hidden>'+esc(p.workType)+'</option>':'')+works.map(function(x){return '<option '+(p.workType===x?'selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select></td>'+
            '<td data-label="บันทึกข้อความ"><select aria-label="บันทึกข้อความ '+esc(slot?slot.label:p.slotId)+' '+esc(room?room.label:'')+'" class="sub-group-select" onchange="setSubMessageStatus('+ai+','+pi+',this.value)">'+msgs.map(function(x){return '<option value="'+esc(x)+'" '+(p.messageStatus===x?'selected':'')+'>'+(x||'–')+'</option>';}).join('')+'</select></td>'+
            '<td data-label="สถานะ"><span class="sub-status-pill '+(done?'done':'pending')+'">'+(done?'จัดแล้ว':'รอจัดครู')+'</span></td>'+
            '<td class="sub-summary-action"><button type="button" class="sub-group-edit" onclick="subV2EditAssigned('+ai+','+pi+')">'+(done?'เปลี่ยนทั้งคาบ':'จัดแทนทั้งคาบ')+'</button>'+(done&&subV2CanManage()?'<button type="button" class="sub-group-cancel" onclick="subV2ClearAssigned('+ai+','+pi+')">ยกเลิกทั้งคาบ</button>':'')+'</td>'+
            '</tr>';
        });
        h+='</tbody></table></div>';
      }
      h+='</section>';
    });
    h+='</div>';
    wrap.innerHTML=h;
  };

  function buildText(){
    if(!currentSubDate) return '';
    var day=getSubDay(currentSubDate);
    var lines=['📣 ตารางสอนแทน','🏫 '+((DB.school&&DB.school.name)||'โรงเรียน'),'📅 '+formatDateThai(currentSubDate),''];
    if(!day.absentList||!day.absentList.length){lines.push('✅ ไม่มีครูลาในวันนี้');return lines.join('\n');}
    day.absentList.forEach(function(a){
      var t=(DB.teachers||[]).find(function(x){return String(x.id)===String(a.teacherId);});
      lines.push((a.manualOnly?'👤 ครูเจ้าของคาบ: ':'👤 ครูลา: ')+(tName(t)||'ไม่ระบุ')+' ('+(a.type||'ไม่ระบุ')+')');
      subSummaryPeriodRows(a.periods||[]).forEach(function(entry){
        var p=entry.p;
        ensurePeriodMeta(p);
        var slot=(DB.slots||[]).find(function(s){return String(s.id)===String(p.slotId);});
        var room=(DB.rooms||[]).find(function(r){return String(r.id)===String(p.roomId);});
        lines.push('• '+(slot?slot.label:'คาบ '+p.slotId)+' | '+(p.subject||'–')+' | '+(room?room.label:'–'));
        lines.push('  ครูแทน: '+(p.subTeacher||'รอจัดแทน')+' | '+p.workType+(p.messageStatus?' | '+p.messageStatus:''));
      });
      lines.push('');
    });
    lines.push('กรุณาตรวจสอบตารางสอนแทนประจำวันครับ/ค่ะ');
    return lines.join('\n');
  }
  window.copySubstituteSummary=async function(){
    if(!currentSubDate){toast('กรุณาเลือกวันที่ก่อน','warn');return;}
    var txt=buildText();
    try{await navigator.clipboard.writeText(txt);toast('📋 คัดลอกข้อความแล้ว','succ');}
    catch(e){
      var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      toast('📋 คัดลอกข้อความแล้ว','succ');
    }
  };

  function buildExportNode(logo){
    if(!currentSubDate)return null;
    var model=SubstituteReport.model(DB,currentSubDate,getSubViewDay(currentSubDate));
    var root=document.createElement('div');
    root.style.cssText='position:fixed;left:-100000px;top:0;width:1280px;background:#fff;pointer-events:none;';
    root.innerHTML=SubstituteReport.html(model,logo);
    document.body.appendChild(root);
    return root;
  }
  async function renderBlob(){
    if(typeof html2canvas==='undefined')throw new Error('ไลบรารีสร้างภาพยังไม่พร้อม');
    var logo=await getRequiredExportLogo(),node=buildExportNode(logo);
    if(!node)throw new Error('ยังไม่ได้เลือกวันที่');
    try{
      var image=node.querySelector('img');
      await image.decode();
      if(document.fonts)await document.fonts.ready;
      var target=node.querySelector('.sub-report');
      var canvas=await html2canvas(target,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false,windowWidth:1280,scrollX:0,scrollY:0});
      var blob=await new Promise(function(resolve){canvas.toBlob(resolve,'image/png');});
      if(!blob)throw new Error('สร้างภาพรายงานไม่สำเร็จ');
      return {canvas:canvas,blob:blob};
    }finally{node.remove();}
  }

  window.downloadSubstitutePNG=async function(){
    if(!currentSubDate){toast('กรุณาเลือกวันที่ก่อน','warn');return;}
    try{
      toast('กำลังสร้างภาพ...','info');
      var out=await renderBlob();
      var a=document.createElement('a');
      a.href=URL.createObjectURL(out.blob);
      a.download='ตารางสอนแทน_'+currentSubDate+'.png';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(a.href);},1500);
      toast('⬇️ ดาวน์โหลดภาพ PNG แล้ว','succ');
    }catch(e){toast('สร้างภาพไม่สำเร็จ: '+e.message,'warn');}
  };


  // Refresh grouped summary whenever original render completes.
  var oldRenderSubContent=window.renderSubContent;
  if(typeof oldRenderSubContent==='function'){
    window.renderSubContent=function(){
      var r=oldRenderSubContent.apply(this,arguments);
      try{renderSubAssignedList();}catch(e){}
      return r;
    };
  }
})();
