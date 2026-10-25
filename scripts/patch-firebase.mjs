import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url),file=new URL('index.html',root);let html=readFileSync(file,'utf8');
function change(from,to){if(!html.includes(from))throw Error('Patch anchor not found: '+from.slice(0,80));html=html.replace(from,()=>to);}
change('<script id="school-os-online-adapter">','<script>window.schoolFirebaseReady=window.SCHOOL_OS_STORAGE===\'firebase\'?import(\'./js/firebase-timetable.js\'):null;</script>\n<script id="school-os-online-adapter">');
change('async function getApi(action,timeoutMs){',"async function getApi(action,timeoutMs){\n    if(window.SCHOOL_OS_STORAGE==='firebase')return (await window.schoolFirebaseReady).read(action,true);");
change('async function getStaticJson(path,timeoutMs){',"async function getStaticJson(path,timeoutMs){\n    if(window.SCHOOL_OS_STORAGE==='firebase'){var action=path.includes('home')?'home':path.includes('schedule')?'schedule':'core';return (await (await window.schoolFirebaseReady).read(action)).data;}");
change('async function postSchoolApi(params){',"async function postSchoolApi(params){\n  if(window.SCHOOL_OS_STORAGE==='firebase')return (await window.schoolFirebaseReady).post(params);");
change('function canAccessPage(p){',"function canAccessPage(p){\n  if(window.SCHOOL_OS_STORAGE==='firebase')return window.schoolFirebaseCanAccess?window.schoolFirebaseCanAccess(p):['dashboard','teacher-view','teacher-all','export'].includes(p);");
change('async function academicLogin(){',"async function academicLogin(){\n  if(window.SCHOOL_OS_STORAGE==='firebase'){try{return await (await window.schoolFirebaseReady).login();}catch(e){toast(e.message,'err');return;}}");
change('async function academicLogout(){',"async function academicLogout(){\n  if(window.SCHOOL_OS_STORAGE==='firebase'){try{return await (await window.schoolFirebaseReady).logout();}catch(e){toast(e.message,'err');return;}}");
change("  var token=sessionStorage.getItem('school_os_admin_token')||'';","  if(window.SCHOOL_OS_STORAGE==='firebase'){SCHOOL_AUTH={loggedIn:false,token:'',role:'guest',mode:'DAILY'};window.schoolFirebaseReady.then(function(m){m.start();});return;}\n  var token=sessionStorage.getItem('school_os_admin_token')||'';");
// Repaint the account card after existing permission UI calls without changing
// the many timetable/editor mutation guards already present in the application.
change('function setModeButtons(){',"function setModeButtons(){");
const original='<div id="guestLoginBox" class="academic-login-box">',start=html.indexOf(original),end=html.indexOf('      <div id="adminTopBox"',start);
if(start<0||end<0)throw Error('Login markup boundary not found');
const old=html.slice(start,end);if(!old.includes('academicLoginPass'))throw Error('Login markup changed');
html=html.slice(0,start)+`<div id="guestLoginBox" class="academic-login-box"><button type="button" id="academicLoginBtn" class="dashboard-login-btn" onclick="academicLogin()">เข้าสู่ระบบด้วย Google</button><div class="dashboard-login-note" id="academicLoginStatus">ฝ่ายวิชาการใช้บัญชีที่ได้รับอนุมัติ ผู้เข้าใช้ทั่วไปดูตารางสอนได้</div></div>\n\n`+html.slice(end);
html+='\n<script>if(window.SCHOOL_OS_STORAGE===\'firebase\'){var paintOriginal=window.applyAccessUI;window.applyAccessUI=function(){var r=paintOriginal.apply(this,arguments);if(window.schoolFirebasePaintIdentity)window.schoolFirebasePaintIdentity();return r;};}</script>\n';
html+='\n<style>body.guest-mode.firebase-authenticated #adminTopBox{display:flex!important}body.firebase-authenticated #guestLoginBox{display:none!important}</style>\n';
writeFileSync(file,html);console.log('Firebase bridge hooks and Google login prepared.');
