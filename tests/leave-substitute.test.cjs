const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function boot(load){
 const events={},paints=[],messages=[];
 const ctx={currentSubDate:'2026-10-28',DB:{teachers:[{id:'t1',prefix:'ครู',first:'หนึ่ง',last:'ทดสอบ'},{id:'t2',first:'สอง',last:'ทดสอบ'}],rooms:[{id:'r1'}],slots:[{id:1},{id:2,isBreak:true}],sched:{r1_1_พุธ:{subject:'ไทย',teacher:'ครูหนึ่ง ทดสอบ'}},substitute:{}},mapDayNameToSched:()=> 'พุธ',document:{getElementById:()=>({prepend:n=>messages.push(n.textContent)}),createElement:()=>({setAttribute(){}})}};
 ctx.getSubDay=date=>ctx.DB.substitute[date]??=( {absentList:[]} );
 ctx.getSubViewDay=date=>JSON.parse(JSON.stringify(ctx.DB.substitute[date]||{absentList:[]}));
 ctx.ensurePersistentAbsentFromView_=id=>ctx.getSubDay(ctx.currentSubDate).absentList.find(a=>String(a.teacherId)===String(id))||null;
 ctx.renderSubContent=()=>{paints.push(ctx.getSubViewDay(ctx.currentSubDate));};
 ctx.loadSubstituteDay=()=>ctx.renderSubContent();
 ctx.SCHOOL_OS_STORAGE='firebase';ctx.schoolFirebaseReady=Promise.resolve({leave:load});ctx.addEventListener=(name,fn)=>events[name]=fn;ctx.window=ctx;
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../substitute-leave-sync.js','utf8'),ctx);
 return {ctx,events,paints,messages};
}
test('Firebase readers receive leave without a legacy API URL or editor login flag',async()=>{
 const h=boot(async()=>({ok:true,rows:[{teacherId:'t1',type:'ลาป่วย'},{teacherId:'t1',type:'ลา'}]}));
 await h.ctx.renderSubContent();const day=h.paints.at(-1);
 assert.equal(day.absentList.length,1);assert.equal(day.absentList[0].periods.length,1);
 assert.equal(day.absentList[0].periods[0].subject,'ไทย');assert.equal(Object.keys(h.ctx.DB.substitute).length,0);
 const saved=h.ctx.ensurePersistentAbsentFromView_('t1');saved.periods[0].subTeacher='สอง ทดสอบ';
 await h.ctx.renderSubContent();assert.equal(h.paints.at(-1).absentList[0].periods[0].subTeacher,'สอง ทดสอบ');
 assert.equal(h.ctx.ensurePersistentAbsentFromView_('t1'),saved);assert.equal(h.ctx.DB.substitute['2026-10-28'].absentList.length,1);
});
test('refresh event invalidates leave, failures stay visible and retry can recover',async()=>{
 let rows=[{teacherId:'t1'}],fail=false;
 const h=boot(async()=>{if(fail)throw Error('offline');return {ok:true,rows};});
 await h.ctx.renderSubContent();rows=[];h.events['school-leave-updated']();await h.ctx.renderSubContent();assert.equal(h.paints.at(-1).absentList.length,0);
 fail=true;h.events['school-leave-updated']();await h.ctx.renderSubContent();assert.ok(h.messages.some(s=>s.includes('offline')));
 fail=false;rows=[{teacherId:'t1'}];await h.ctx.renderSubContent();assert.equal(h.paints.at(-1).absentList.length,1);
});
test('account changes discard in-flight leave and unknown IDs never match by name',async()=>{
 let done;const pending=new Promise(resolve=>done=resolve),h=boot(()=>pending);
 const render=h.ctx.renderSubContent();await Promise.resolve();
 h.ctx.currentSubDate='';h.events['school-identity-changed']();done({ok:true,rows:[{teacherId:'t1'}]});await render;
 assert.equal(h.ctx.getSubViewDay('2026-10-28').absentList.length,0);
 const other=boot(async()=>({ok:true,rows:[{teacherId:'unknown',name:'ครูหนึ่ง ทดสอบ'}]}));
 await other.ctx.renderSubContent();assert.equal(other.paints.at(-1).absentList.length,0);
});
test('leave ranges include both endpoints and convert Thai Buddhist years',async()=>{
 const source=fs.readFileSync(__dirname+'/../js/firebase-timetable.js','utf8');
 const ctx={profileTask:Promise.resolve(),scope:0,currentProfile:{active:true},academic:()=>true,reader:()=>false,leaveCache:null,identity:{call:async()=>({ok:true,rows:[{teacherId:'t1',from:'28/10/2569',to:'30/10/2569'},{teacherId:'t2',from:'2026-10-29',to:'2026-10-29'}]})}};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function mapDay('),source.indexOf('export async function refreshLeave(')).replace('export async function','async function'),ctx);
 for(const [date,count] of [['2026-10-27',0],['2026-10-28',1],['2026-10-29',2],['2026-10-30',1],['2026-10-31',0]])assert.equal((await ctx.leave('teacherLeave',date)).rows.length,count,date);
});
