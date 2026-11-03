const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../js/daily-teacher-report-ui.js'),'utf8');
function setup(){
 const controls=Object.fromEntries(['date','preview','status','download','close','refresh'].map(k=>[k,{value:'2026-11-03',replaceChildren(){}}]));
 const target={scrollWidth:1800,scrollHeight:2600};let clicks=0,loads=0,renders=0,removed=0;
 const dialog={isConnected:true,querySelector:s=>controls[s.slice(6,-1)],showModal(){},close(){},remove(){}};
 const document={getElementById:()=>null,fonts:{ready:Promise.resolve()},body:{append(){}},createElement(tag){if(tag==='dialog')return dialog;if(tag==='a')return {click(){clicks++},remove(){}};return {style:{},querySelector:()=>target,remove(){removed++}};}};
 const context={document,Intl,Date,DB:{},DailyTeacherReport:{model:()=>({rows:[{}],slots:[{}]}),html:()=>'<article></article>'},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout(){}};
 context.window=context;context.loadSubstituteReportDay=async()=>({});
 context.schoolLoadExportLibrary=async kind=>{assert.equal(kind,'canvas');loads++;context.html2canvas=async (el,options)=>{assert.equal(el,target);assert.equal(options.windowWidth,1800);assert.equal(options.windowHeight,2600);renders++;return {toBlob:cb=>cb({})}};};
 vm.runInNewContext(source,context);
 return {context,controls,counts:()=>({clicks,loads,renders,removed})};
}
test('first PNG export awaits lazy library and captures entire report; subsequent exports reuse it',async()=>{
 const h=setup();await h.context.openDailyTeacherReport();await h.controls.download.onclick();
 assert.deepEqual(h.counts(),{clicks:1,loads:1,renders:1,removed:1});
 assert.match(h.controls.status.textContent,/ดาวน์โหลดภาพ PNG แล้ว/);
 await h.controls.download.onclick();assert.deepEqual(h.counts(),{clicks:2,loads:1,renders:2,removed:2});
});
test('failed library load restores controls and allows another download attempt',async()=>{
 const h=setup(),load=h.context.schoolLoadExportLibrary;h.context.schoolLoadExportLibrary=async()=>{throw Error('network unavailable')};
 await h.context.openDailyTeacherReport();await h.controls.download.onclick();
 assert.match(h.controls.status.textContent,/network unavailable/);assert.equal(h.controls.download.disabled,false);assert.equal(h.controls.date.disabled,false);assert.equal(h.counts().clicks,0);
 h.context.schoolLoadExportLibrary=load;await h.controls.download.onclick();assert.equal(h.counts().clicks,1);
});
