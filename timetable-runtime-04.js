
/* ══ SUBSTITUTE V2 INTERACTION ═════════════════════════════ */
var subV2SelectedTeacherId = '';
var subV2SelectedSlotId = '';
var subV2ManualSelection = '';

function subV2SelectionKey(){return JSON.stringify([currentSubDate,String(subV2SelectedTeacherId),String(subV2SelectedSlotId)]);}
function subV2CanManage(){return !!(window.SCHOOL_AUTH && window.SCHOOL_AUTH.loggedIn);}
function subV2RecordForTeacher(day,teacherId){return (day.absentList||[]).find(function(a){return String(a.teacherId)===String(teacherId);})||null;}
function startSubV2Manual(){
  if(!subV2CanManage())return;
  var t=(DB.teachers||[]).find(function(x){return String(x.id)===String(subV2SelectedTeacherId);});
  var slot=(DB.slots||[]).find(function(x){return String(x.id)===String(subV2SelectedSlotId);});
  var teach=subV2FindTeachingCell(t,slot,mapDayNameToSched(currentSubDate));
  if(!currentSubDate||!slot||slot.isBreak||!teach||teach.teacherOnly)return;
  subV2ManualSelection=subV2SelectionKey();
  renderSubSidePanel();
}
function subV2CandidateAvailable(day,c,t,slot,schedDay,p){
  if(String(c.id)===String(t.id)||subV2AbsentForTeacher(day,c.id,slot.id))return false;
  var name=subV2TeacherName(c);
  if(subV2FindTeachingCell(c,slot,schedDay))return false;
  return !(day.absentList||[]).some(function(a){return (a.periods||[]).some(function(other){return String(other.slotId)===String(slot.id)&&other.subTeacher===name&&!(String(a.teacherId)===String(t.id));});});
}

function subV2TeacherName(t){
  return t ? ((t.prefix||'')+(t.first||'')+' '+(t.last||'')).trim() : '';
}
function subV2FindTeachingCells(teacher, slot, schedDay){
  if(!teacher || !slot || slot.isBreak)return [];
  var tName=subV2TeacherName(teacher),out=[];
  (DB.rooms||[]).forEach(function(room){
    var table=window.PeriodExchange?PeriodExchange.effective(DB,currentSubDate):DB;
    var cv=table.sched[room.id+'_'+slot.id+'_'+schedDay];
    if(cv&&cv.subject&&(cv.teacher===tName||cv.teacher2===tName||cv.teacher3===tName))out.push({room:room,cv:cv});
  });
  TeacherSchedule.activities(DB,tName,slot.id,schedDay).forEach(function(a){out.push({room:{id:'',label:'กิจกรรมครู'},cv:{subject:a.subject,teacher:tName},teacherOnly:true});});
  return out;
}
function subV2FindTeachingCell(teacher,slot,schedDay){return subV2FindTeachingCells(teacher,slot,schedDay)[0]||null;}
function subV2TeachingMarkup(lessons,record,slotId,replacement){
  return lessons.map(function(lesson){
    var room=lesson.room,cv=lesson.cv,learn=TeacherSchedule.learnRoom(DB,cv,room.id);
    var p=(record&&record.periods||[]).find(function(p){return String(p.slotId)===String(slotId)&&String(p.roomId)===String(room.id);});
    return '<div class="sub-v2-lesson"><div class="sub-v2-subj">'+subV2Escape(cv.subject||'ไม่ระบุวิชา')+'</div>'+
      '<div class="sub-v2-room">'+subV2Escape(room.label||'ไม่ระบุห้อง')+(learn?' · ห้อง '+subV2Escape(learn):'')+'</div>'+
      (replacement&&!lesson.teacherOnly?'<div class="sub-v2-action">'+(p&&p.subTeacher?'✓ '+subV2Escape(p.subTeacher):'รอจัดครูแทน')+'</div>':'')+'</div>';
  }).join('');
}
function subV2SlotGroups(record){
  var groups={};(record.periods||[]).forEach(function(p){(groups[String(p.slotId)]||(groups[String(p.slotId)]=[])).push(p);});
  var teacher=(DB.teachers||[]).find(function(t){return String(t.id)===String(record.teacherId);});
  Object.keys(groups).forEach(function(id){
    var slot=(DB.slots||[]).find(function(s){return String(s.id)===id;});
    subV2FindTeachingCells(teacher,slot,mapDayNameToSched(currentSubDate)).filter(function(l){return !l.teacherOnly;}).forEach(function(l){
      if(!groups[id].some(function(p){return String(p.roomId)===String(l.room.id);}))groups[id].push({slotId:slot.id,roomId:l.room.id,subTeacher:''});
    });
  });
  return Object.values(groups);
}
function subV2AbsentForTeacher(day, teacherId, slotId){
  var a=subV2RecordForTeacher(day,teacherId);
  return a && (!a.manualOnly || (slotId!=null && subV2PeriodForAbsent(a,slotId))) ? a : null;
}
function subV2PeriodForAbsent(absent, slotId){
  if(!absent) return null;
  return (absent.periods||[]).find(function(p){return String(p.slotId)===String(slotId);}) || null;
}
function subV2IsTeacherUsedAsSub(day, teacherName, slotId){
  return (day.absentList||[]).some(function(a){
    return (a.periods||[]).some(function(p){
      return String(p.slotId)===String(slotId) && p.subTeacher===teacherName;
    });
  });
}
function subV2Escape(s){
  return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

async function renderSubContent(){
  if(window.SCHOOL_OS_STORAGE==='firebase'&&window.SCHOOL_ONLINE&&(!SCHOOL_ONLINE.isReady()||SCHOOL_ONLINE.isLoading())){
    var target=document.getElementById('subContent');
    if(target)target.innerHTML='<div class="sub-v2-empty" role="status">กำลังโหลดตารางสอน…</div>';
    try{await SCHOOL_ONLINE.loadDatabaseOnce();}
    catch(e){if(target)target.innerHTML='<div class="sub-v2-empty">โหลดตารางสอนไม่สำเร็จ <button class="btn btn-out btn-sm" onclick="renderSubContent()">ลองใหม่</button></div>';return;}
  }
  var dateStr=currentSubDate;
  if(!dateStr) return;
  var content=document.getElementById('subContent');
  if(!content) return;

  var day=getSubViewDay(dateStr);
  var schedDay=mapDayNameToSched(dateStr);
  var teachers=DB.teachers||[];
  var slots=(DB.slots||[]);
  var absentList=day.absentList||[];

  var totalAbsent=absentList.filter(function(a){return !a.manualOnly;}).length;
  var totalPeriods=absentList.reduce(function(s,a){return s+subV2SlotGroups(a).length;},0);
  var totalAssigned=absentList.reduce(function(s,a){
    return s+subV2SlotGroups(a).filter(function(group){return group.every(function(p){return !!p.subTeacher;});}).length;
  },0);

  var el;
  el=document.getElementById('sumTeachers'); if(el) el.textContent=teachers.length;
  el=document.getElementById('sumAbsent'); if(el) el.textContent=totalAbsent;
  el=document.getElementById('sumPeriods'); if(el) el.textContent=totalPeriods;
  el=document.getElementById('sumAssigned'); if(el) el.textContent=totalAssigned;

  if(!teachers.length || !slots.length){
    content.innerHTML='<div class="sub-v2-empty">ยังไม่มีข้อมูลครูหรือคาบเรียน กรุณาตั้งค่าตารางสอนก่อน</div>';
    renderSubSidePanel();
    renderSubAssignedList();
    return;
  }

  var h='<table class="sub-v2-table"><thead><tr><th>ครู / คาบ</th>';
  slots.forEach(function(slot){
    if(slot.isBreak){
      h+='<th style="background:#8A6816;min-width:70px">'+subV2Escape(slot.label||'พัก')+'<span class="sub-v2-th-time">'+subV2Escape((slot.start||'')+'–'+(slot.end||''))+'</span></th>';
    }else{
      h+='<th>'+subV2Escape(slot.label||('คาบ '+slot.id))+'<span class="sub-v2-th-time">'+subV2Escape((slot.start||'')+'–'+(slot.end||''))+'</span></th>';
    }
  });
  h+='</tr></thead><tbody>';

  teachers.forEach(function(t,ti){
    var absent=subV2AbsentForTeacher(day,t.id);
    h+='<tr class="'+(absent?'teacher-absent':'')+'"><td><div class="sub-v2-teacher">'+
      '<div class="sub-v2-avatar">'+(ti+1)+'</div>'+
      '<div><div class="sub-v2-tname">'+subV2Escape(subV2TeacherName(t))+
      (absent?'<span class="sub-v2-leave-badge">ลา</span>':'')+
      '</div><div class="sub-v2-tmeta">'+subV2Escape(t.dept||'ไม่ระบุกลุ่มสาระ')+'</div></div></div></td>';

    slots.forEach(function(slot){
      if(slot.isBreak){
        h+='<td><div class="sub-v2-cell break">พักเที่ยง</div></td>';
        return;
      }
      var lessons=subV2FindTeachingCells(t,slot,schedDay),teach=lessons[0];
      var record=subV2RecordForTeacher(day,t.id),p=subV2PeriodForAbsent(record,slot.id);
      var replacements=lessons.filter(function(l){return !l.teacherOnly;});
      var covered=replacements.filter(function(l){return (record&&record.periods||[]).some(function(p){return String(p.slotId)===String(slot.id)&&String(p.roomId)===String(l.room.id)&&!!p.subTeacher;});}).length;
      var cls='free', body='<div class="sub-v2-subj">ว่าง</div><div class="sub-v2-room">พร้อมสอนแทน</div>';
      if(teach){cls='busy';body=subV2TeachingMarkup(lessons,record,slot.id,false);}
      if((absent || p) && replacements.length){
        cls=covered===replacements.length?'assigned':'need';
        body=subV2TeachingMarkup(lessons,record,slot.id,true)+
          '<div class="sub-v2-group-status">'+covered+'/'+replacements.length+' ห้อง · จัดแทนทั้งคาบ</div>';
      }else if(absent && !teach){
        body='<div class="sub-v2-subj">ว่าง</div><div class="sub-v2-room">(ลา)</div>';
      }
      if(window.PeriodExchange&&PeriodExchange.sides(DB,dateStr).some(function(x){return x.other.teacherId===t.id&&String(x.side.slotId)===String(slot.id);})){cls='exchange-blue';body+='<div class="sub-v2-group-status">แลกคาบ · ดูรายละเอียดในเมนูแลกคาบ</div>';}
      var sel=(String(subV2SelectedTeacherId)===String(t.id)&&String(subV2SelectedSlotId)===String(slot.id))?' selected':'';
      h+='<td><div class="sub-v2-cell '+cls+sel+'" onclick="selectSubCell(\''+
        String(t.id).replace(/'/g,"\\'")+'\',\''+String(slot.id).replace(/'/g,"\\'")+'\')">'+body+'</div></td>';
    });
    h+='</tr>';
  });

  h+='</tbody></table>';
  content.innerHTML=h;
  renderSubSidePanel();
  renderSubAssignedList();
}

function selectSubCell(teacherId,slotId){
  subV2ManualSelection='';
  subV2SelectedTeacherId=teacherId;
  subV2SelectedSlotId=slotId;
  renderSubContent();
}

function renderSubSidePanel(){
  var panel=document.getElementById('subSidePanel');
  if(!panel) return;
  if(!currentSubDate || !subV2SelectedTeacherId || !subV2SelectedSlotId){
    panel.innerHTML='<div class="sub-v2-side-empty"><div class="sub-v2-side-empty-icon">👆</div><strong>เลือกคาบจากตาราง</strong><span>รายละเอียดคาบและรายชื่อครูที่ว่างจะแสดงตรงนี้</span></div>';
    return;
  }

  var day=getSubViewDay(currentSubDate);
  var schedDay=mapDayNameToSched(currentSubDate);
  var t=(DB.teachers||[]).find(function(x){return String(x.id)===String(subV2SelectedTeacherId);});
  var slot=(DB.slots||[]).find(function(x){return String(x.id)===String(subV2SelectedSlotId);});
  if(!t || !slot){
    panel.innerHTML='<div class="sub-v2-side-empty"><strong>ไม่พบข้อมูลคาบที่เลือก</strong></div>'; return;
  }
  var absent=subV2AbsentForTeacher(day,t.id);
  var lessons=subV2FindTeachingCells(t,slot,schedDay),studentLessons=lessons.filter(function(l){return !l.teacherOnly;}),teach=studentLessons[0]||lessons[0];
  var p=subV2PeriodForAbsent(subV2RecordForTeacher(day,t.id),slot.id);

  var status=absent ? 'ครูลา' : (p?'จัดสอนแทนเฉพาะคาบ':(teach?'มีคาบสอน':'ว่าง'));
  var h='<div class="sub-v2-side-head"><div class="sub-v2-side-kicker">รายละเอียดคาบที่เลือก</div>'+
    '<div class="sub-v2-side-title">'+subV2Escape(slot.label||('คาบ '+slot.id))+' • '+subV2Escape(subV2TeacherName(t))+'</div></div>'+
    '<div class="sub-v2-side-detail">'+
      '<div class="sub-v2-detail-box"><div class="sub-v2-detail-label">วิชา</div><div class="sub-v2-detail-value">'+subV2Escape(lessons.length?[...new Set(lessons.map(function(l){return l.cv.subject;}))].join(' / '):'–')+'</div></div>'+
      '<div class="sub-v2-detail-box"><div class="sub-v2-detail-label">ห้อง</div><div class="sub-v2-detail-value">'+subV2Escape(lessons.length?lessons.map(function(l){return l.room.label;}).join(', '):'–')+'</div></div>'+
      '<div class="sub-v2-detail-box"><div class="sub-v2-detail-label">เวลา</div><div class="sub-v2-detail-value">'+subV2Escape((slot.start||'')+'–'+(slot.end||''))+'</div></div>'+
      '<div class="sub-v2-detail-box"><div class="sub-v2-detail-label">สถานะ</div><div class="sub-v2-detail-value">'+subV2Escape(status)+'</div></div>'+
    '</div>';
  if(lessons.length)h+='<div class="sub-v2-side-section sub-v2-selected-lessons">'+subV2TeachingMarkup(lessons,subV2RecordForTeacher(day,t.id),slot.id,!!(absent||p))+'</div>';

  if(absent){
    h+='<div class="sub-v2-side-section"><div class="sub-v2-side-section-title"><span>📝 รายละเอียดการลา</span></div>'+
      '<div class="sub-v2-info-note"><strong>'+subV2Escape(absent.type||'ลา')+'</strong>'+
      (absent.note?' • '+subV2Escape(absent.note):'')+
      '</div></div>';
  }

  if(p){
    h+='<div class="sub-v2-side-section"><div class="sub-v2-side-section-title"><span>📚 งาน/ใบงานของคาบนี้</span></div>'+
      '<div class="sub-v2-info-note">'+
      '<div><strong>รูปแบบงาน:</strong> '+subV2Escape(p.workType||'ยังไม่ระบุ')+'</div>'+
      '<div><strong>หมายเหตุ:</strong> '+subV2Escape(p.subNote||'–')+'</div>'+
      '<div><strong>สถานะข้อความ:</strong> '+subV2Escape(p.messageStatus||'ยังไม่ระบุ')+'</div>'+
      '</div></div>';
  }

  if(!teach || teach.teacherOnly || slot.isBreak){
    h+='<div class="sub-v2-side-section"><div class="sub-v2-info-note">'+
      'คาบนี้ไม่มีตารางสอนนักเรียน จึงไม่ต้องจัดครูแทน'+
      '</div></div>';
    panel.innerHTML=h; return;
  }

  if(!subV2CanManage()){panel.innerHTML=h;return;}
  if(!absent && !p && subV2ManualSelection!==subV2SelectionKey()){
    h+='<div class="sub-v2-side-section"><button type="button" class="sub-v2-confirm" onclick="startSubV2Manual()">จัดสอนแทน</button></div>';
    panel.innerHTML=h;return;
  }
  if(!p)p={slotId:slot.id,day:schedDay,roomId:teach.room.id,subject:teach.cv.subject,subTeacher:'',subNote:''};

  var candidates=(DB.teachers||[]).filter(function(c){
    return subV2CandidateAvailable(day,c,t,slot,schedDay,p);
  });

  h+='<div class="sub-v2-side-section"><div class="sub-v2-side-section-title"><span>👥 ครูที่ว่างในคาบนี้</span><span>'+candidates.length+' คน</span></div>';
  if(candidates.length){
    h+='<div class="sub-v2-free-list">'+candidates.map(function(c){
      var cName=subV2TeacherName(c);
      var canTeach=studentLessons.every(function(l){return !l.cv.subject||(c.subjects||[]).includes(l.cv.subject);});
      return '<label class="sub-v2-free-item"><input type="radio" name="subV2Candidate" value="'+subV2Escape(cName)+'" '+(p.subTeacher===cName?'checked':'')+'>'+
        '<div style="flex:1"><div class="sub-v2-free-name">'+subV2Escape(cName)+'</div><div class="sub-v2-free-meta">'+subV2Escape(c.dept||'ไม่ระบุกลุ่มสาระ')+(canTeach?' • ตรงวิชา':'')+'</div></div>'+
        '<span class="sub-v2-free-tag">ว่าง</span></label>';
    }).join('')+'</div><p class="sub-v2-info-note">ครูที่เลือกจะสอนแทนครบ '+studentLessons.length+' ห้องในคาบนี้</p><button class="sub-v2-confirm" onclick="confirmSubV2Teacher()">✓ ยืนยันครูสอนแทนทั้งคาบ</button>';
  }else{
    h+='<div class="sub-v2-no-free">ไม่พบครูว่างในคาบนี้</div>';
  }
  h+='</div>';
  if((subV2RecordForTeacher(day,t.id)?.periods||[]).some(function(p){return String(p.slotId)===String(slot.id)&&p.subTeacher;}))h+='<button type="button" class="sub-group-cancel sub-group-cancel-wide" onclick="cancelSubV2Selected()">ยกเลิกสอนแทนทั้งคาบ</button>';
  panel.innerHTML=h;
}

function confirmSubV2Teacher(){
  var picked=document.querySelector('input[name="subV2Candidate"]:checked');
  if(!picked){ toast('กรุณาเลือกครูสอนแทน','warn'); return; }
  if(!subV2CanManage())return;
  var day=getSubViewDay(currentSubDate),schedDay=mapDayNameToSched(currentSubDate);
  var t=(DB.teachers||[]).find(function(x){return String(x.id)===String(subV2SelectedTeacherId);});
  var slot=(DB.slots||[]).find(function(x){return String(x.id)===String(subV2SelectedSlotId);});
  var lessons=subV2FindTeachingCells(t,slot,schedDay),studentLessons=lessons.filter(function(l){return !l.teacherOnly;}),teach=studentLessons[0]||lessons[0];
  if(!currentSubDate||!slot||slot.isBreak||!teach||teach.teacherOnly)return;
  var view=subV2RecordForTeacher(day,t.id),p=subV2PeriodForAbsent(view,slot.id);
  if(!subV2AbsentForTeacher(day,t.id)&&!p&&subV2ManualSelection!==subV2SelectionKey())return;
  var target=p||{slotId:slot.id,day:schedDay,roomId:teach.room.id,subject:teach.cv.subject,subTeacher:'',subNote:''};
  var candidate=(DB.teachers||[]).find(function(c){return subV2TeacherName(c)===picked.value;});
  if(!candidate||!subV2CandidateAvailable(day,candidate,t,slot,schedDay,target)){toast('ครูที่เลือกไม่ว่างในคาบนี้ กรุณาเลือกใหม่','warn');renderSubSidePanel();return;}
  var absent=ensurePersistentAbsentFromView_(t.id);
  if(!absent){
    absent={teacherId:t.id,type:'จัดสอนแทนเฉพาะคาบ',note:'',manualOnly:true,periods:[]};
    getSubDay(currentSubDate).absentList.push(absent);
  }
  studentLessons.forEach(function(lesson){
    var entry=(absent.periods||[]).find(function(p){return String(p.slotId)===String(slot.id)&&String(p.roomId)===String(lesson.room.id);});
    if(!entry){entry={slotId:slot.id,day:schedDay,roomId:lesson.room.id,subject:lesson.cv.subject,subTeacher:'',subNote:''};absent.periods.push(entry);}
    entry.subject=lesson.cv.subject;entry.day=schedDay;entry.subTeacher=picked.value;
  });
  subV2ManualSelection='';
  markDirty();
  toast('✅ บันทึกครูแทนทั้งคาบครบ '+studentLessons.length+' ห้องแล้ว','succ');
  renderSubContent();
}

function renderSubAssignedList(){
  var wrap=document.getElementById('subAssignedList');
  if(!wrap) return;
  if(!currentSubDate){ wrap.innerHTML='<div class="sub-v2-assigned-empty">ยังไม่ได้เลือกวันที่</div>'; return; }
  var day=peekSubDay(currentSubDate) || {absentList:[]};
  var rows=[];
  (day.absentList||[]).forEach(function(a,ai){
    var t=(DB.teachers||[]).find(function(x){return x.id===a.teacherId;});
    (a.periods||[]).forEach(function(p,pi){
      if(!p.subTeacher) return;
      var slot=(DB.slots||[]).find(function(s){return String(s.id)===String(p.slotId);});
      var room=(DB.rooms||[]).find(function(r){return r.id===p.roomId;});
      rows.push({ai:ai,pi:pi,teacher:subV2TeacherName(t),slot:slot,room:room,p:p});
    });
  });
  if(!rows.length){ wrap.innerHTML='<div class="sub-v2-assigned-empty">ยังไม่มีรายการจัดสอนแทนในวันนี้</div>'; return; }
  var h='<div style="overflow:auto"><table class="sub-v2-assigned-table"><thead><tr>'+
    '<th>คาบ</th><th>เวลา</th><th>ห้อง</th><th>วิชา</th><th>ครูเดิม</th><th>ครูแทน</th><th>จัดการ</th>'+
    '</tr></thead><tbody>';
  rows.forEach(function(r){
    h+='<tr><td><strong>'+subV2Escape(r.slot?r.slot.label:r.p.slotId)+'</strong></td>'+
      '<td>'+subV2Escape(r.slot?(r.slot.start+'–'+r.slot.end):'–')+'</td>'+
      '<td>'+subV2Escape(r.room?r.room.label:'–')+'</td>'+
      '<td>'+subV2Escape(r.p.subject||'–')+'</td>'+
      '<td>'+subV2Escape(r.teacher||'–')+'</td>'+
      '<td><span class="badge b-green">'+subV2Escape(r.p.subTeacher)+'</span></td>'+
      '<td><button class="sub-v2-mini-btn" onclick="subV2EditAssigned('+r.ai+','+r.pi+')">เปลี่ยน</button> '+
      '<button class="sub-v2-mini-btn danger" onclick="subV2ClearAssigned('+r.ai+','+r.pi+')">ลบ</button></td></tr>';
  });
  h+='</tbody></table></div>';
  wrap.innerHTML=h;
}
function subV2EditAssigned(ai,pi){
  var day=getSubDay(currentSubDate), a=day.absentList[ai];
  if(!a || !a.periods[pi]) return;
  subV2SelectedTeacherId=a.teacherId;
  subV2SelectedSlotId=a.periods[pi].slotId;
  renderSubContent();
}
function subV2ClearAssigned(ai,pi){
  if(!subV2CanManage())return;
  var day=getSubDay(currentSubDate),a=day.absentList[ai];
  if(!a||!a.periods[pi])return;
  var slotId=a.periods[pi].slotId,group=a.periods.filter(function(p){return String(p.slotId)===String(slotId);});
  if(!window.confirm('ยกเลิกการสอนแทนทั้งคาบ รวม '+group.length+' ห้อง ใช่หรือไม่?'))return;
  if(a.manualOnly){
    a.periods=a.periods.filter(function(p){return String(p.slotId)!==String(slotId);});
    if(!a.periods.length)day.absentList.splice(ai,1);
  }else{group.forEach(function(p){p.subTeacher='';});}
  subV2ManualSelection='';
  markDirty();renderSubContent();toast('ยกเลิกการสอนแทนทั้งคาบแล้ว','info');
}
function cancelSubV2Selected(){
  var day=getSubDay(currentSubDate),ai=day.absentList.findIndex(function(a){return String(a.teacherId)===String(subV2SelectedTeacherId);});
  if(ai<0)return;
  var pi=day.absentList[ai].periods.findIndex(function(p){return String(p.slotId)===String(subV2SelectedSlotId);});
  if(pi>=0)subV2ClearAssigned(ai,pi);
}

/* ให้ฟังก์ชันเดิมอัปเดตหน้าใหม่ด้วย */
var _subV2OldSetSubTeacher = (typeof setSubTeacher==='function') ? setSubTeacher : null;
if(_subV2OldSetSubTeacher){
  setSubTeacher=function(ai,pi,val,selEl){
    _subV2OldSetSubTeacher(ai,pi,val,selEl);
    renderSubContent();
  };
}
