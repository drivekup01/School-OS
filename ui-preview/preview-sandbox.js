/* Local-only sandbox. No production credentials, APIs, or writes. */
window.SCHOOL_UI_PREVIEW=true;
(() => {
 const prefix='school_os_ui_preview_',key=prefix+'database';
 sessionStorage.setItem(prefix+'admin_token','preview-only');
 sessionStorage.setItem(prefix+'admin_mode','SETUP');
 sessionStorage.setItem(prefix+'auth_role','admin');
 const nativeFetch=window.fetch.bind(window),base=new URL('./',location.href);
 window.fetch=(input,options={})=>{
  const url=new URL(input instanceof Request?input.url:String(input),location.href);
  const method=String(options.method||(input instanceof Request?input.method:'GET')).toUpperCase();
  if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||!['GET','HEAD'].includes(method))return Promise.reject(Error('สำเนาทดลองไม่เชื่อมต่อหรือบันทึกไปยังระบบจริง'));
  return nativeFetch(input,options);
 };
 window.previewLoadSaved=()=>JSON.parse(sessionStorage.getItem(key)||'null');
 window.previewApi=async params=>{
  switch(params.action){
   case 'login': return {ok:true,token:'preview-only',role:'admin',systemMode:'SETUP'};
   case 'logout': return {ok:true};
   case 'setMode': return {ok:true,systemMode:params.mode};
   case 'saveDatabase': sessionStorage.setItem(key,params.data);return {ok:true};
   case 'saveSubstitute': {const data=window.previewLoadSaved()||{};data.substitute=JSON.parse(params.substitute);sessionStorage.setItem(key,JSON.stringify(data));return {ok:true};}
   case 'bootstrap': {const saved=window.previewLoadSaved();if(saved)return {ok:true,data:saved};const [core,schedule]=await Promise.all(['database/core.json','database/schedule.json'].map(p=>fetch(p).then(r=>{if(!r.ok)throw Error('โหลดข้อมูลสำเนาไม่สำเร็จ');return r.json();})));return {ok:true,data:{...core,...schedule}};}
   default: throw Error('ส่วนนี้ยังไม่เปิดการบันทึกในสำเนาทดลอง ('+params.action+')');
  }
 };
 document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('previewReset').onclick=()=>{
   if(!confirm('ล้างการแก้ไขเฉพาะสำเนาทดลองในแท็บนี้ และกลับไปใช้ข้อมูลตั้งต้น?'))return;
   for(const k of Object.keys(sessionStorage))if(k.startsWith(prefix))sessionStorage.removeItem(k);
   localStorage.removeItem(prefix+'sidebar_collapsed');location.reload();
  };
 });
})();
