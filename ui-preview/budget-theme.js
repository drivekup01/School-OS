/* Preview presentation only: keep existing IDs, event handlers and schedule data. */
(() => {
 function init(){
  const sidebar=document.querySelector('.sidebar'),brand=document.querySelector('.school-brand');
  if(!sidebar||!brand)return;
  sidebar.classList.remove('sidebar-collapsed');sidebar.prepend(brand);
  const clock=document.createElement('div');clock.className='preview-sidebar-clock';clock.setAttribute('aria-label','วันเวลาประเทศไทย');brand.after(clock);
  const date=document.createElement('span'),time=document.createElement('time');clock.append(date,time);
  const df=new Intl.DateTimeFormat('th-TH-u-ca-buddhist-nu-latn',{timeZone:'Asia/Bangkok',weekday:'long',day:'numeric',month:'long',year:'numeric'}),tf=new Intl.DateTimeFormat('th-TH-u-nu-latn',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function tick(){const now=new Date(),p=Object.fromEntries(df.formatToParts(now).map(p=>[p.type,p.value]));date.textContent=p.weekday+'ที่ '+p.day+' '+p.month+' พ.ศ. '+p.year;time.textContent='เวลา '+tf.format(now)+' น. · เวลาไทย';time.dateTime=now.toISOString();}
  tick();setInterval(()=>{if(!document.hidden)tick();},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
  const toggle=document.createElement('button');toggle.type='button';toggle.className='preview-mobile-toggle';toggle.textContent='แสดงเมนูระบบ';toggle.setAttribute('aria-expanded','false');clock.after(toggle);
  toggle.onclick=()=>{const open=sidebar.classList.toggle('preview-menu-open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'ซ่อนเมนูระบบ':'แสดงเมนูระบบ';};
  function closeMenu(){sidebar.classList.remove('preview-menu-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='แสดงเมนูระบบ';if(matchMedia('(max-width:760px)').matches)document.querySelector('.main')?.scrollIntoView({block:'start'});}
  sidebar.addEventListener('click',e=>{if(e.target.closest('.sb-item'))closeMenu();});
  const paths={home:'M3 10l9-7 9 7M5 9v12h14V9M9 21v-8h6v8',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87',book:'M4 3h6a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H3V3h1M13 6a3 3 0 0 1 3-3h5v16h-5a3 3 0 0 0-3 2',calendar:'M8 2v4M16 2v4M3 10h18M6 14h3M13 14h3M6 18h3',grid:'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',chart:'M4 20V10M10 20V4M16 20v-7M2 22h20',alert:'M12 3L2 21h20L12 3zM12 9v5M12 17v1',file:'M14 2H5v20h14V7l-5-5zM14 2v6h5M8 12h8M8 16h8',refresh:'M20 7v5h-5M4 17v-5h5M5 7a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2'};
  const icons={dashboard:'home',school:'settings',teachers:'people',subjects:'book',rooms:'grid',timeslots:'calendar',builder:'calendar','auto-schedule':'grid','teacher-view':'book',workload:'chart',conflict:'alert',export:'file',substitute:'refresh','sub-history':'file','leave-test':'calendar',announcements:'file',storage:'settings','teacher-all':'people','import-teachers':'file'};
  function svg(kind){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[kind||'grid']+'"/>'+(kind==='calendar'?'<rect x="3" y="4" width="18" height="18" rx="2"/>':kind==='people'?'<circle cx="9" cy="7" r="4"/>':'')+'</svg>';}
  sidebar.querySelectorAll('.sb-item').forEach(item=>{const icon=item.querySelector('.icon');if(icon)icon.innerHTML=svg(icons[item.id.replace('nav-','')]||'grid');if(!item.hasAttribute('tabindex'))item.tabIndex=0;item.setAttribute('role','button');item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();item.click();}});});
  const account=document.createElement('div');account.className='preview-sidebar-account';account.innerHTML='ผู้ดูแลจำลอง<small>พื้นที่ทดสอบ UI · ไม่เชื่อมระบบจริง</small>';sidebar.append(account);
  const topLabel=document.createElement('span');topLabel.className='preview-top-label';topLabel.textContent='งานวิชาการ / ระบบจัดตารางสอน';document.querySelector('.school-topbar').prepend(topLabel);
  const metrics=document.createElement('section');metrics.className='preview-summary';metrics.setAttribute('aria-label','ภาพรวมข้อมูลตารางสอน');
  const definitions=[['teachers','ครูในระบบ','ดูข้อมูลครูทั้งหมด'],['subjects','รายวิชา','จัดการรายวิชาที่เปิดสอน'],['rooms','ห้องเรียน','ดูห้องเรียนและแผนการเรียน'],['slots','คาบเรียนต่อวัน','ตั้งค่าคาบและเวลาเรียน']];
  const values=definitions.map(([page,label,help])=>{const button=document.createElement('button');button.type='button';button.className='preview-summary-card';const text=document.createElement('span'),value=document.createElement('strong'),note=document.createElement('small');text.textContent=label;value.textContent='—';note.textContent=help;button.append(text,value,note);button.onclick=()=>{nav(page==='slots'?'timeslots':page);closeMenu();};metrics.append(button);return value;});
  document.querySelector('#page-dashboard .ph').after(metrics);
  function updateMetrics(){if(typeof DB==='undefined')return;definitions.forEach(([key],i)=>{const list=DB[key]||[];values[i].textContent=String(key==='slots'?list.filter(s=>!s.isBreak).length:list.length);});}
  for(const id of ['sbTeacherCount','sbSubjectCount','sbRoomCount']){const el=document.getElementById(id);if(el)new MutationObserver(updateMetrics).observe(el,{childList:true,subtree:true,characterData:true});}
  updateMetrics();window.SCHOOL_ONLINE?.loadDatabaseOnce().then(updateMetrics).catch(()=>{});
  document.querySelectorAll('.dashboard-shortcut[data-page]').forEach(button=>{const icon=button.querySelector('.dashboard-shortcut-icon');if(icon)icon.innerHTML=svg(icons[button.dataset.page]||'grid');});
  document.querySelector('.preview-banner strong').textContent='สำเนาทดลอง · UI ใหม่';
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
