(function(){
 'use strict';
 const groups=[
  {id:'basic',title:'ข้อมูลพื้นฐาน',icon:'🏫',tabs:[['school','ข้อมูลโรงเรียน'],['rooms','ห้องเรียน'],['teachers','ครู'],['subjects','วิชา'],['timeslots','คาบเรียน']]},
  {id:'schedule',title:'จัดตารางสอน',icon:'🗓️',tabs:[['builder','จัดตารางสอนรายห้อง'],['teacher-builder','จัดตารางสอนครู'],['auto-schedule','จัดอัตโนมัติ'],['conflict','ตารางสอนชนกัน']]},
  {id:'substitute',title:'จัดสอนแทน',icon:'🔄',tabs:[['substitute','จัดสอนแทน'],['exchange','แลกคาบ'],['leave-test','ครูลา'],['sub-history','ประวัติ'],['sub-semester','สรุปรายภาคเรียน']]},
  {id:'view',title:'ดูตารางและส่งออก',icon:'📖',tabs:[['export','ตารางสอนรายห้อง'],['teacher-view','ตารางสอนครู'],['view-preview','ดูตัวอย่าง']]},
  {id:'announcements',title:'ประกาศ',icon:'📢',tabs:[['announcements','ประกาศ']]},
  {id:'storage',title:'บันทึกและสำรองข้อมูล',icon:'💾',tabs:[['storage','บันทึกและสำรองข้อมูล']]}
 ];
 const route=p=>p==='sub-semester'?'sub-history':p==='view-preview'?'export':p;
 const allowed=p=>typeof canAccessPage!=='function'||canAccessPage(route(p));
 let selected='',busy=false;
 const find=p=>groups.find(g=>g.tabs.some(t=>t[0]===p))||groups.find(g=>g.tabs.some(t=>route(t[0])===p));
 function link(label,target){const a=document.createElement('a');a.href='#'+target;a.textContent=label;a.onclick=e=>{e.preventDefault();window.nav(target);};return a;}
 function sidebar(){
  const sidebar=document.querySelector('.sidebar');if(!sidebar||sidebar.querySelector('#workspaceMenu'))return;
  const legacy=document.createElement('div');legacy.id='workspaceLegacyMenu';legacy.hidden=true;
  for(const child of [...sidebar.children])if(child.matches('.sb-section,.sb-divider'))legacy.append(child);
  sidebar.append(legacy);const menu=document.createElement('nav');menu.id='workspaceMenu';menu.setAttribute('aria-label','เมนูระบบจัดตารางสอน');
  const home=link('🏠 หน้าหลัก','dashboard');home.dataset.workspace='dashboard';home.innerHTML='<span aria-hidden="true">🏠</span><span class="workspace-menu-label">หน้าหลัก</span>';menu.append(home);
  for(const g of groups){const a=link(g.icon+' '+g.title,g.tabs[0][0]);a.dataset.workspace=g.id;a.innerHTML='<span aria-hidden="true">'+g.icon+'</span><span class="workspace-menu-label">'+g.title+'</span>';a.onclick=e=>{e.preventDefault();let last;try{last=sessionStorage.getItem('school_workspace_'+g.id);}catch{}const tab=g.tabs.find(t=>t[0]===last&&allowed(t[0]))||g.tabs.find(t=>allowed(t[0]));if(tab)window.nav(tab[0]);};menu.append(a);}
  sidebar.insertBefore(menu,legacy);
 }
 function paint(){
  if(busy)return;busy=true;
  try{
   sidebar();const active=document.querySelector('.page.active');if(!active)return;
   const page=active.id.replace('page-',''),tab=route(selected)===page?selected:page,g=find(tab);
   document.querySelectorAll('#workspaceMenu a').forEach(a=>{const group=groups.find(x=>x.id===a.dataset.workspace);a.hidden=!!group&&!group.tabs.some(t=>allowed(t[0]));a.classList.toggle('active',a.dataset.workspace===(g?.id||'dashboard'));});
   active.dataset.workspaceTab=tab;
   if(!g)return;
   let header=active.querySelector(':scope>.workspace-header');
   if(!header){header=document.createElement('header');header.className='workspace-header';header.innerHTML='<h1></h1><nav class="workspace-tabs" aria-label="เมนูย่อย"></nav>';active.prepend(header);}
   if(header.querySelector('h1').textContent!==g.title)header.querySelector('h1').textContent=g.title;
   const title=active.querySelector('.ph-left h1'),tabTitle=g.tabs.find(t=>t[0]===tab)?.[1];if(title&&tabTitle&&title.textContent!==tabTitle)title.textContent=tabTitle;
   const tabs=header.querySelector('nav'),signature=g.tabs.filter(t=>allowed(t[0])).map(t=>t[0]).join('|');
   if(tabs.dataset.signature!==signature){tabs.replaceChildren(...g.tabs.filter(t=>allowed(t[0])).map(t=>{const a=link(t[1],t[0]);a.dataset.target=t[0];a.setAttribute('role','tab');return a;}));tabs.dataset.signature=signature;}
   tabs.hidden=g.tabs.length===1;tabs.setAttribute('role','tablist');
   tabs.querySelectorAll('a').forEach(a=>{const isActive=a.dataset.target===tab;a.classList.toggle('active',isActive);a.setAttribute('aria-selected',String(isActive));});
   try{sessionStorage.setItem('school_workspace_'+g.id,tab);}catch{}
   tenRows();
  }finally{busy=false;}
 }
 function tenRows(){
  const wrap=document.getElementById('subContent'),table=wrap?.querySelector('.sub-v2-table');if(!table)return;
  const rows=[...table.querySelectorAll('tbody>tr')].filter(r=>r.querySelector('td'));if(!rows.length)return;
  const height=Math.ceil((table.tHead?.getBoundingClientRect().height||0)+rows.slice(0,10).reduce((sum,r)=>sum+r.getBoundingClientRect().height,0)+2);
  if(height>10&&wrap.style.maxHeight!==height+'px')wrap.style.setProperty('max-height',height+'px','important');
 }
 const oldNav=window.nav;
 window.nav=function(p){selected=p;const result=oldNav.apply(this,[route(p)]);paint();return result;};
 const observer=new MutationObserver(()=>paint());
 document.querySelectorAll('.page').forEach(p=>observer.observe(p,{childList:true,attributes:true,attributeFilter:['class']}));
 const sub=document.getElementById('subContent');if(sub)observer.observe(sub,{childList:true,subtree:true});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',tenRows);document.addEventListener('school-auth-ready',paint);paint();
})();
