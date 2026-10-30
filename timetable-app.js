
/* ── FILE-SAVER (inlined for offline use) ── */
(function(a,b){if("function"==typeof define&&define.amd)define([],b);else if("undefined"!=typeof exports)b();else{b(),a.FileSaver={exports:{}}.exports}})(this,function(){"use strict";function b(a,b){return"undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(a,b,c){var d=new XMLHttpRequest;d.open("GET",a),d.responseType="blob",d.onload=function(){g(d.response,b,c)},d.onerror=function(){console.error("could not download file")},d.send()}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send()}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"))}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b)}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof global&&global.global===global?global:void 0,a=f.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),g=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href)},4E4),setTimeout(function(){e(j)},0))}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i)})}}:function(b,d,e,g){if(g=g||open("","_blank"),g&&(g.document.title=g.document.body.innerText="downloading..."),"string"==typeof b)return c(b,d,e);var h="application/octet-stream"===b.type,i=/constructor/i.test(f.HTMLElement)||f.safari,j=/CriOS\/[\d]+/.test(navigator.userAgent);if((j||h&&i||a)&&"undefined"!=typeof FileReader){var k=new FileReader;k.onloadend=function(){var a=k.result;a=j?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),g?g.location.href=a:location=a,g=null},k.readAsDataURL(b)}else{var l=f.URL||f.webkitURL,m=l.createObjectURL(b);g?g.location=m:location.href=m,g=null,setTimeout(function(){l.revokeObjectURL(m)},4E4)}});f.saveAs=g.saveAs=g,"undefined"!=typeof module&&(module.exports=g)});

//# sourceMappingURL=FileSaver.min.js.map

;

/* ── APP ── */
// ════════════════════════════════════════════
//  CONSTANTS & DATA
// ════════════════════════════════════════════
const SUBJECT_COLOR_PALETTES = {
  // สีหลักตามกลุ่มสาระ — วิชาในกลุ่มเดียวกันใช้เฉดเดียวกันแต่เข้ม/อ่อนต่างกัน
  'ภาษาไทย':['#FEE2E2','#FECACA','#FCA5A5','#F87171','#EF4444','#DC2626','#B91C1C','#991B1B'],
  'คณิตศาสตร์':['#DCFCE7','#BBF7D0','#86EFAC','#4ADE80','#22C55E','#16A34A','#15803D','#166534'],
  'วิทยาศาสตร์และเทคโนโลยี':['#DBEAFE','#BFDBFE','#93C5FD','#60A5FA','#3B82F6','#2563EB','#1D4ED8','#1E40AF'],
  'สังคมศึกษา ศาสนา และวัฒนธรรม':['#EDE9FE','#DDD6FE','#C4B5FD','#A78BFA','#8B5CF6','#7C3AED','#6D28D9','#5B21B6'],
  'สุขศึกษาและพลศึกษา':['#FFEDD5','#FED7AA','#FDBA74','#FB923C','#F97316','#EA580C','#C2410C','#9A3412'],
  'ศิลปะ':['#FCE7F3','#FBCFE8','#F9A8D4','#F472B6','#EC4899','#DB2777','#BE185D','#9D174D'],
  'การงานอาชีพ':['#FEF3C7','#FDE68A','#FCD34D','#FBBF24','#F59E0B','#D97706','#B45309','#92400E'],
  'ภาษาต่างประเทศ':['#CCFBF1','#99F6E4','#5EEAD4','#2DD4BF','#14B8A6','#0D9488','#0F766E','#115E59'],
  'แนะแนว':['#FEF9C3','#FEF08A','#FDE047','#FACC15','#EAB308','#CA8A04','#A16207','#854D0E'],
  'กิจกรรมพัฒนาผู้เรียน':['#F1F5F9','#E2E8F0','#CBD5E1','#94A3B8','#64748B','#475569','#334155','#1E293B'],
  '_default':['#E0E7FF','#C7D2FE','#A5B4FC','#818CF8','#6366F1','#4F46E5','#4338CA','#3730A3']
};
const SUBJECT_CODE_DEPT_MAP = {
  'ท':'ภาษาไทย','ค':'คณิตศาสตร์','ว':'วิทยาศาสตร์และเทคโนโลยี','ส':'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'พ':'สุขศึกษาและพลศึกษา','ศ':'ศิลปะ','ง':'การงานอาชีพ',
  'อ':'ภาษาต่างประเทศ','จ':'ภาษาต่างประเทศ','ญ':'ภาษาต่างประเทศ','กร':'ภาษาต่างประเทศ','ฝ':'ภาษาต่างประเทศ',
  'กน':'แนะแนว','ลส':'กิจกรรมพัฒนาผู้เรียน','ยก':'กิจกรรมพัฒนาผู้เรียน','ชม':'กิจกรรมพัฒนาผู้เรียน','งค':'กิจกรรมพัฒนาผู้เรียน'
};
const COLORS=[...new Set(Object.values(SUBJECT_COLOR_PALETTES).flat())];
function inferDeptForSubject(code,name){
  var c=(code||'').trim();
  // ตรวจ prefix ยาวก่อน เพื่อไม่ให้ งค ถูกอ่านเป็น ง
  var keys=Object.keys(SUBJECT_CODE_DEPT_MAP).sort(function(a,b){return b.length-a.length;});
  for(var i=0;i<keys.length;i++){ if(c.startsWith(keys[i])) return SUBJECT_CODE_DEPT_MAP[keys[i]]; }
  var preset=PRIMARY_SUBJECTS_FULL.find(function(p){return p.name===(name||'').trim();});
  return preset ? preset.dept : '';
}
function subjectPalette(dept){ return SUBJECT_COLOR_PALETTES[dept] || SUBJECT_COLOR_PALETTES._default; }
function autoColorForSubject(dept,code,name,excludeId){
  var d=dept || inferDeptForSubject(code,name) || '';
  var pal=subjectPalette(d);
  var n=DB && DB.subjects ? DB.subjects.filter(function(s){
    if(excludeId && s.id===excludeId) return false;
    var sd=s.dept || inferDeptForSubject(s.code,s.name);
    return sd===d;
  }).length : 0;
  return pal[n % pal.length];
}
function autoDetectSubjectColor(force){
  var deptEl=document.getElementById('sjDept'), codeEl=document.getElementById('sjCode'), nameEl=document.getElementById('sjName');
  if(!deptEl||!codeEl) return;
  var inferred=inferDeptForSubject(codeEl.value,nameEl?nameEl.value:'');
  if(inferred && (!deptEl.value || force!==true)) deptEl.value=inferred;
  var d=deptEl.value || inferred;
  if(!d) return;
  selectedSubjColor=autoColorForSubject(d,codeEl.value,nameEl?nameEl.value:'',document.getElementById('sjEditId')?.value||'');
  renderColorPicker();
}
function applySubjectColorScheme(force){
  if(!DB || !Array.isArray(DB.subjects)) return false;
  if(!force && DB.subjectColorSchemeVersion===2) return false;
  var counters={};
  DB.subjects.forEach(function(s){
    var d=s.dept || inferDeptForSubject(s.code,s.name) || '';
    if(!s.dept && d) s.dept=d;
    counters[d]=(counters[d]||0);
    var pal=subjectPalette(d);
    s.color=pal[counters[d] % pal.length];
    counters[d]++;
  });
  DB.subjectColorSchemeVersion=2;
  return true;
}

const GRADE_MAP={'มัธยมศึกษาตอนต้น':['ม.1','ม.2','ม.3'],'มัธยมศึกษาตอนปลาย':['ม.4','ม.5','ม.6'],'ห้องพิเศษ':['ห้องพิเศษวิทย์-คณิต','ห้องพิเศษภาษา','ห้องพิเศษศิลปะ','ห้องพิเศษอื่นๆ']};
const ALL_DAYS=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];
const DEF_SLOTS=[
  {id:1,label:'คาบที่ 1',start:'08:30',end:'09:20'},
  {id:2,label:'คาบที่ 2',start:'09:20',end:'10:10'},
  {id:3,label:'คาบที่ 3',start:'10:10',end:'11:00'},
  {id:4,label:'คาบที่ 4',start:'11:00',end:'11:50'},
  {id:5,label:'พักเที่ยง',start:'11:50',end:'12:40',isBreak:true},
  {id:6,label:'คาบที่ 5',start:'12:40',end:'13:30'},
  {id:7,label:'คาบที่ 6',start:'13:30',end:'14:20'},
  {id:8,label:'คาบที่ 7',start:'14:20',end:'15:10'},
  {id:9,label:'คาบที่ 8',start:'15:10',end:'16:00'},
];
// ── ประถมศึกษา: วิชาและข้อมูลเฉพาะ ──────────────────
const PRIMARY_SUBJECTS_FULL = [
  // ── กลุ่มสาระหลัก ──────────────────────────────────────────────
  {name:'ภาษาไทย',           code:'ท',  dept:'ภาษาไทย',                        hours:4, color:'#DBEAFE'},
  {name:'วรรณคดีและวรรณกรรม',code:'ท',  dept:'ภาษาไทย',                        hours:2, color:'#E0EEFF'},
  {name:'ภาษาและวัฒนธรรม',   code:'ท',  dept:'ภาษาไทย',                        hours:2, color:'#C7DCFF'},
  {name:'คณิตศาสตร์',         code:'ค',  dept:'คณิตศาสตร์',                     hours:4, color:'#DCFCE7'},
  {name:'คณิตศาสตร์เพิ่มเติม',code:'ค', dept:'คณิตศาสตร์',                     hours:2, color:'#BBF7D0'},
  {name:'แคลคูลัส',           code:'ค',  dept:'คณิตศาสตร์',                     hours:2, color:'#99F6E4'},
  {name:'วิทยาศาสตร์และเทคโนโลยี',code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',   hours:3, color:'#FEF3C7'},
  {name:'ชีววิทยา',           code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:3, color:'#D1FAE5'},
  {name:'เคมี',               code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:3, color:'#CFFAFE'},
  {name:'ฟิสิกส์',            code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:3, color:'#E0F7FA'},
  {name:'โลก ดาราศาสตร์ และอวกาศ',code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',   hours:2, color:'#E8F4FD'},
  {name:'วิทยาการคำนวณ',      code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:1, color:'#EFF6FF'},
  {name:'เทคโนโลยี (วิทยาการคำนวณ)',code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี', hours:1, color:'#DBEAFE'},
  {name:'สังคมศึกษา',          code:'ส',  dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:3, color:'#EDE9FE'},
  {name:'พระพุทธศาสนา',       code:'ส',  dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1, color:'#FFF7ED'},
  {name:'หน้าที่พลเมือง',      code:'ส',  dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1, color:'#FDF4FF'},
  {name:'ประวัติศาสตร์',       code:'ส',  dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1, color:'#F5F3FF'},
  {name:'ภูมิศาสตร์',          code:'ส',  dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1, color:'#EDE9FE'},
  {name:'เศรษฐศาสตร์',         code:'ส',  dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1, color:'#F3E8FF'},
  {name:'สุขศึกษาและพลศึกษา',  code:'พ',  dept:'สุขศึกษาและพลศึกษา',            hours:2, color:'#D1FAE5'},
  {name:'พลศึกษา',             code:'พ',  dept:'สุขศึกษาและพลศึกษา',            hours:1, color:'#ECFDF5'},
  {name:'สุขศึกษา',            code:'พ',  dept:'สุขศึกษาและพลศึกษา',            hours:1, color:'#F0FFF4'},
  {name:'ทัศนศิลป์',           code:'ศ',  dept:'ศิลปะ',                         hours:1, color:'#FEE2E2'},
  {name:'ดนตรี',               code:'ศ',  dept:'ศิลปะ',                         hours:1, color:'#FEF9C3'},
  {name:'นาฏศิลป์',            code:'ศ',  dept:'ศิลปะ',                         hours:1, color:'#F7FEE7'},
  {name:'ศิลปะ',               code:'ศ',  dept:'ศิลปะ',                         hours:1, color:'#FFE4E6'},
  {name:'การงานอาชีพ',          code:'ง',  dept:'การงานอาชีพ',                   hours:2, color:'#EFF6FF'},
  {name:'คหกรรมศาสตร์',        code:'ง',  dept:'การงานอาชีพ',                   hours:1, color:'#F0F9FF'},
  {name:'เกษตรกรรม',           code:'ง',  dept:'การงานอาชีพ',                   hours:1, color:'#ECFDF5'},
  {name:'ช่างอุตสาหกรรม',      code:'ง',  dept:'การงานอาชีพ',                   hours:1, color:'#FFF1F2'},
  // ── ภาษาต่างประเทศ ──────────────────────────────────────────────
  {name:'ภาษาอังกฤษ',          code:'อ',  dept:'ภาษาต่างประเทศ',                hours:4, color:'#FCE7F3'},
  {name:'ภาษาอังกฤษเพิ่มเติม', code:'อ',  dept:'ภาษาต่างประเทศ',                hours:2, color:'#FDF2F8'},
  {name:'ภาษาจีน',             code:'จ',  dept:'ภาษาต่างประเทศ',                hours:2, color:'#FFF9C4'},
  {name:'ภาษาญี่ปุ่น',         code:'ญ',  dept:'ภาษาต่างประเทศ',                hours:2, color:'#FFF3CD'},
  {name:'ภาษาเกาหลี',          code:'กร', dept:'ภาษาต่างประเทศ',                hours:2, color:'#FEF3F2'},
  {name:'ภาษาฝรั่งเศส',        code:'ฝ',  dept:'ภาษาต่างประเทศ',                hours:2, color:'#FEF2F2'},
  // ── กิจกรรมพัฒนาผู้เรียน ─────────────────────────────────────────
  {name:'กิจกรรมแนะแนว',       code:'กน', dept:'แนะแนว',                        hours:1, color:'#FFF8F0'},
  {name:'ลูกเสือ-เนตรนารี',    code:'ลส', dept:'กิจกรรมพัฒนาผู้เรียน',          hours:2, color:'#E0F2FE'},
  {name:'ยุวกาชาด',            code:'ยก', dept:'กิจกรรมพัฒนาผู้เรียน',          hours:1, color:'#FCE4EC'},
  {name:'ชุมนุม',              code:'ชม', dept:'กิจกรรมพัฒนาผู้เรียน',          hours:1, color:'#ECFDF5'},
  {name:'โครงงาน',             code:'งค', dept:'กิจกรรมพัฒนาผู้เรียน',          hours:1, color:'#F8F9FA'},
  // ── วิชาเพิ่มเติม/เลือก ─────────────────────────────────────────
  {name:'คณิตศาสตร์เพิ่มเติม ม.ปลาย',code:'ค',dept:'คณิตศาสตร์',             hours:4, color:'#D1FAE5'},
  {name:'ชีววิทยาเพิ่มเติม',  code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:4, color:'#B7F5C8'},
  {name:'เคมีเพิ่มเติม',       code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:4, color:'#A5F3FC'},
  {name:'ฟิสิกส์เพิ่มเติม',   code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:4, color:'#BAE6FD'},
  {name:'เขียนแบบ',            code:'ง',  dept:'การงานอาชีพ',                   hours:2, color:'#F3F4F6'},
  {name:'โปรแกรมคอมพิวเตอร์',  code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:2, color:'#E0E7FF'},
  {name:'สถิติ',               code:'ค',  dept:'คณิตศาสตร์',                     hours:2, color:'#BBF7D0'},
  {name:'ปรัชญาและตรรกศาสตร์', code:'ส',  dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1, color:'#EDE9FE'},
  {name:'ดาราศาสตร์และอวกาศ',  code:'ว',  dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:2, color:'#DBEAFE'},
];
// ปรับสีชุดวิชาแนะนำให้เป็นตระกูลสีเดียวกันตามหมวด
(function(){
  var counts={};
  PRIMARY_SUBJECTS_FULL.forEach(function(s){
    var d=s.dept || inferDeptForSubject(s.code,s.name) || '';
    counts[d]=counts[d]||0;
    s.color=subjectPalette(d)[counts[d] % subjectPalette(d).length];
    counts[d]++;
  });
})();
const PRIMARY_DEPT_COLORS = {
  'ภาษาไทย':SUBJECT_COLOR_PALETTES['ภาษาไทย'][3],
  'คณิตศาสตร์':SUBJECT_COLOR_PALETTES['คณิตศาสตร์'][3],
  'วิทยาศาสตร์และเทคโนโลยี':SUBJECT_COLOR_PALETTES['วิทยาศาสตร์และเทคโนโลยี'][3],
  'สังคมศึกษา ศาสนา และวัฒนธรรม':SUBJECT_COLOR_PALETTES['สังคมศึกษา ศาสนา และวัฒนธรรม'][3],
  'สุขศึกษาและพลศึกษา':SUBJECT_COLOR_PALETTES['สุขศึกษาและพลศึกษา'][3],
  'ศิลปะ':SUBJECT_COLOR_PALETTES['ศิลปะ'][3],
  'การงานอาชีพ':SUBJECT_COLOR_PALETTES['การงานอาชีพ'][3],
  'ภาษาต่างประเทศ':SUBJECT_COLOR_PALETTES['ภาษาต่างประเทศ'][3],
  'แนะแนว':SUBJECT_COLOR_PALETTES['แนะแนว'][3],
  'กิจกรรมพัฒนาผู้เรียน':SUBJECT_COLOR_PALETTES['กิจกรรมพัฒนาผู้เรียน'][3],
};
// ชั่วโมงต่อสัปดาห์มาตรฐานตามหลักสูตรแกนกลาง 2551
const PRIMARY_STD_HOURS = {
  'ม.1':{'ภาษาไทย':4,'คณิตศาสตร์':4,'วิทยาศาสตร์และเทคโนโลยี':3,'สังคมศึกษา':3,'ประวัติศาสตร์':1,'ภาษาอังกฤษ':4,'สุขศึกษาและพลศึกษา':2,'ศิลปะ':1,'ดนตรี':1,'การงานอาชีพ':2,'วิทยาการคำนวณ':1,'กิจกรรมแนะแนว':1,'ลูกเสือ-เนตรนารี':2,'ชุมนุม':1},
  'ม.4':{'ภาษาไทย':4,'คณิตศาสตร์':4,'วิทยาศาสตร์และเทคโนโลยี':4,'สังคมศึกษา':3,'ประวัติศาสตร์':1,'ภาษาอังกฤษ':4,'สุขศึกษาและพลศึกษา':2,'ศิลปะ':1,'ดนตรี':1,'การงานอาชีพ':2,'วิทยาการคำนวณ':1,'กิจกรรมแนะแนว':1,'ลูกเสือ-เนตรนารี':2,'ชุมนุม':1},
};
const DEF_SUBJ_PRESETS={
  'มัธยมศึกษาตอนต้น':['ภาษาไทย','คณิตศาสตร์','วิทยาศาสตร์และเทคโนโลยี','ชีววิทยา','เคมี','ฟิสิกส์','สังคมศึกษา','พระพุทธศาสนา','ประวัติศาสตร์','ภาษาอังกฤษ','ภาษาจีน','สุขศึกษาและพลศึกษา','ทัศนศิลป์','ดนตรี','นาฏศิลป์','การงานอาชีพ','วิทยาการคำนวณ','กิจกรรมแนะแนว','ลูกเสือ-เนตรนารี','ชุมนุม'],
  'มัธยมศึกษาตอนปลาย':['ภาษาไทย','วรรณคดีและวรรณกรรม','คณิตศาสตร์','คณิตศาสตร์เพิ่มเติม','แคลคูลัส','ชีววิทยา','ชีววิทยาเพิ่มเติม','เคมี','เคมีเพิ่มเติม','ฟิสิกส์','ฟิสิกส์เพิ่มเติม','โลก ดาราศาสตร์ และอวกาศ','สังคมศึกษา','พระพุทธศาสนา','ประวัติศาสตร์','เศรษฐศาสตร์','ภาษาอังกฤษ','ภาษาอังกฤษเพิ่มเติม','ภาษาจีน','ภาษาญี่ปุ่น','สุขศึกษาและพลศึกษา','ดนตรี','นาฏศิลป์','การงานอาชีพ','วิทยาการคำนวณ','โปรแกรมคอมพิวเตอร์','กิจกรรมแนะแนว','ยุวกาชาด','ชุมนุม'],
  'ห้องพิเศษ':['คณิตศาสตร์เพิ่มเติม ม.ปลาย','ชีววิทยาเพิ่มเติม','เคมีเพิ่มเติม','ฟิสิกส์เพิ่มเติม','ภาษาอังกฤษเพิ่มเติม','ภาษาจีน','ภาษาญี่ปุ่น','ภาษาเกาหลี','ภาษาฝรั่งเศส','ดาราศาสตร์และอวกาศ','สถิติ','โปรแกรมคอมพิวเตอร์'],
};

// ════════════════════════════════════════════
//  APP STATE
// ════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  CUSTOM DEPARTMENTS (กลุ่มสาระเพิ่มเติม)
// ══════════════════════════════════════════════════════════════
const DEFAULT_DEPTS = [
  'ภาษาไทย','คณิตศาสตร์','วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา ศาสนา และวัฒนธรรม','สุขศึกษาและพลศึกษา',
  'ศิลปะ','การงานอาชีพ','ภาษาต่างประเทศ',
  'แนะแนว','กิจกรรมพัฒนาผู้เรียน'
];

function getAllDepts() {
  if(!DB.customDepts) DB.customDepts = [];
  return DEFAULT_DEPTS.concat(DB.customDepts);
}

function buildDeptOptions(selected) {
  var depts = getAllDepts();
  var customs = DB.customDepts || [];
  var html = '<option value="">ไม่ระบุ</option>';
  // Default group
  html += '<optgroup label="📚 มาตรฐาน (8 กลุ่มสาระหลัก + แนะแนว)">';
  DEFAULT_DEPTS.forEach(function(d){
    html += '<option value="'+d+'"'+(d===selected?' selected':'')+'>'+d+'</option>';
  });
  html += '</optgroup>';
  // Custom group
  if(customs.length > 0) {
    html += '<optgroup label="✨ กลุ่มสาระเพิ่มเติม (สร้างเอง)">';
    customs.forEach(function(d){
      html += '<option value="'+d+'"'+(d===selected?' selected':'')+'>'+d+'</option>';
    });
    html += '</optgroup>';
  }
  return html;
}

function refreshAllDeptDropdowns() {
  // Refresh subject dept dropdown
  var sjDept = document.getElementById('sjDept');
  if(sjDept) {
    var cur = sjDept.value;
    sjDept.innerHTML = buildDeptOptions(cur);
    sjDept.value = cur;
  }
  // Refresh teacher dept dropdown
  var tDept = document.getElementById('tDept');
  if(tDept) {
    var cur2 = tDept.value;
    tDept.innerHTML = buildDeptOptions(cur2);
    tDept.value = cur2;
  }
}

function addCustomDept() {
  var name = (document.getElementById('newDeptInput').value||'').trim();
  if(!name) { toast('กรุณากรอกชื่อกลุ่มสาระ','warn'); return; }
  if(name.length > 60) { toast('ชื่อยาวเกิน 60 ตัวอักษร','warn'); return; }
  if(!DB.customDepts) DB.customDepts = [];
  if(DEFAULT_DEPTS.includes(name)) { toast('ชื่อนี้ซ้ำกับกลุ่มสาระมาตรฐาน','warn'); return; }
  if(DB.customDepts.includes(name)) { toast('ชื่อนี้ซ้ำกับที่มีอยู่แล้ว','warn'); return; }
  DB.customDepts.push(name);
  document.getElementById('newDeptInput').value = '';
  renderCustomDeptList();
  refreshAllDeptDropdowns();
  markDirty();
  toast('✅ เพิ่มกลุ่มสาระ "'+name+'" แล้ว','succ');
}

function removeCustomDept(name) {
  if(!DB.customDepts) return;
  // Check if used by any subject or teacher
  var usedBySubj = DB.subjects.filter(function(s){return s.dept===name;}).length;
  var usedByTchr = DB.teachers.filter(function(t){return t.dept===name;}).length;
  if(usedBySubj > 0 || usedByTchr > 0) {
    if(!confirm('กลุ่มสาระ "'+name+'" ถูกใช้โดย '+usedBySubj+' วิชา และ '+usedByTchr+' ครู\n\nหากลบจะทำให้ข้อมูลในกลุ่มนี้กลายเป็น "ไม่ระบุ"\n\nยืนยันลบ?')) return;
  }
  DB.customDepts = DB.customDepts.filter(function(d){return d!==name;});
  // Update existing references to '' (ไม่ระบุ)
  DB.subjects.forEach(function(s){ if(s.dept===name) s.dept = ''; });
  DB.teachers.forEach(function(t){ if(t.dept===name) t.dept = ''; });
  renderCustomDeptList();
  refreshAllDeptDropdowns();
  if(typeof renderSubjectTable==='function') renderSubjectTable();
  if(typeof renderTeacherTable==='function') renderTeacherTable();
  markDirty();
  toast('🗑️ ลบกลุ่มสาระ "'+name+'" แล้ว','succ');
}

function renderCustomDeptList() {
  var el = document.getElementById('customDeptList');
  if(!el) return;
  if(!DB.customDepts) DB.customDepts = [];
  if(DB.customDepts.length === 0) {
    el.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:10px;font-style:italic">ยังไม่มีกลุ่มสาระเพิ่มเติม — สามารถเพิ่มได้ด้านบน</div>';
    return;
  }
  el.innerHTML = DB.customDepts.map(function(d, i){
    var usedBySubj = DB.subjects.filter(function(s){return s.dept===d;}).length;
    var usedByTchr = DB.teachers.filter(function(t){return t.dept===d;}).length;
    var usage = '';
    if(usedBySubj || usedByTchr) {
      usage = '<span style="font-size:10px;color:#10b981;margin-left:6px">'+
        (usedBySubj?'📚'+usedBySubj+' ':'')+
        (usedByTchr?'👨\u200d🏫'+usedByTchr:'')+'</span>';
    }
    return '<div class="custom-dept-row">'+
      '<span class="custom-dept-num">'+(i+1)+'</span>'+
      '<span class="custom-dept-name">'+d+'</span>'+
      usage+
      '<button class="btn btn-danger btn-xs" onclick="removeCustomDept(\''+d.replace(/'/g,"\\'")+'\')">🗑️ ลบ</button>'+
    '</div>';
  }).join('');
}


function emptyDB(){
  return {
    school:{name:'',address:'',year:'2568',semester:'1',acadName:'',acadPos:'',principalName:'',principalPos:'',
            logoDataUrl:'',logoSize:'medium'},
    teachers:[],subjects:[],rooms:[],
    slots:DEF_SLOTS.map(s=>({...s})),
    days:['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์'],
    sched:{}, teacherSched:{}, substitute:{}, announcements:[], customDepts:[], subjectColorSchemeVersion:2
  };
}
let DB = emptyDB();
let currentPage = 'dashboard';
let currentBuilderRoom = null;
let selectedSubjColor = COLORS[0];
let editingTeacherId = null;
let editingSubjectId = null;
let editingRoomId = null;
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

// ════════════════════════════════════════════
//  SAVE STATE
// ════════════════════════════════════════════
let saveTimer = null;
let onlineSaveInFlight = false;
let onlineSavePending = false;
let onlineSaveGeneration = 0;
let lastSavedSnapshotKey = '';

function onlineSaveSnapshot(){
  if(window.SCHOOL_AUTH && SCHOOL_AUTH.role==='support'){
    return JSON.stringify(DB.substitute||{});
  }
  TeacherSchedule.prune(DB);
  return JSON.stringify(DB);
}
function snapshotKey(text){
  var h=2166136261;
  for(var i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return text.length+':'+(h>>>0).toString(16);
}
function rememberCurrentSaveState(){
  try{ lastSavedSnapshotKey=snapshotKey(onlineSaveSnapshot()); }catch(e){}
}

function markDirty(){
  setSaveInd('saving','รอบันทึกการเปลี่ยนแปลง...');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 1500);
}
function persistNow(){
  clearTimeout(saveTimer);
  saveTimer=null;
  if(window.SCHOOL_AUTH && SCHOOL_AUTH.loggedIn){
    persistOnlineNow();
  }else{
    setSaveInd('saved','พร้อมใช้งาน');
  }
}

async function persistOnlineNow(){
  if(!window.SCHOOL_AUTH || !SCHOOL_AUTH.loggedIn) return;
  if(typeof postSchoolApi!=='function') return;

  var snapshot;
  var key;
  try{
    snapshot=onlineSaveSnapshot();
    key=snapshotKey(snapshot);
  }catch(e){
    console.error('School-OS prepare save:',e);
    return;
  }

  if(key===lastSavedSnapshotKey){
    onlineSavePending=false;
    setSaveInd('saved','ข้อมูลล่าสุดบันทึกแล้ว');
    return;
  }

  if(onlineSaveInFlight){
    onlineSavePending=true;
    return;
  }

  const saveGeneration=onlineSaveGeneration;
  const saveToken=SCHOOL_AUTH.token;
  const saveRole=SCHOOL_AUTH.role;
  onlineSaveInFlight=true;
  setSaveInd('saving','กำลังบันทึกออนไลน์...');
  try{
    if(saveRole==='support'){
      await postSchoolApi({
        action:'saveSubstitute',
        token:saveToken,
        substitute:snapshot
      });
    }else{
      await postSchoolApi({
        action:'saveDatabase',
        token:saveToken,
        data:snapshot
      });
    }
    if(saveGeneration!==onlineSaveGeneration || !SCHOOL_AUTH.loggedIn || SCHOOL_AUTH.token!==saveToken) return;
    lastSavedSnapshotKey=key;
    setSaveInd('saved','บันทึกออนไลน์แล้ว · '+fmtTime(Date.now()));
  }catch(e){
    if(saveGeneration!==onlineSaveGeneration || !SCHOOL_AUTH.loggedIn || SCHOOL_AUTH.token!==saveToken) return;
    console.error('School-OS online save:',e);
    setSaveInd('unsaved','บันทึกออนไลน์ไม่สำเร็จ');
    toast('บันทึกออนไลน์ไม่สำเร็จ: '+e.message,'err');
    if(/Session หมดอายุ/.test(String(e.message||''))) academicLogout();
  }finally{
    onlineSaveInFlight=false;
    if(saveGeneration===onlineSaveGeneration && SCHOOL_AUTH.loggedIn && onlineSavePending){
      onlineSavePending=false;
      setTimeout(persistOnlineNow,250);
    }
  }
}
function setSaveInd(status,label){
  const dot=document.getElementById('saveDot'),lbl=document.getElementById('saveLabel');
  if(dot){ dot.className='save-dot '+status; }
  if(lbl){ lbl.textContent=label; }
}
function fmtTime(ts){ return ts ? new Date(ts).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) : '–'; }

// ════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════
function toast(msg,type='info'){
  let wrap=document.getElementById('toastWrap');
  if(!wrap){wrap=document.createElement('div');wrap.id='toastWrap';wrap.className='toast-wrap';document.body.appendChild(wrap);}
  const t=document.createElement('div');
  const icons={succ:'✅',err:'❌',warn:'⚠️',info:'ℹ️'};
  t.className='toast toast-'+type;
  t.innerHTML='<span class="toast-icon">'+(icons[type]||'ℹ️')+'</span><span>'+msg+'</span>';
  wrap.appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),350);},3000);
}

// ════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════
let previousPage='dashboard';

function goBackPage(){
  const target=(previousPage && previousPage!==currentPage)?previousPage:'dashboard';
  nav(target);
}

function nav(p){
  if(p!==currentPage) previousPage=currentPage||'dashboard';
  if(typeof refreshAllDeptDropdowns==='function') refreshAllDeptDropdowns();
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(x=>x.classList.remove('active'));
  const pg=document.getElementById('page-'+p);
  const nb=document.getElementById('nav-'+p);
  if(pg) pg.classList.add('active');
  if(nb) nb.classList.add('active');
  currentPage=p;
  if(p==='builder'&&currentBuilderRoom)schoolRememberBuilderRoom(currentBuilderRoom);
  try{ sessionStorage.setItem('school_os_current_page',p); }catch(e){}
  // render the page
  if(p==='dashboard')   renderDashboard();
  else if(p==='school') fillSchoolForm();
  else if(p==='teachers') renderTeacherTable();
  else if(p==='import-teachers') {}
  else if(p==='subjects') renderSubjectTable();
  else if(p==='rooms')  renderRoomTable();
  else if(p==='timeslots') renderTimeslots();
  else if(p==='builder') renderBuilder();
  else if(p==='teacher-builder') renderTeacherBuilder();
  else if(p==='auto-schedule') renderAutoSchedulePage();
  else if(p==='teacher-view') renderTeacherViewPage();
  else if(p==='workload') renderWorkload();
  else if(p==='export') renderExportPage();
  else if(p==='storage') renderStoragePage();
  else if(p==='exchange'){ renderExchangePage(); }
  else if(p==='substitute'){ if(currentSubDate){ renderSubContent(); } else { setSubDateToday(); } }
  else if(p==='leave-test') renderLeaveTest();
  else if(p==='announcements') renderAnnouncements();
  else if(p==='sub-history') renderSubHistoryPage();
  else if(p==='conflict') renderConflictPage();
  updateTopbar();
  updateSidebarCounts();
  updateInlineBackButton(p);
  const mainEl=document.querySelector('.main');
  if(mainEl) mainEl.scrollTop=0;
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;
  window.scrollTo(0,0);
}

function updateInlineBackButton(p){
  document.querySelectorAll('.page-inline-back').forEach(function(btn){ btn.remove(); });
  if(p==='dashboard') return;

  const page=document.getElementById('page-'+p);
  if(!page) return;
  const left=page.querySelector('.ph-left');
  const h1=left && left.querySelector('h1');
  if(!left || !h1) return;

  let line=h1.parentElement;
  if(!line || !line.classList.contains('page-title-line')){
    line=document.createElement('div');
    line.className='page-title-line';
    h1.parentNode.insertBefore(line,h1);
    line.appendChild(h1);
  }

  const btn=document.createElement('button');
  btn.type='button';
  btn.className='page-back-btn page-inline-back';
  btn.onclick=goBackPage;
  btn.textContent='← ย้อนกลับ';
  line.insertBefore(btn,h1);
}

// ════════════════════════════════════════════
//  TOPBAR & SIDEBAR
// ════════════════════════════════════════════
function updateTopbar(){
  const el=document.getElementById('tbSchool');
  const yr=document.getElementById('tbYear');
  const STATIC_SCHOOL_NAME='โรงเรียนค่ายบางระจันวิทยาคม';
  if(el) el.textContent=STATIC_SCHOOL_NAME;
  // Header school identity is static so it is visible immediately and never waits for DB.
  if(yr) yr.textContent='ปีการศึกษา '+(DB.school.year||'–');
  document.title=STATIC_SCHOOL_NAME+' | ระบบจัดตารางเรียน - ตารางสอน';
}
function updateSidebarCounts(){
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('sbTeacherCount',DB.teachers.length);
  set('sbSubjectCount',DB.subjects.length);
  set('sbRoomCount',DB.rooms.length);
  set('stTeacher',DB.teachers.length);
  set('stSubject',DB.subjects.length);
  set('stRoom',DB.rooms.length);
}
// ════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════


// ════════════════════════════════════════════
//  ANNOUNCEMENTS
// ════════════════════════════════════════════
function escHtml_(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(ch){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
  });
}
function renderDashboardAnnouncements(){
  const el=document.getElementById('dashboardAnnouncementList'); if(!el) return;
  const list=Array.isArray(DB.announcements)?DB.announcements.slice():[];
  list.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')) || Number(b.updatedAt||0)-Number(a.updatedAt||0));
  if(!list.length){
    el.innerHTML='<div class="dashboard-announcement-empty"><div><div style="font-size:30px;margin-bottom:7px">📭</div><div style="font-weight:800;color:var(--pri)">ยังไม่มีประกาศ</div><div style="margin-top:4px">ประกาศใหม่จากฝ่ายวิชาการจะแสดงที่นี่</div></div></div>';
    return;
  }
  el.innerHTML=list.slice(0,6).map(function(a){
    return '<button type="button" class="dashboard-announcement-row" onclick="nav(\'announcements\')">'+
      '<div class="dashboard-announcement-meta"><span class="dashboard-announcement-type">'+escHtml_(a.type||'ทั่วไป')+'</span><span class="dashboard-announcement-date">'+escHtml_(a.date||'')+'</span></div>'+
      '<div class="dashboard-announcement-title">'+escHtml_(a.title||'ประกาศ')+'</div>'+
      '<div class="dashboard-announcement-more">คลิกเพื่อดูรายละเอียด →</div></button>';
  }).join('');
}
function renderAnnouncements(){
  const el=document.getElementById('announcementList'); if(!el) return;
  const list=Array.isArray(DB.announcements)?DB.announcements.slice():[];
  list.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')) || Number(b.updatedAt||0)-Number(a.updatedAt||0));
  if(!list.length){
    el.innerHTML='<div class="announcement-empty"><div style="font-size:34px;margin-bottom:8px">📢</div><div style="font-weight:800;color:var(--pri)">ยังไม่มีประกาศ</div><div style="font-size:11px;margin-top:4px">เมื่อฝ่ายวิชาการเพิ่มประกาศ จะแสดงที่หน้านี้</div></div>';
    return;
  }
  el.innerHTML=list.map(function(a){
    const cls=a.type==='ด่วน'?'urgent':a.type==='สำคัญ'?'important':'general';
    const actions=(window.SCHOOL_AUTH&&SCHOOL_AUTH.loggedIn)
      ?'<div class="announcement-actions"><button class="btn btn-out btn-xs" onclick="openAnnouncementEditor(\''+escHtml_(a.id)+'\')">✏️ แก้ไข</button><button class="btn btn-danger btn-xs" onclick="deleteAnnouncement(\''+escHtml_(a.id)+'\')">🗑️ ลบ</button></div>'
      :'';
    return '<article class="announcement-item">'+
      '<div class="announcement-item-head"><div><span class="announcement-badge '+cls+'">'+escHtml_(a.type||'ทั่วไป')+'</span><div class="announcement-item-title">'+escHtml_(a.title)+'</div></div><div class="announcement-item-date">'+escHtml_(a.date||'')+'</div></div>'+
      '<div class="announcement-item-body">'+escHtml_(a.body)+'</div>'+actions+'</article>';
  }).join('');
}
function openAnnouncementEditor(id){
  if(!window.SCHOOL_AUTH||!SCHOOL_AUTH.loggedIn){toast('กรุณาเข้าสู่ระบบฝ่ายวิชาการ','warn');return;}
  const box=document.getElementById('announcementEditor'); if(!box) return;
  const item=id?(DB.announcements||[]).find(x=>x.id===id):null;
  document.getElementById('announcementEditorTitle').textContent=item?'✏️ แก้ไขประกาศ':'📢 เพิ่มประกาศ';
  document.getElementById('announcementEditId').value=item?item.id:'';
  document.getElementById('announcementTitle').value=item?item.title:'';
  document.getElementById('announcementType').value=item?item.type:'ทั่วไป';
  document.getElementById('announcementDate').value=item?item.date:new Date().toISOString().slice(0,10);
  syncSchoolDateControl('announcementDate');
  document.getElementById('announcementBody').value=item?item.body:'';
  box.style.display='block';
  box.scrollIntoView({behavior:'smooth',block:'start'});
}
function closeAnnouncementEditor(){
  const box=document.getElementById('announcementEditor'); if(box) box.style.display='none';
}
async function saveAnnouncement(){
  if(!window.SCHOOL_AUTH||!SCHOOL_AUTH.loggedIn){toast('กรุณาเข้าสู่ระบบฝ่ายวิชาการ','warn');return;}
  const title=gv('announcementTitle').trim(),body=gv('announcementBody').trim();
  if(!title||!body){toast('กรุณากรอกหัวข้อและรายละเอียดประกาศ','warn');return;}
  if(!Array.isArray(DB.announcements)) DB.announcements=[];
  const id=gv('announcementEditId');
  const now=Date.now();
  const existing=id?DB.announcements.find(x=>x.id===id):null;
  const item={
    id:id||uid(),
    title:title,
    body:body,
    type:gv('announcementType')||'ทั่วไป',
    date:gv('announcementDate')||new Date().toISOString().slice(0,10),
    createdAt:existing&&existing.createdAt?existing.createdAt:now,
    updatedAt:now
  };

  try{
    setSaveInd('saving','กำลังบันทึกประกาศ...');
    await postSchoolApi({
      action:'saveAnnouncement',
      token:SCHOOL_AUTH.token,
      announcement:JSON.stringify(item)
    });
    const i=DB.announcements.findIndex(x=>x.id===item.id);
    if(i>=0) DB.announcements[i]=item;
    else DB.announcements.push(item);

    closeAnnouncementEditor();
    renderAnnouncements();
    renderDashboardAnnouncements();
    setSaveInd('saved','บันทึกประกาศออนไลน์แล้ว · '+fmtTime(Date.now()));
    toast('✅ บันทึกประกาศออนไลน์แล้ว','succ');
  }catch(e){
    console.error('School-OS announcement save:',e);
    setSaveInd('unsaved','บันทึกประกาศไม่สำเร็จ');
    toast('บันทึกประกาศไม่สำเร็จ: '+e.message,'err');
    if(/Session หมดอายุ/.test(String(e.message||''))) academicLogout();
  }
}
async function deleteAnnouncement(id){
  if(!window.SCHOOL_AUTH||!SCHOOL_AUTH.loggedIn) return;
  if(!confirm('ลบประกาศนี้?')) return;
  try{
    setSaveInd('saving','กำลังลบประกาศ...');
    await postSchoolApi({action:'deleteAnnouncement',token:SCHOOL_AUTH.token,id:id});
    DB.announcements=(DB.announcements||[]).filter(x=>x.id!==id);

    renderAnnouncements();
    renderDashboardAnnouncements();
    setSaveInd('saved','ลบประกาศออนไลน์แล้ว · '+fmtTime(Date.now()));
    toast('ลบประกาศแล้ว','info');
  }catch(e){
    console.error('School-OS announcement delete:',e);
    setSaveInd('unsaved','ลบประกาศไม่สำเร็จ');
    toast('ลบประกาศไม่สำเร็จ: '+e.message,'err');
    if(/Session หมดอายุ/.test(String(e.message||''))) academicLogout();
  }
}

// ════════════════════════════════════════════
//  SCHOOL
// ════════════════════════════════════════════
function fillSchoolForm(){
  const s=DB.school;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||'';};
  set('scName',s.name);set('scAddr',s.address);set('scYear',s.year||'2568');
  set('scSem',s.semester||'1');set('scAcad',s.acadName);set('scAcadPos',s.acadPos);
  set('scPrincipal',s.principalName);set('scPrinPos',s.principalPos);
  StudentSignatures.fill(s);
  // restore logo
  if(s.logoDataUrl) renderLogoPreview(s.logoDataUrl,'โลโก้โรงเรียน','','medium');
  else clearLogoPreview();
}
function saveSchool(){
  let studentSigning;try{studentSigning=StudentSignatures.values();}catch(error){toast(error.message,'warn');return;}
  DB.school={...DB.school,...studentSigning,
    name:gv('scName'),address:gv('scAddr'),year:gv('scYear'),semester:gv('scSem'),
    acadName:gv('scAcad'),acadPos:gv('scAcadPos'),principalName:gv('scPrincipal'),principalPos:gv('scPrinPos'),
    logoDataUrl:DB.school.logoDataUrl||'',logoSize:'medium'
  };
  updateTopbar(); markDirty();
  showMsg('schoolSaveMsg','✅ บันทึกข้อมูลโรงเรียนแล้ว','succ');
}

// ════════════════════════════════════════════
//  TEACHERS
// ════════════════════════════════════════════
function renderTeacherTable(){
  const wrap=document.getElementById('teacherTableWrap'); if(!wrap) return;
  const q=(gv('teacherSearch')||'').toLowerCase();
  const dept=gv('teacherFilterDept')||'';
  let list=DB.teachers.filter(t=>{
    const n=(t.prefix+t.first+t.last).toLowerCase();
    return(!q||n.includes(q))&&(!dept||t.dept===dept);
  });
  const depts=[...new Set(DB.teachers.map(t=>t.dept).filter(Boolean))];
  const sel=document.getElementById('teacherFilterDept');
  if(sel){
    const cur=sel.value;
    sel.innerHTML='<option value="">ทุกกลุ่มสาระ</option>'+depts.map(d=>`<option value="${d}" ${d===cur?'selected':''}>${d}</option>`).join('');
  }
  if(!list.length){wrap.innerHTML='<div class="empty-state"><div class="empty-icon">👨‍🏫</div><div class="empty-text">ยังไม่มีรายชื่อครู</div><div class="empty-sub">กดปุ่ม "+ เพิ่มครู"</div></div>';return;}
  const wl=calcWorkload();
  wrap.innerHTML=`<table class="tbl"><thead><tr><th>#</th><th>ชื่อ-นามสกุล</th><th>วิทยฐานะ</th><th>กลุ่มสาระ</th><th>วิชาที่สอน</th><th>ภาระงาน</th><th>จัดการ</th></tr></thead>
  <tbody>${list.map((t,i)=>{
    const w=wl.find(x=>x.id===t.id)||{hours:0};
    const tags=(t.subjects||[]).map(s=>`<span class="tag" style="font-size:11px">${s}</span>`).join('');
    return`<tr>
      <td><strong>${i+1}</strong></td>
      <td><div style="font-weight:700">${t.prefix}${t.first} ${t.last}</div>
        <div style="font-size:11px;color:var(--muted)">${t.edu||''} ${t.phone?'| '+t.phone:''}</div></td>
      <td>${t.rank?`<span class="badge b-blue">${t.rank}</span>`:'-'}</td>
      <td>${t.dept||'-'}</td>
      <td><div class="tag-list" style="gap:3px">${tags||'<span style="color:var(--muted);font-size:12px">ยังไม่กำหนด</span>'}</div></td>
      <td><div class="wl-row">
        <div class="wl-bar-bg" style="min-width:50px"><div class="wl-bar-fill ${w.hours>20?'wl-over':w.hours>18?'wl-warn':'wl-ok'}" style="width:${Math.min(100,w.hours/25*100)}%"></div></div>
        <span class="wl-num" style="color:${w.hours>20?'var(--err)':w.hours>18?'var(--gold)':'var(--succ)'}">${w.hours}</span>
      </div></td>
      <td>
        <button class="btn btn-out btn-xs" onclick="openEditTeacher('${t.id}')">✏️ แก้ไข</button>
        <button class="btn btn-danger btn-xs" onclick="deleteTeacher('${t.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('')}</tbody></table>`;
}
function openAddTeacher(){
  refreshAllDeptDropdowns();
  editingTeacherId=null;
  document.getElementById('modalTeacherTitle').textContent='เพิ่มครู';
  ['tFirst','tLast','tEdu','tPhone','tEmail','tNote'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('tPrefix').value='นาย';
  document.getElementById('tRank').value='';
  document.getElementById('tDept').value='';
  document.getElementById('tEditId').value='';
  renderSubjectCheckboxes([]);
  openModal('modalTeacher');
}
function openEditTeacher(id){
  editingTeacherId=id;
  const t=DB.teachers.find(x=>x.id===id); if(!t) return;
  document.getElementById('modalTeacherTitle').textContent='แก้ไขข้อมูลครู';
  document.getElementById('tPrefix').value=t.prefix||'นาย';
  document.getElementById('tFirst').value=t.first||'';
  document.getElementById('tLast').value=t.last||'';
  document.getElementById('tEdu').value=t.edu||'';
  document.getElementById('tRank').value=t.rank||'';
  document.getElementById('tDept').value=t.dept||'';
  document.getElementById('tPhone').value=t.phone||'';
  document.getElementById('tEmail').value=t.email||'';
  document.getElementById('tNote').value=t.note||'';
  document.getElementById('tEditId').value=id;
  renderSubjectCheckboxes(t.subjects||[]);
  openModal('modalTeacher');
}
function renderSubjectCheckboxes(selected){
  const c=document.getElementById('tSubjectsChk'); if(!c) return;
  if(!DB.subjects.length){c.innerHTML='<span style="font-size:13px;color:var(--muted)">กรุณาเพิ่มวิชาก่อน</span>';return;}
  c.innerHTML=DB.subjects.map(s=>`
    <label style="display:flex;align-items:center;gap:5px;cursor:pointer;padding:4px 9px;
      border-radius:7px;border:1.5px solid ${selected.includes(s.name)?'var(--pri)':'var(--border)'};
      background:${selected.includes(s.name)?'#e8f0fe':'#fff'};font-size:12px;font-weight:600;user-select:none">
      <input type="checkbox" value="${s.name}" ${selected.includes(s.name)?'checked':''} style="display:none" onchange="toggleSubjCheck(this)">
      <span class="color-dot" style="background:${s.color}"></span>${s.name}
    </label>`).join('');
}
function toggleSubjCheck(inp){
  const lbl=inp.closest('label');
  if(inp.checked){lbl.style.border='1.5px solid var(--pri)';lbl.style.background='#e8f0fe';}
  else{lbl.style.border='1.5px solid var(--border)';lbl.style.background='#fff';}
}
function saveTeacher(){
  const first=gv('tFirst').trim(), last=gv('tLast').trim();
  if(!first||!last){alert('กรุณากรอกชื่อและนามสกุล'); return;}
  const subjects=[...document.querySelectorAll('#tSubjectsChk input:checked')].map(x=>x.value);
  const data={prefix:gv('tPrefix'),first,last,edu:gv('tEdu').trim(),rank:gv('tRank'),
    dept:gv('tDept'),phone:gv('tPhone').trim(),email:gv('tEmail').trim(),note:gv('tNote').trim(),subjects};
  const editId=document.getElementById('tEditId').value;
  if(editId){
    const i=DB.teachers.findIndex(x=>x.id===editId);
    if(i>=0) DB.teachers[i]={...DB.teachers[i],...data};
  } else {
    DB.teachers.push({id:uid(),...data,createdAt:Date.now()});
  }
  closeModal('modalTeacher');
  renderTeacherTable(); updateSidebarCounts(); markDirty();
  toast('✅ บันทึกข้อมูลครูแล้ว','succ');
}
function deleteTeacher(id){
  if(!confirm('ลบครูคนนี้?')) return;
  DB.teachers=DB.teachers.filter(t=>t.id!==id);
  renderTeacherTable(); updateSidebarCounts(); markDirty();
}

// ════════════════════════════════════════════
//  CSV IMPORT
// ════════════════════════════════════════════
function downloadTeacherTemplate(){
  const csv='ลำดับ,คำนำหน้า,ชื่อ,นามสกุล,วุฒิการศึกษา,วิทยฐานะ,กลุ่มสาระ,วิชาที่สอน(คั่น|),เบอร์โทร,อีเมล\n'+
    '1,นาย,สมชาย,ใจดี,ค.บ.,ครู คศ.2,คณิตศาสตร์,คณิตศาสตร์|วิทยาศาสตร์,0812345678,somchai@school.ac.th';
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  dlBlob(blob,'teacher_template.csv');
}
function handleCsvDrop(e){
  e.preventDefault();
  document.getElementById('csvDropZone').classList.remove('drag');
  const file=e.dataTransfer.files[0]; if(file) parseCsvFile(file);
}
function handleCsvFile(e){ const file=e.target.files[0]; if(file) parseCsvFile(file); }
function parseCsvFile(file){
  const reader=new FileReader();
  reader.onload=e=>{
    const txt=e.target.result.replace(/^\ufeff/,'');
    const rows=txt.split('\n').map(r=>r.trim()).filter(Boolean);
    if(rows.length<2){document.getElementById('csvPreview').innerHTML='<div class="alert a-err">ไฟล์ไม่มีข้อมูล</div>';return;}
    const data=rows.slice(1).map(r=>{
      const cols=r.split(',');
      return{prefix:cols[1]||'นาย',first:(cols[2]||'').trim(),last:(cols[3]||'').trim(),
        edu:(cols[4]||'').trim(),rank:(cols[5]||'').trim(),dept:(cols[6]||'').trim(),
        subjects:(cols[7]||'').split('|').map(s=>s.trim()).filter(Boolean),
        phone:(cols[8]||'').trim(),email:(cols[9]||'').trim(),note:''};
    }).filter(t=>t.first&&t.last);
    const prev=document.getElementById('csvPreview'); if(!prev) return;
    prev.innerHTML=`<div class="alert a-succ">✅ พบข้อมูลครู <strong>${data.length}</strong> คน</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อ-นามสกุล</th><th>วุฒิ</th><th>วิทยฐานะ</th><th>กลุ่มสาระ</th><th>วิชา</th></tr></thead>
      <tbody>${data.map(t=>`<tr><td>${t.prefix}${t.first} ${t.last}</td><td>${t.edu}</td><td>${t.rank}</td><td>${t.dept}</td>
        <td>${t.subjects.map(s=>`<span class="tag" style="font-size:11px">${s}</span>`).join('')}</td></tr>`).join('')}</tbody></table></div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-pri" id="csvImportBtn">✅ นำเข้าทั้งหมด</button>
        <button class="btn btn-ghost" onclick="document.getElementById('csvPreview').innerHTML=''">ยกเลิก</button>
      </div>`;
    document.getElementById('csvImportBtn').onclick=()=>doImportTeachers(data);
  };
  reader.readAsText(file,'UTF-8');
}
function doImportTeachers(data){
  let added=0;
  data.forEach(t=>{
    if(!DB.teachers.find(x=>x.first===t.first&&x.last===t.last)){
      DB.teachers.push({id:uid(),...t,createdAt:Date.now()}); added++;
    }
  });
  document.getElementById('csvPreview').innerHTML=`<div class="alert a-succ">✅ นำเข้าสำเร็จ ${added} คน</div>`;
  updateSidebarCounts(); markDirty(); toast(`✅ นำเข้า ${added} คน`,'succ'); nav('teachers');
}

// ════════════════════════════════════════════
//  SUBJECT GRADE HELPERS
// ════════════════════════════════════════════
function inferGradeFromSubjectCode(code){
  code=(code||'').trim();
  // รหัสรายวิชาแบบทั่วไป เช่น ค21101=ม.1, ค22101=ม.2, ว23101=ม.3,
  // ค31101=ม.4, ค32101=ม.5, ค33101=ม.6
  var m=code.match(/^[^0-9]*([23])([1-3])\d{3}/);
  if(!m) return '';
  var base=m[1]==='2'?0:3;
  return 'ม.'+(base+parseInt(m[2],10));
}
function subjectGrade(s){
  return (s&&s.grade) || inferGradeFromSubjectCode(s&&s.code) || '';
}
function roomGrade(roomId){
  var r=DB.rooms.find(function(x){return x.id===roomId;});
  return r ? (r.grade||'') : '';
}
function subjectsForRoom(roomId){
  var g=roomGrade(roomId);
  return DB.subjects.filter(function(s){
    var sg=subjectGrade(s);
    return sg==='ALL' || (!!g && sg===g);
  });
}
function findSubjectForRoom(name,roomId){
  return subjectsForRoom(roomId).find(function(s){return s.name===name;}) ||
         DB.subjects.find(function(s){return s.name===name;});
}
function autoDetectSubjectGrade(){
  var codeEl=document.getElementById('sjCode'), gradeEl=document.getElementById('sjGrade');
  if(!codeEl||!gradeEl) return;
  var g=inferGradeFromSubjectCode(codeEl.value);
  if(g && (!gradeEl.value || gradeEl.dataset.auto==='1')){
    gradeEl.value=g; gradeEl.dataset.auto='1';
  }
}

// ════════════════════════════════════════════
//  SUBJECTS
// ════════════════════════════════════════════
function renderSubjectTable(){
  renderCustomDeptList();
  const wrap=document.getElementById('subjectTableWrap'); if(!wrap) return;
  const allNames=DB.subjects.map(s=>s.name);
  const allPresets=[...new Set(Object.values(DEF_SUBJ_PRESETS).flat())].filter(n=>!allNames.includes(n));
  const qa=document.getElementById('quickAddSubjs');
  if(qa) qa.innerHTML=allPresets.slice(0,12).map(n=>`<button class="btn btn-ghost btn-xs" onclick="quickAddSubject('${n.replace(/'/,"\\'")}')">${'+'+n}</button>`).join('');
  if(!DB.subjects.length){wrap.innerHTML='<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">ยังไม่มีวิชา</div></div>';return;}
  wrap.innerHTML=`<table class="tbl"><thead><tr><th>#</th><th>สี</th><th>ชื่อวิชา</th><th>รหัส</th><th>ระดับชั้น</th><th>กลุ่มสาระ</th><th>ชม./สัปดาห์</th><th>จัดการ</th></tr></thead>
  <tbody>${DB.subjects.map((s,i)=>`<tr>
    <td>${i+1}</td>
    <td><span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${s.color};border:1px solid rgba(0,0,0,.1)"></span></td>
    <td><strong>${s.name}</strong></td><td>${s.code||'-'}</td><td><span class="badge b-purple">${subjectGrade(s)||'ยังไม่กำหนด'}</span></td><td>${s.dept||'-'}</td><td>${s.hours||1}</td>
    <td>
      <button class="btn btn-out btn-xs" onclick="openEditSubject('${s.id}')">✏️</button>
      <button class="btn btn-danger btn-xs" onclick="deleteSubject('${s.id}')">🗑️</button>
    </td>
  </tr>`).join('')}</tbody></table>`;
}
function quickAddSubject(name){
  openAddSubject();
  document.getElementById('sjName').value=name;
  var p=PRIMARY_SUBJECTS_FULL.find(function(x){return x.name===name;});
  if(p){
    document.getElementById('sjCode').value=p.code||'';
    document.getElementById('sjDept').value=p.dept||'';
    document.getElementById('sjHours').value=p.hours||1;
    autoDetectSubjectGrade();
    autoDetectSubjectColor(true);
  }
}
function openAddSubject(){
  refreshAllDeptDropdowns();
  editingSubjectId=null;
  document.getElementById('modalSubjectTitle').textContent='เพิ่มวิชา';
  ['sjName','sjCode'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('sjDept').value='';
  document.getElementById('sjGrade').value='';
  document.getElementById('sjGrade').dataset.auto='0';
  document.getElementById('sjHours').value='1';
  document.getElementById('sjEditId').value='';
  selectedSubjColor=SUBJECT_COLOR_PALETTES._default[0];
  renderColorPicker();
  openModal('modalSubject');
}
function openEditSubject(id){
  editingSubjectId=id;
  const s=DB.subjects.find(x=>x.id===id); if(!s) return;
  document.getElementById('modalSubjectTitle').textContent='แก้ไขวิชา';
  document.getElementById('sjName').value=s.name;
  document.getElementById('sjCode').value=s.code||'';
  document.getElementById('sjDept').value=s.dept||'';
  document.getElementById('sjGrade').value=subjectGrade(s)||'';
  document.getElementById('sjGrade').dataset.auto='0';
  document.getElementById('sjHours').value=s.hours||1;
  document.getElementById('sjEditId').value=id;
  var pal=subjectPalette(s.dept || inferDeptForSubject(s.code,s.name));
  selectedSubjColor=pal.includes(s.color)?s.color:autoColorForSubject(s.dept,s.code,s.name,s.id);
  renderColorPicker();
  openModal('modalSubject');
}
function renderColorPicker(){
  const el=document.getElementById('colorPicker'); if(!el) return;
  var deptEl=document.getElementById('sjDept');
  var codeEl=document.getElementById('sjCode');
  var nameEl=document.getElementById('sjName');
  var d=(deptEl&&deptEl.value) || inferDeptForSubject(codeEl?codeEl.value:'',nameEl?nameEl.value:'') || '';
  var pal=subjectPalette(d);
  el.innerHTML=pal.map(c=>`<div class="sc-opt${c===selectedSubjColor?' sel':''}" style="background:${c}" title="เฉดสีของ ${d||'หมวดทั่วไป'}" onclick="pickColor('${c}')"></div>`).join('');
}
function pickColor(c){ selectedSubjColor=c; renderColorPicker(); }
function saveSubject(){
  const name=gv('sjName').trim(); if(!name){alert('กรุณากรอกชื่อวิชา');return;}
  const grade=gv('sjGrade'); if(!grade){alert('กรุณาเลือกระดับชั้นของวิชา');return;}
  const code=gv('sjCode').trim();
  const dept=gv('sjDept') || inferDeptForSubject(code,name) || '';
  const pal=subjectPalette(dept);
  const editId=document.getElementById('sjEditId').value;
  if(!pal.includes(selectedSubjColor)) selectedSubjColor=autoColorForSubject(dept,code,name,editId);
  const data={name,code,grade,dept,hours:+(gv('sjHours')||1),color:selectedSubjColor};

  if(editId){
    const i=DB.subjects.findIndex(x=>x.id===editId);
    if(i>=0) DB.subjects[i]={...DB.subjects[i],...data};
  } else {
    DB.subjects.push({id:uid(),...data});
  }
  closeModal('modalSubject'); renderSubjectTable(); updateSidebarCounts(); markDirty();
  toast('✅ บันทึกวิชาแล้ว','succ');
}
function deleteSubject(id){
  if(!confirm('ลบวิชานี้?')) return;
  DB.subjects=DB.subjects.filter(s=>s.id!==id);
  renderSubjectTable(); updateSidebarCounts(); markDirty();
}

// ════════════════════════════════════════════
//  ROOMS
// ════════════════════════════════════════════
function renderRoomTable(){
  const wrap=document.getElementById('roomTableWrap'); if(!wrap) return;
  if(!DB.rooms.length){
    wrap.innerHTML='<div class="empty-state"><div class="empty-icon">🚪</div><div class="empty-text">ยังไม่มีห้องเรียน</div><div class="empty-sub">กดปุ่ม "+ เพิ่มห้องเรียน"</div></div>';return;
  }
  const total=TeacherSchedule.studentSlots(DB).length*DB.days.length;
  wrap.innerHTML=`<table class="tbl"><thead><tr><th>#</th><th>ชั้น/ห้อง</th><th>ระดับ</th><th>ครูประจำชั้น</th><th>ความคืบหน้า</th><th>จัดการ</th></tr></thead>
  <tbody>${DB.rooms.map((r,i)=>{
    const f=Object.keys(DB.sched).filter(k=>k.startsWith(r.id+'_')&&DB.sched[k]&&DB.sched[k].subject).length;
    const pct=total?Math.round(f/total*100):0;
    const hr=DB.teachers.find(t=>t.id===r.homeroom);
    return`<tr>
      <td>${i+1}</td>
      <td><strong>${r.label}</strong><div style="font-size:11px;color:var(--muted)">ห้องเรียนหลัก: ${TeacherSchedule.escape(r.baseRoom||'ยังไม่กำหนด')}</div></td>
      <td><span class="badge b-purple">${r.level}</span></td>
      <td>${hr?`<span class="tchr-chip">${hr.prefix}${hr.first} ${hr.last}</span>`:'<span style="color:var(--muted);font-size:12px">ยังไม่กำหนด</span>'}</td>
      <td><div class="wl-row"><div class="wl-bar-bg"><div class="wl-bar-fill wl-ok" style="width:${pct}%"></div></div><span style="font-size:12px;min-width:35px">${pct}%</span></div></td>
      <td>
        <button class="btn btn-gold btn-xs" onclick="goToBuilder('${r.id}')">🗓️ ตาราง</button>
        <button class="btn btn-out btn-xs" onclick="openEditRoom('${r.id}')">✏️</button>
        <button class="btn btn-danger btn-xs" onclick="deleteRoom('${r.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('')}</tbody></table>`;
}
function updateRmGrade(){
  const lvl=document.getElementById('rmLevel').value;
  const isSpecial = lvl==='ห้องพิเศษ';
  const gradeWrap=document.getElementById('rmGradeWrap');
  const customWrap=document.getElementById('rmCustomGradeWrap');
  const planWrap=document.getElementById('rmSpecialPlanWrap');
  if(gradeWrap) gradeWrap.style.display=isSpecial?'none':'flex';
  if(customWrap) customWrap.style.display=isSpecial?'flex':'none';
  if(planWrap) planWrap.style.display=lvl==='มัธยมศึกษาตอนปลาย'?'flex':'none';
  if(!isSpecial){
    const sel=document.getElementById('rmGrade'); if(!sel) return;
    sel.innerHTML=(GRADE_MAP[lvl]||[]).map(g=>`<option>${g}</option>`).join('');
  }
  updateRmPreview();
}
function syncSpecialPlan(){
  const sel=document.getElementById('rmSpecialPlan');
  const customWrap=document.getElementById('rmPlanCustomWrap');
  if(!sel) return;
  if(customWrap) customWrap.style.display=sel.value==='พิมพ์เอง'?'flex':'none';
  if(sel.value&&sel.value!=='พิมพ์เอง'){
    const roomInp=document.getElementById('rmRoom');
    if(roomInp&&!roomInp.dataset.userEdited) roomInp.value=sel.value;
  }
  updateRmPreview();
}
function updateRmPreview(){
  const el=document.getElementById('rmPreview'); if(!el) return;
  const lvl=document.getElementById('rmLevel').value;
  const isSpecial=lvl==='ห้องพิเศษ';
  const grade=isSpecial?(document.getElementById('rmCustomGrade').value||'ห้องพิเศษ')
                       :document.getElementById('rmGrade').value;
  const room=document.getElementById('rmRoom').value||'1';
  const label=grade+'/'+room;
  el.innerHTML=`<div class="alert a-info" style="margin:0;font-size:12px">📋 ชื่อห้องที่จะแสดง: <strong>${label}</strong> (${lvl})</div>`;
}
function openAddRoom(){
  editingRoomId=null;
  document.getElementById('modalRoomTitle').textContent='เพิ่มห้องเรียน';
  document.getElementById('rmLevel').value='มัธยมศึกษาตอนต้น';
  document.getElementById('rmRoom').value='1';
  document.getElementById('rmEditId').value='';
  document.getElementById('rmBaseRoom').value='';
  const planWrap=document.getElementById('rmSpecialPlanWrap');
  if(planWrap) planWrap.style.display='none';
  const planCustomWrap=document.getElementById('rmPlanCustomWrap');
  if(planCustomWrap) planCustomWrap.style.display='none';
  updateRmGrade();
  populateHomeroomSel('','','');
  openModal('modalRoom');
}
function openEditRoom(id){
  editingRoomId=id;
  const r=DB.rooms.find(x=>x.id===id); if(!r) return;
  document.getElementById('modalRoomTitle').textContent='แก้ไขห้องเรียน';
  document.getElementById('rmLevel').value=r.level;
  updateRmGrade();
  document.getElementById('rmGrade').value=r.grade;
  document.getElementById('rmRoom').value=r.room;
  document.getElementById('rmEditId').value=id;
  document.getElementById('rmBaseRoom').value=r.baseRoom||'';
  populateHomeroomSel(r.homeroom||'', r.homeroom2||'', r.homeroom3||'');
  openModal('modalRoom');
}
function populateHomeroomSel(sel1, sel2, sel3){
  var mkOpts = function(selected) {
    return '<option value="">-- เลือก --</option>' +
      DB.teachers.map(function(t){
        var n = t.prefix+t.first+' '+t.last;
        return '<option value="'+t.id+'"'+(t.id===(selected||'')?' selected':'')+'>'+n+'</option>';
      }).join('');
  };
  var e1=document.getElementById('rmHomeroom');   if(e1) e1.innerHTML=mkOpts(sel1);
  var e2=document.getElementById('rmHomeroom2');  if(e2) e2.innerHTML=mkOpts(sel2);
  var e3=document.getElementById('rmHomeroom3');  if(e3) e3.innerHTML=mkOpts(sel3);
}
function saveRoom(){
  const level=document.getElementById('rmLevel').value;
  const isSpecial=level==='ห้องพิเศษ';
  const grade=isSpecial
    ?(document.getElementById('rmCustomGrade').value.trim()||'ห้องพิเศษ')
    :document.getElementById('rmGrade').value;
  const room=gv('rmRoom').trim();
  if(!room){alert('กรุณากรอกห้อง/แผนการเรียน');return;}
  const homeroom=document.getElementById('rmHomeroom').value;
  const homeroom2=(document.getElementById('rmHomeroom2')||{}).value||'';
  const homeroom3=(document.getElementById('rmHomeroom3')||{}).value||'';
  // plan name for upper secondary
  let planName='';
  if(level==='มัธยมศึกษาตอนปลาย'){
    const planSel=document.getElementById('rmSpecialPlan');
    if(planSel&&planSel.value&&planSel.value!=='พิมพ์เอง') planName=planSel.value;
    else {
      const planCustom=document.getElementById('rmPlanCustom');
      if(planCustom&&planCustom.value.trim()) planName=planCustom.value.trim();
    }
  }
  const label=grade+'/'+(planName||room);
  const baseRoom=gv('rmBaseRoom').trim();
  const data={level,grade,room:planName||room,homeroom,label,planName,baseRoom};
  const editId=document.getElementById('rmEditId').value;
  if(editId){
    const i=DB.rooms.findIndex(x=>x.id===editId);
    if(i>=0) DB.rooms[i]={...DB.rooms[i],...data};
  } else {
    DB.rooms.push({id:uid(),...data});
  }
  closeModal('modalRoom'); renderRoomTable(); updateSidebarCounts(); markDirty();
  toast('✅ บันทึกห้องเรียนแล้ว','succ');
}
function deleteRoom(id){
  if(!confirm('ลบห้องนี้และตารางทั้งหมด?')) return;
  DB.rooms=DB.rooms.filter(r=>r.id!==id);
  Object.keys(DB.sched).filter(k=>k.startsWith(id+'_')).forEach(k=>delete DB.sched[k]);
  renderRoomTable(); updateSidebarCounts(); markDirty();
}
function goToBuilder(roomId){ currentBuilderRoom=roomId; nav('builder'); }

// ════════════════════════════════════════════
//  TIME SLOTS
// ════════════════════════════════════════════
function renderTimeslots(){
  renderSlotsUI(); renderDayPicker();
}
function renderSlotsUI(){
  const el=document.getElementById('slotsUI'); if(!el) return;
  el.innerHTML=DB.slots.map((sl,i)=>{
    const isB=sl.isBreak||false;
    const rowBg=isB?'background:#FFF8E1;border-color:#FFC107':'background:#f5f8ff;border:1px solid var(--border)';
    return `<div class="slot-row-wrap" style="${rowBg}">
      ${isB?'<span class="slot-break-badge">☀️ พัก</span>':'<span style="font-size:12px;font-weight:700;color:var(--pri);min-width:28px">'+(i+1)+'.</span>'}
      <input type="text" value="${sl.label}" style="width:90px;padding:5px 7px;font-size:12px;${isB?'font-weight:700;color:#E65100':''}" data-sloti="${i}" data-field="label" oninput="updateSlotField(this)">
      <input type="time" value="${sl.start}" style="width:90px;padding:5px 7px;font-size:12px" data-sloti="${i}" data-field="start" onchange="updateSlotField(this)">
      <span style="font-size:12px;color:var(--muted)">–</span>
      <input type="time" value="${sl.end}" style="width:90px;padding:5px 7px;font-size:12px" data-sloti="${i}" data-field="end" onchange="updateSlotField(this)">
      <label style="display:flex;align-items:center;gap:4px;font-size:11px;color:#E65100;font-weight:700;white-space:nowrap;cursor:pointer" title="ทำเครื่องหมายเป็นคาบพัก (จะไม่มีช่องวิชาในตาราง)">
        <input type="checkbox" class="slot-break-chk" ${isB?'checked':''} data-sloti="${i}" onchange="toggleBreakSlot(this)">พักเที่ยง</label>
      <label style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer" title="แสดงในตารางครูเท่านั้น ไม่แสดงในตารางนักเรียน"><input type="checkbox" ${sl.teacherOnly?'checked':''} ${isB?'disabled':''} data-sloti="${i}" onchange="toggleTeacherOnlySlot(this)">เฉพาะครู</label>
      <button class="btn btn-danger btn-xs" onclick="removeSlot(${i})">ลบ</button>
    </div>`;
  }).join('');
}

function toggleTeacherOnlySlot(chk){
 try{TeacherSchedule.setSlotTeacherOnly(DB,DB.slots[+chk.dataset.sloti].id,chk.checked);markDirty();}catch(error){toast(error.message,'warn');}renderSlotsUI();
}
function toggleBreakSlot(chk) {
  var i = +chk.dataset.sloti;
  if(DB.slots[i]) {
    DB.slots[i].isBreak = chk.checked;
    if(chk.checked)DB.slots[i].teacherOnly=false;
    if(chk.checked) {
      // Auto-set label to พักเที่ยง if generic
      if(!DB.slots[i].label || DB.slots[i].label.startsWith('คาบ')) {
        DB.slots[i].label = 'พักเที่ยง';
      }
    }
  }
  renderSlotsUI(); markDirty();
}

function addBreakSlot() {
  var maxId = DB.slots.length ? Math.max.apply(null, DB.slots.map(function(s){return s.id;})) : 0;
  // Find best insert position (after slot 4, before slot 5 if exists)
  DB.slots.push({id:maxId+1, label:'พักเที่ยง', start:'12:00', end:'13:00', isBreak:true});
  // Sort by start time
  DB.slots.sort(function(a,b){ return a.start.localeCompare(b.start); });
  renderSlotsUI(); markDirty();
  toast('☀️ เพิ่มคาบพักเที่ยงแล้ว — แก้ไขเวลาได้ตามต้องการ','succ');
}


function toggleCellLock(btn) {
  var room = btn.dataset.room, slot = btn.dataset.slot, day = btn.dataset.day;
  var k = room+'_'+slot+'_'+day;
  if(!DB.sched[k]) DB.sched[k] = {subject:'',teacher:'',teacher2:'',teacher3:'',learnRoom:'',locked:false};
  DB.sched[k].locked = !DB.sched[k].locked;
  markDirty();
  // Update visual
  btn.classList.toggle('locked', DB.sched[k].locked);
  btn.textContent = DB.sched[k].locked ? '🔒' : '🔓';
  btn.title = DB.sched[k].locked ? 'ล็อกไว้ (คลิกเพื่อปลด)' : 'ปลดล็อก (คลิกเพื่อล็อก)';
  var td = btn.closest('td');
  if(td) td.classList.toggle('td-locked', DB.sched[k].locked);
  toast(DB.sched[k].locked ? '🔒 ล็อกคาบเรียนแล้ว' : '🔓 ปลดล็อกคาบเรียน', 'info');
}
function isCellLocked(k) {
  return !!(DB.sched[k] && DB.sched[k].locked);
}

function updateLearnRoom(inp) {
  var room = inp.dataset.room, slot = inp.dataset.slot, day = inp.dataset.day;
  var k = room+'_'+slot+'_'+day;
  if(!DB.sched[k]) DB.sched[k] = {subject:'',teacher:'',teacher2:'',teacher3:'',learnRoom:''};
  var baseRoom=(DB.rooms.find(r=>r.id===room)||{}).baseRoom||'';
  DB.sched[k].learnRoom = inp.value.trim()===baseRoom.trim()?'':inp.value.trim();
  markDirty();
}

function updateSlotField(inp){
  const i=+inp.dataset.sloti, field=inp.dataset.field;
  if(DB.slots[i]) DB.slots[i][field]=inp.value;
  markDirty();
}
function addSlot(){
  const maxId=DB.slots.length?Math.max(...DB.slots.map(s=>s.id)):0;
  DB.slots.push({id:maxId+1,label:'คาบที่ '+(maxId+1),start:'16:00',end:'16:50'});
  renderSlotsUI(); markDirty();
}
function removeSlot(i){  const id=DB.slots[i].id; DB.slots.splice(i,1);
  Object.keys(DB.sched).filter(k=>k.split('_')[1]==String(id)).forEach(k=>delete DB.sched[k]);
  renderSlotsUI(); markDirty();
}
function renderDayPicker(){
  const el=document.getElementById('dayPicker'); if(!el) return;
  el.innerHTML=ALL_DAYS.map(d=>
    `<div class="rtab${DB.days.includes(d)?' active':''}" onclick="toggleDay('${d}')" style="min-width:80px">${d}</div>`).join('');
}
function toggleDay(d){
  if(DB.days.includes(d)) DB.days=DB.days.filter(x=>x!==d);
  else if(DB.days.length<7) {
    // Keep days in natural order (Mon-Sun)
    DB.days.push(d);
    DB.days.sort(function(a,b){
      return ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b);
    });
  }
  renderDayPicker(); markDirty();
  if(typeof renderBuilder==='function') renderBuilder();
}

// ════════════════════════════════════════════
//  SCHEDULE BUILDER
// ════════════════════════════════════════════
function renderBuilder(){
  const tabs=document.getElementById('builderRoomTabs');
  const grid=document.getElementById('builderGrid');
  if(!tabs||!grid) return;
  if(!DB.rooms.length){
    tabs.innerHTML='';
    grid.innerHTML='<div class="empty-state"><div class="empty-icon">🚪</div><div class="empty-text">ยังไม่มีห้องเรียน</div><button class="btn btn-pri" style="margin-top:12px" onclick="nav(\'rooms\')">+ เพิ่มห้องเรียน</button></div>';
    return;
  }
  if(!currentBuilderRoom||!DB.rooms.find(r=>r.id===currentBuilderRoom)) currentBuilderRoom=DB.rooms[0].id;
  schoolRememberBuilderRoom(currentBuilderRoom);
  tabs.innerHTML=DB.rooms.map(r=>`
    <div class="rtab${r.id===currentBuilderRoom?' active':''}" onclick="switchBuilderRoom('${r.id}')">🚪 ${r.label}</div>`).join('')+
    `<button class="btn btn-out btn-sm" onclick="nav('rooms')" style="margin-left:4px">+ ห้องใหม่</button>`;
  if(!TeacherSchedule.studentSlots(DB).length||!DB.days.length){
    grid.innerHTML='<div class="alert a-warn">กรุณาตั้งค่าคาบเรียนและวันเรียนก่อน</div>';return;
  }
  // ตารางสอนแบบมาตรฐาน: วันอยู่แนวตั้งด้านซ้าย / คาบและเวลาอยู่แถวบน
  const slotHds=TeacherSchedule.studentSlots(DB).map(sl=>{
    if(sl.isBreak){
      return `<th style="background:#E65100;min-width:66px;width:66px">
        <div style="font-weight:800">${sl.label}</div>
        <div style="font-size:10px;opacity:.85;margin-top:2px">${sl.start}–${sl.end}</div>
      </th>`;
    }
    return `<th style="min-width:118px">
      <div style="font-weight:800">${sl.label}</div>
      <div style="font-size:10px;opacity:.8;margin-top:2px">${sl.start}–${sl.end}</div>
    </th>`;
  }).join('');

  const rows=DB.days.map((d,dayIndex)=>{
    const cells=TeacherSchedule.studentSlots(DB).map(sl=>{
      if(sl.isBreak){
        if(dayIndex>0) return '';
        return `<td class="builder-break-cell" rowspan="${DB.days.length}" style="min-width:66px;width:66px;background:#FFF8E1;vertical-align:middle;text-align:center">
          <div style="font-weight:800;color:#E65100;writing-mode:vertical-rl;transform:rotate(180deg);margin:auto;letter-spacing:1px">พักเที่ยง</div>
        </td>`;
      }
      const k=currentBuilderRoom+'_'+sl.id+'_'+d;
      const cv=DB.sched[k]||{subject:'',teacher:''};
      const subj=findSubjectForRoom(cv.subject,currentBuilderRoom);
      const bg=cv.subject&&subj?subj.color+'99':'transparent';
      return`<td class="${cv.locked?'td-locked':''}" style="background:${bg};position:relative">
        <select class="cell-subj-sel" data-room="${currentBuilderRoom}" data-slot="${sl.id}" data-day="${d}">
          <option value="">-- วิชา --</option>${buildSubjOptsWithQuota(cv.subject||'', currentBuilderRoom)}
        </select>
        <select class="cell-tchr-sel" data-room="${currentBuilderRoom}" data-slot="${sl.id}" data-day="${d}">
          ${buildTeacherOptsConflict(cv.subject,cv.teacher,sl.id,d,currentBuilderRoom)}
        </select>
        <select class="cell-tchr-sel cell-tchr2-sel" data-room="${currentBuilderRoom}" data-slot="${sl.id}" data-day="${d}" title="ครูคนที่ 2 (ถ้ามี)" style="border-color:#9AA5C0;background:#F8F9FF">
          ${buildTeacherOptsConflict(cv.subject,cv.teacher2||'',sl.id,d,currentBuilderRoom)}
        </select>
        <select class="cell-tchr-sel cell-tchr3-sel" data-room="${currentBuilderRoom}" data-slot="${sl.id}" data-day="${d}" title="ครูคนที่ 3 (ถ้ามี)" style="border-color:#7A8AB0;background:#F0F4FF">
          ${buildTeacherOptsConflict(cv.subject,cv.teacher3||'',sl.id,d,currentBuilderRoom)}
        </select>
        <input type="text" class="cell-room-inp"
          placeholder="ห้อง เช่น 101, ห้องคอม"
          data-room="${currentBuilderRoom}" data-slot="${sl.id}" data-day="${d}"
          value="${TeacherSchedule.escape(TeacherSchedule.learnRoom(DB,cv,currentBuilderRoom))}"
          aria-label="ห้องเรียน ${TeacherSchedule.escape(d)} ${TeacherSchedule.escape(sl.label)}"
          oninput="updateLearnRoom(this)" onblur="this.value=TeacherSchedule.learnRoom(DB,DB.sched[this.dataset.room+'_'+this.dataset.slot+'_'+this.dataset.day],this.dataset.room)"
          title="แก้ห้องเฉพาะคาบนี้ ล้างข้อความเพื่อกลับไปใช้ห้องเรียนหลัก">
        <button class="cell-lock-btn ${cv.locked?'locked':''}" type="button"
          data-room="${currentBuilderRoom}" data-slot="${sl.id}" data-day="${d}"
          onclick="toggleCellLock(this); event.stopPropagation();"
          title="${cv.locked?'ล็อกไว้ (คลิกเพื่อปลด)':'ปลดล็อก (คลิกเพื่อล็อก)'}">${cv.locked?'🔒':'🔓'}</button>
      </td>`;
    }).join('');
    return `<tr><td class="td-period" style="font-weight:800;font-size:12px;color:var(--pri);min-width:74px;width:74px">${d}</td>${cells}</tr>`;
  }).join('');

  grid.innerHTML=`<div class="sched-wrap"><table class="sched-tbl" style="min-width:${Math.max(700,74+(TeacherSchedule.studentSlots(DB).filter(s=>!s.isBreak).length*118)+(TeacherSchedule.studentSlots(DB).some(s=>s.isBreak)?66:0))}px">
    <thead><tr><th class="th-time" style="min-width:74px;width:74px">วัน/คาบ</th>${slotHds}</tr></thead>
    <tbody>${rows}</tbody></table></div>`;
  // bind events AFTER DOM is set
  // Add conflict badges to pre-existing cells
  document.querySelectorAll('.cell-tchr-sel').forEach(function(sel){
    if(sel.value){
      var d2=sel.dataset, k2=d2.room+'_'+d2.slot+'_'+d2.day;
      if(isTeacherBusy(sel.value,d2.slot,d2.day,d2.room)){
        sel.classList.add('has-conflict');
        var td2=sel.closest('td');
        var old2=td2?td2.querySelector('.cell-warn-badge,.cell-ok-badge'):null;
        if(old2) old2.remove();
        if(td2){
          var b=document.createElement('span');
          b.className='cell-warn-badge';
          var cf2=isTeacherBusy(sel.value,d2.slot,d2.day,d2.room);
          b.textContent='⚠️ ชนกัน: '+cf2.map(function(x){return x.roomLabel;}).join(', ');
          td2.appendChild(b);
        }
      }
    }
  });
  document.querySelectorAll('.cell-subj-sel').forEach(function(sel){
    sel.addEventListener('change', function(){
      var room=this.dataset.room, slot=this.dataset.slot, day=this.dataset.day;
      var k = room+'_'+slot+'_'+day;
      if(!DB.sched[k]) DB.sched[k]={subject:'',teacher:'',teacher2:'',teacher3:'',learnRoom:''};
      // Clear teacher when subject changes
      if(DB.sched[k].subject !== this.value) {
        DB.sched[k].teacher = '';
        DB.sched[k].teacher2 = '';
        DB.sched[k].teacher3 = '';
      }
      DB.sched[k].subject = this.value;
      // Build conflict-aware teacher dropdown
      var tchrSel = this.parentElement.querySelector('.cell-tchr-sel');
      if(tchrSel) {
        tchrSel.innerHTML = buildTeacherOptsConflict(this.value, DB.sched[k].teacher, slot, day, room);
        tchrSel.classList.remove('has-conflict');
      }
      // Auto-fill if only 1 eligible teacher
      var eligible = this.value ? DB.teachers.filter(function(t){return (t.subjects||[]).includes(this.value);}, this) : DB.teachers;
      if(eligible.length===1 && !DB.sched[k].teacher){
        var n = eligible[0].prefix+eligible[0].first+' '+eligible[0].last;
        DB.sched[k].teacher = n;
        if(tchrSel) tchrSel.value = n;
        // Show warning if this auto-filled teacher is busy
        showConflictWarning(n, slot, day, room);
      }
      // Update cell background
      var subj = findSubjectForRoom(this.value, room);
      this.closest('td').style.background = this.value&&subj ? subj.color+'99' : 'transparent';
      markDirty();
      // Refresh all conflict UI + quota
      refreshBuilderUI();
    });
  });
  document.querySelectorAll('.cell-tchr-sel').forEach(function(sel){
    sel.addEventListener('change', function(){
      var room=this.dataset.room, slot=this.dataset.slot, day=this.dataset.day;
      var k = room+'_'+slot+'_'+day;
      if(!DB.sched[k]) DB.sched[k]={subject:'',teacher:'',teacher2:'',teacher3:'',learnRoom:''};
      var isT2 = this.classList.contains('cell-tchr2-sel');
      var isT3 = this.classList.contains('cell-tchr3-sel');
      if(isT3)      { DB.sched[k].teacher3 = this.value; }
      else if(isT2) { DB.sched[k].teacher2 = this.value; }
      else          { DB.sched[k].teacher  = this.value; }
      // Real-time conflict warning
      if(this.value) showConflictWarning(this.value, slot, day, room);
      markDirty();
      // Instant full refresh
      refreshAllConflictUI();
      renderQuotaPanel(room);
      // Refresh teacher dropdowns in same slot/day of other rooms
      document.querySelectorAll('.cell-tchr-sel').forEach(function(otherSel){
        if(otherSel === sel) return;
        if(otherSel.dataset.slot===slot && otherSel.dataset.day===day){
          var oRoom=otherSel.dataset.room, oK=oRoom+'_'+slot+'_'+day;
          var oCv = DB.sched[oK]||{};
          otherSel.innerHTML = buildTeacherOptsConflict(oCv.subject||'', oCv.teacher||'', slot, day, oRoom);
          if(oCv.teacher) otherSel.value = oCv.teacher;
        }
      });
    });
  });
}

// ════════════════════════════════════════════════════
// REAL-TIME CONFLICT PREVENTION SYSTEM
// ════════════════════════════════════════════════════

// Check if a teacher is busy at a specific slot/day (ignoring current cell)

// Refresh all cell conflict badges + sidebar badge in one sweep

// ══════════════════════════════════════════════════════════════
// SUBJECT QUOTA SYSTEM
// ══════════════════════════════════════════════════════════════

// Count how many times a subject is used in a specific room's schedule
function countSubjectInRoom(roomId, subjName) {
  var count = 0;
  Object.keys(DB.sched).forEach(function(k) {
    var parts = k.split('_');
    if(parts[0] === roomId && DB.sched[k] && DB.sched[k].subject === subjName) count++;
  });
  return count;
}

// Get quota status for all subjects in current room
function getQuotaStatus(roomId) {
  return subjectsForRoom(roomId).map(function(s) {
    var used = countSubjectInRoom(roomId, s.name);
    var target = s.hours || 1;
    return {
      id: s.id, name: s.name, color: s.color,
      target: target, used: used,
      remaining: target - used,
      pct: Math.min(100, Math.round(used / target * 100))
    };
  });
}

// Render the quota panel in builder
var _quotaPanelOpen = false;
function renderQuotaPanel(roomId) {
  var el = document.getElementById('quotaPanel');
  if(!el || !roomId) return;
  var roomSubjects=subjectsForRoom(roomId);
  if(!roomSubjects.length) { el.innerHTML = '<div class="alert a-warn" style="margin:0 0 12px">ยังไม่มีวิชาสำหรับระดับ '+(roomGrade(roomId)||'-')+' — กรุณากำหนดระดับชั้นในเมนู วิชาเรียน</div>'; return; }

  var statuses = getQuotaStatus(roomId);
  var totalSlots = TeacherSchedule.studentSlots(DB).length * DB.days.length;
  var filled = Object.keys(DB.sched).filter(function(k) {
    return k.split('_')[0]===roomId && DB.sched[k] && DB.sched[k].subject;
  }).length;

  var rows = statuses.map(function(s) {
    var pctFill = s.pct;
    var barColor = s.remaining > 0 ? s.color : (s.remaining < 0 ? '#C62828' : '#2E7D32');
    var countClass = s.remaining === 0 ? 'done' : (s.remaining < 0 ? 'over' : (s.remaining <= 1 ? 'warn' : ''));
    var countText = s.remaining === 0 ? '\u2705' : (s.remaining < 0 ? '+'+Math.abs(s.remaining) : s.remaining);
    return '<div class="quota-row">' +
      '<div class="quota-dot" style="background:'+s.color+'"></div>' +
      '<div class="quota-name">'+s.name+'</div>' +
      '<div class="quota-bar-wrap"><div class="quota-bar-fill" style="width:'+pctFill+'%;background:'+barColor+'"></div></div>' +
      '<div class="quota-count '+countClass+'">'+countText+'</div>' +
      '<div style="font-size:10px;color:var(--muted);min-width:40px;text-align:right">'+s.used+'/'+s.target+'</div>' +
      '</div>';
  }).join('');

  var overCount = statuses.filter(function(s){return s.remaining < 0;}).length;
  var doneCount = statuses.filter(function(s){return s.remaining === 0;}).length;
  var totalTarget = statuses.reduce(function(a,s){return a+s.target;},0);

  el.innerHTML =
    '<div class="quota-panel">' +
    '<div class="quota-panel-hd" onclick="_quotaPanelOpen=!_quotaPanelOpen;this.nextElementSibling.style.display=_quotaPanelOpen?\'block\':\'none\'">' +
    '\ud83d\udcca \u0e42\u0e04\u0e15\u0e49\u0e27\u0e34\u0e0a\u0e32/\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c' +
    '<span style="font-size:11px;font-weight:400;opacity:.85">' +
    (overCount>0 ? '\u26a0\ufe0f \u0e40\u0e01\u0e34\u0e19 '+overCount+' \u0e27\u0e34\u0e0a\u0e32  ' : '') +
    '\u2705 '+doneCount+'/'+statuses.length+' \u0e04\u0e23\u0e1a  ' +
    '\ud83d\udcd0 '+filled+'/'+totalTarget+' \u0e04\u0e32\u0e1a</span>' +
    '<span>'+(_quotaPanelOpen?'\u25b4':'\u25be')+'</span>' +
    '</div>' +
    '<div class="quota-panel-body" style="display:'+(_quotaPanelOpen?'block':'none')+'">' +
    rows +
    '</div></div>';
}

function subjectOptionLabel(s) {
  if(!s) return '';
  var code=(s.code||'').trim();
  return code ? code+' | '+s.name : s.name;
}

// Update subject dropdown options with quota indicators
function buildSubjOptsWithQuota(selected, roomId) {
  var statuses = {};
  getQuotaStatus(roomId).forEach(function(s){ statuses[s.name] = s; });
  var opts = '<option value="">\u2015 \u0e27\u0e34\u0e0a\u0e32 \u2015</option>';
  // Group: remaining > 0 first, then done, then over
  var free = [], done = [], over = [];
  subjectsForRoom(roomId).forEach(function(s) {
    var st = statuses[s.name];
    if(!st) return;
    if(st.remaining > 0) free.push({s:s, st:st});
    else if(st.remaining === 0) done.push({s:s, st:st});
    else over.push({s:s, st:st});
  });
  if(free.length) {
    opts += '<optgroup label="\u25b6 \u0e22\u0e31\u0e07\u0e40\u0e2b\u0e25\u0e37\u0e2d\u0e04\u0e32\u0e1a ('+free.length+')">';
    free.forEach(function(item) {
      opts += '<option value="'+item.s.name+'"'+(item.s.name===selected?' selected':'')+'>'+
        subjectOptionLabel(item.s)+' [\u0e40\u0e2b\u0e25\u0e37\u0e2d '+item.st.remaining+']</option>';
    });
    opts += '</optgroup>';
  }
  if(done.length) {
    opts += '<optgroup label="\u2705 \u0e04\u0e23\u0e1a\u0e42\u0e04\u0e49\u0e15\u0e32 ('+done.length+')">';
    done.forEach(function(item) {
      opts += '<option value="'+item.s.name+'"'+(item.s.name===selected?' selected':'')+' style="color:#2E7D32;font-weight:700">'+
        subjectOptionLabel(item.s)+' \u2705</option>';
    });
    opts += '</optgroup>';
  }
  if(over.length) {
    opts += '<optgroup label="\u26a0\ufe0f \u0e40\u0e01\u0e34\u0e19\u0e42\u0e04\u0e49\u0e15\u0e32 ('+over.length+')">';
    over.forEach(function(item) {
      opts += '<option value="'+item.s.name+'"'+(item.s.name===selected?' selected':'')+' style="color:#C62828;font-weight:700">'+
        subjectOptionLabel(item.s)+' [\u0e40\u0e01\u0e34\u0e19 '+Math.abs(item.st.remaining)+']</option>';
    });
    opts += '</optgroup>';
  }
  return opts;
}

// Full refresh including quota panel
function refreshBuilderUI() {
  refreshAllConflictUI();
  renderQuotaPanel(currentBuilderRoom);
  // Also update all subject dropdowns with quota indicators
  document.querySelectorAll('.cell-subj-sel').forEach(function(sel) {
    var d = sel.dataset;
    var cv = DB.sched[d.room+'_'+d.slot+'_'+d.day] || {};
    sel.innerHTML = buildSubjOptsWithQuota(cv.subject||'', d.room);
  });
}

// ══════════════════════════════════════════════════════════════
// AUTO-SCHEDULE SYSTEM
// ══════════════════════════════════════════════════════════════

function openAutoSchedule() {
  if(!currentBuilderRoom) { alert('\u0e01\u0e23\u0e38\u0e13\u0e32\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e2b\u0e49\u0e2d\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e01\u0e48\u0e2d\u0e19'); return; }
  if(!DB.subjects.length) { alert('\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e27\u0e34\u0e0a\u0e32'); return; }

  var totalSlots = TeacherSchedule.studentSlots(DB).length * DB.days.length;
  var totalHours = DB.subjects.reduce(function(a,s){return a+(s.hours||1);},0);

  var rows = DB.subjects.map(function(s) {
    return '<div class="auto-subj-row">' +
      '<div class="dot" style="background:'+s.color+'"></div>' +
      '<label>'+subjectOptionLabel(s)+'</label>' +
      '<input type="number" id="aq_'+s.id+'" value="'+(s.hours||1)+'" min="0" max="'+TeacherSchedule.studentSlots(DB).length*DB.days.length+'">' +
      '</div>';
  }).join('');

  document.getElementById('autoSchedSubjects').innerHTML = '<div class="auto-sched-grid">'+rows+'</div>';
  document.getElementById('autoSchedInfo').innerHTML =
    '\ud83d\udcca \u0e0a\u0e48\u0e2d\u0e07\u0e15\u0e32\u0e23\u0e32\u0e07: <b>'+totalSlots+'</b> \u0e0a\u0e48\u0e2d\u0e07  ' +
    '\u0e2a\u0e38\u0e21\u0e42\u0e04\u0e49\u0e15\u0e32\u0e27\u0e34\u0e0a\u0e32: <b>'+totalHours+'</b> \u0e04\u0e32\u0e1a/\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c' +
    (totalHours > totalSlots ? ' <span style="color:#C62828">\u26a0\ufe0f \u0e40\u0e01\u0e34\u0e19\u0e08\u0e33\u0e19\u0e27\u0e19\u0e0a\u0e48\u0e2d\u0e07!</span>' : '');
  document.getElementById('autoSchedMode').value = 'spread';
  openModal('modalAutoSched');
}

function runAutoSchedule() {
  if(!currentBuilderRoom) return;

  // Gather quotas from inputs
  var quotas = [];
  subjectsForRoom(currentBuilderRoom).forEach(function(s) {
    var inp = document.getElementById('aq_'+s.id);
    var n = inp ? Math.max(0, parseInt(inp.value)||0) : (s.hours||1);
    for(var i=0; i<n; i++) quotas.push(s.name);
  });

  var mode = document.getElementById('autoSchedMode').value;
  var clearFirst = document.getElementById('autoSchedClear').checked;
  var slots = TeacherSchedule.studentSlots(DB);
  var days  = DB.days;
  var roomId = currentBuilderRoom;

  // Clear existing if checked
  if(clearFirst) {
    Object.keys(DB.sched).forEach(function(k) {
      if(k.split('_')[0]===roomId) delete DB.sched[k];
    });
  }

  // Build list of empty slots
  var emptyCells = [];
  slots.forEach(function(sl) {
    days.forEach(function(day) {
      var k = roomId+'_'+sl.id+'_'+day;
      var cv = DB.sched[k];
      if(!cv || !cv.subject) emptyCells.push({k:k, sl:sl, day:day});
    });
  });

  if(quotas.length > emptyCells.length) {
    if(!confirm('\u0e42\u0e04\u0e49\u0e15\u0e32\u0e27\u0e34\u0e0a\u0e32 ('+quotas.length+') \u0e40\u0e01\u0e34\u0e19\u0e0a\u0e48\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e07 ('+emptyCells.length+') \u0e08\u0e30\u0e43\u0e2a\u0e48\u0e40\u0e17\u0e48\u0e32\u0e17\u0e35\u0e48\u0e21\u0e35\u0e2b\u0e23\u0e37\u0e2d\u0e44\u0e21\u0e48?')) return;
    quotas = quotas.slice(0, emptyCells.length);
  }

  // Shuffle subjects for random distribution
  function shuffle(arr) {
    for(var i=arr.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
    }
    return arr;
  }

  var subjList = shuffle(quotas.slice());

  if(mode === 'spread') {
    // Spread: distribute evenly across days first, then slots
    shuffle(emptyCells);
  } else if(mode === 'cluster') {
    // Cluster: fill by day order (same subject in consecutive slots)
    // Sort empty cells by day then slot
    emptyCells.sort(function(a,b){
      var di = days.indexOf(a.day)-days.indexOf(b.day);
      return di !== 0 ? di : a.sl.id-b.sl.id;
    });
  } else {
    // Random: fully shuffle both
    shuffle(emptyCells);
    shuffle(subjList);
  }

  // Fill cells
  subjList.forEach(function(subjName, i) {
    if(i >= emptyCells.length) return;
    var cell = emptyCells[i];
    if(!DB.sched[cell.k]) DB.sched[cell.k] = {subject:'',teacher:'',teacher2:''};
    DB.sched[cell.k].subject = subjName;
    DB.sched[cell.k].teacher = '';
    DB.sched[cell.k].teacher2 = '';
    // Auto-color the td
    var subj = DB.subjects.find(function(s){return s.name===subjName;});
    if(subj) {
      // Update subject hours in DB if different from modal
      var inp = document.getElementById('aq_'+subj.id);
      if(inp) { /* hours already set */ }
    }
  });

  closeModal('modalAutoSched');
  markDirty();
  renderBuilder();
  toast('\u2728 \u0e08\u0e31\u0e14\u0e15\u0e32\u0e23\u0e32\u0e07\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34 '+subjList.length+' \u0e27\u0e34\u0e0a\u0e32 \u0e40\u0e2a\u0e23\u0e47\u0e08\u0e41\u0e25\u0e49\u0e27 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e43\u0e2a\u0e48\u0e0a\u0e37\u0e48\u0e2d\u0e04\u0e23\u0e39', 'succ');
}


// ══════════════════════════════════════════════════════════════
// AUTO-SCHEDULE PAGE — Full Professional Implementation
// ══════════════════════════════════════════════════════════════

// Global shuffle (Fisher-Yates) — used by runAutoSchedulePage and other functions
function shuffleArray(arr) {
  for(var i=arr.length-1; i>0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

var _autoSelectedRooms = new Set();
var _autoMode = 'random';
var _autoGenerated = {}; // temporary schedule before applying

function renderAutoSchedulePage() {
  _autoSelectedRooms = new Set(DB.rooms.map(function(r){return r.id;}));
  renderAutoSubjectTable();
  renderAutoRoomPills();
  document.getElementById('autoResultArea').innerHTML = '';
}

function getAutoVisibleSubjects(){
  var grades=new Set(DB.rooms.filter(function(r){return _autoSelectedRooms.has(r.id);}).map(function(r){return r.grade;}));
  return DB.subjects.filter(function(s){var g=subjectGrade(s); return g==='ALL' || grades.has(g);});
}
function renderAutoSubjectTable() {
  var tbody = document.getElementById('autoSubjBody');
  if(!tbody) return;
  var visibleSubjects=getAutoVisibleSubjects();
  if(!visibleSubjects.length) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:20px">ยังไม่มีวิชาสำหรับระดับชั้นของห้องที่เลือก</td></tr>';
    updateAutoTotal();
    return;
  }
  tbody.innerHTML = visibleSubjects.map(function(s) {
    return '<tr>' +
      '<td><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:'+s.color+'"></span></td>' +
      '<td style="font-weight:700">'+s.name+'<div style="font-size:10px;color:var(--muted)">'+(subjectGrade(s)||'ยังไม่กำหนด')+' · '+(s.dept||'')+'</div></td>' +
      '<td style="text-align:center"><input type="number" id="apq_'+s.id+'" value="'+(s.hours||1)+
      '" min="0" max="30" onchange="updateAutoTotal()" oninput="updateAutoTotal()"></td>' +
      '</tr>';
  }).join('');
  updateAutoTotal();
}

function updateAutoTotal() {
  var total = 0;
  getAutoVisibleSubjects().forEach(function(s) {
    var inp = document.getElementById('apq_'+s.id);
    total += inp ? Math.max(0, parseInt(inp.value)||0) : 0;
  });
  var el = document.getElementById('autoTotalHours');
  if(el) el.textContent = total;
  var slotCount = DB.slots.filter(function(sl){return !sl.isBreak;}).length * DB.days.length;
  var infoEl = document.getElementById('autoSlotInfo');
  if(infoEl) {
    if(!slotCount) {
      infoEl.innerHTML = '<span style="color:var(--muted)">ยังไม่มีคาบ</span>';
    } else if(total > slotCount) {
      infoEl.innerHTML = '<span style="color:#C62828;font-weight:700">⚠️ เกินช่อง! ('+slotCount+' ช่อง)</span>';
    } else if(total === slotCount) {
      infoEl.innerHTML = '<span style="color:#2E7D32;font-weight:700">✅ เต็มพอดี ('+slotCount+' ช่อง)</span>';
    } else {
      infoEl.innerHTML = '<span style="color:var(--muted)">ช่องว่างเหลือ '+(slotCount-total)+' ช่อง / '+slotCount+' ทั้งหมด</span>';
    }
  }
}

function renderAutoRoomPills() {
  var el = document.getElementById('autoRoomPills');
  if(!el) return;
  if(!DB.rooms.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:12px">ยังไม่มีห้องเรียน</div>';
    return;
  }
  el.innerHTML = DB.rooms.map(function(r) {
    var on = _autoSelectedRooms.has(r.id);
    return '<div class="auto-room-pill'+(on?' on':'')+'" onclick="toggleAutoRoom(\''+r.id+'\')">'+r.label+'</div>';
  }).join('');
}

function toggleAutoRoom(roomId) {
  if(_autoSelectedRooms.has(roomId)) _autoSelectedRooms.delete(roomId);
  else _autoSelectedRooms.add(roomId);
  renderAutoRoomPills();
  renderAutoSubjectTable();
}

function autoSelectAllRooms(val) {
  if(val) DB.rooms.forEach(function(r){ _autoSelectedRooms.add(r.id); });
  else _autoSelectedRooms.clear();
  renderAutoRoomPills();
  renderAutoSubjectTable();
}

function selectAutoMode(mode, el) {
  _autoMode = mode;
  document.querySelectorAll('.auto-mode-card').forEach(function(c){ c.classList.remove('selected'); });
  el.classList.add('selected');
  document.getElementById('autoPageMode').value = mode;
}

function runAutoSchedulePage() {
  // ── 1. VALIDATE INPUTS ──────────────────────────────────
  if(!DB.subjects.length) { toast('ยังไม่มีวิชา กรุณาเพิ่มวิชาก่อน','warn'); return; }
  if(!TeacherSchedule.studentSlots(DB).length || !DB.days.length) { toast('ยังไม่มีคาบ/วัน กรุณาตั้งค่าก่อน','warn'); return; }
  if(_autoSelectedRooms.size === 0) { toast('กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง','warn'); return; }

  // ── 2. READ UI CONFIG ──────────────────────────────────
  var quotaById = {};
  var totalQ = 0;
  getAutoVisibleSubjects().forEach(function(s) {
    var inp = document.getElementById('apq_'+s.id);
    var n = inp ? Math.max(0, parseInt(inp.value)||0) : (s.hours||1);
    quotaById[s.id] = n;
    totalQ += n;
  });
  if(!totalQ) { toast('โควต้าวิชาทั้งหมดเป็น 0 กรุณากำหนดคาบ/สัปดาห์','warn'); return; }

  var mode = _autoMode;
  var clearOld = document.getElementById('autoClearOld').checked;
  var keepTeacher = document.getElementById('autoKeepTeacher').checked;
  var rooms = DB.rooms.filter(function(r){ return _autoSelectedRooms.has(r.id); });

  // ── 3. GLOBAL TEACHER BUSY MAP (CSP state) ─────────────
  // Key: teacherName|slotId|day → true if teaching in that slot
  var teacherBusy = {};
  Object.keys(DB.sched).forEach(function(k){
    var cv = DB.sched[k];
    if(!cv || !cv.subject) return;
    var parts = k.split('_');
    if(parts.length < 3) return;
    var slId = parts[1], day = parts[2];
    [cv.teacher, cv.teacher2, cv.teacher3].forEach(function(tn){
      if(tn) teacherBusy[tn+'|'+slId+'|'+day] = true;
    });
  });

  function setBusy(t, s, d, on) {
    if(!t) return;
    if(on) teacherBusy[t+'|'+s+'|'+d] = true;
    else delete teacherBusy[t+'|'+s+'|'+d];
  }
  function isBusy(t, s, d) { return !!(t && (teacherBusy[t+'|'+s+'|'+d]||TeacherSchedule.activities(DB,t,s,d).length)); }

  // ── 4. ELIGIBILITY: which teachers can teach subject X? ──
  var eligibilityCache = {};
  function eligibleFor(subjName) {
    if(eligibilityCache[subjName]) return eligibilityCache[subjName];
    var list = DB.teachers.filter(function(t){
      return (t.subjects||[]).includes(subjName);
    }).map(function(t){ return t.prefix+t.first+' '+t.last; });
    eligibilityCache[subjName] = list;
    return list;
  }

  // Check subject has at least 1 teacher in system — if not, warn
  var orphanSubjects = [];
  getAutoVisibleSubjects().forEach(function(s){
    if((quotaById[s.id]||0)>0 && eligibleFor(s.name).length===0) orphanSubjects.push(s.name+' ('+(subjectGrade(s)||'-')+')');
  });

  // ── 5. CSP: pick teacher for (subject, slot, day) ──────
  // Uses LCV-style heuristic: prefer teacher with MORE open slots (less constrained)
  function pickTeacher(subjName, slId, day, usedTeachersInRow) {
    var list = eligibleFor(subjName);
    var free = list.filter(function(t){
      return !isBusy(t, slId, day);
    });
    if(free.length === 0) return '';
    // Prefer teacher not already used many times today in same room
    free.sort(function(a,b){
      var ua = (usedTeachersInRow[a]||0), ub = (usedTeachersInRow[b]||0);
      return ua - ub;
    });
    return free[0];
  }

  // ── 6. PROCESS EACH ROOM ───────────────────────────────
  var generatedAll = {};
  var warnings = [];
  var lockedSkipped = 0;
  var unassignedCells = 0;
  var conflictsAvoided = 0;

  rooms.forEach(function(room) {
    // (a) CLEAR OLD — never touch locked, optionally keep cells with subject
    if(clearOld) {
      Object.keys(DB.sched).forEach(function(k){
        if(k.split('_')[0] !== room.id) return;
        var cv = DB.sched[k];
        if(cv && cv.locked) { lockedSkipped++; return; }
        // If keepTeacher is on, preserve cells that already have subject+teacher
        if(keepTeacher && cv && cv.subject && cv.teacher) return;
        // Release teacher busy slots before deleting
        if(cv) {
          var parts = k.split('_');
          [cv.teacher, cv.teacher2, cv.teacher3].forEach(function(tn){
            setBusy(tn, parts[1], parts[2], false);
          });
        }
        delete DB.sched[k];
      });
    }

    // (b) BUILD VARIABLE LIST (unassigned cells in this room)
    var variables = [];                 // cells to fill
    TeacherSchedule.studentSlots(DB).forEach(function(sl){
      if(sl.isBreak) return;
      DB.days.forEach(function(day){
        var k = room.id+'_'+sl.id+'_'+day;
        var cv = DB.sched[k];
        if(cv && cv.locked) return;                           // skip locked
        if(cv && cv.subject && keepTeacher) return;           // keep existing
        variables.push({k:k, slId:String(sl.id), day:day, sl:sl});
      });
    });

    // (c) BUILD DOMAIN (subject pool based on quotas)
    var subjPool = [];
    subjectsForRoom(room.id).forEach(function(subj){
      var q=quotaById[subj.id]||0;
      for(var i=0; i<q; i++) subjPool.push(subj.name);
    });

    // Warn if over/under capacity
    if(subjPool.length > variables.length) {
      warnings.push(room.label+': โควต้ารวม '+subjPool.length+' คาบ > คาบว่าง '+variables.length+' คาบ — ตัดบางวิชาออก');
      subjPool = subjPool.slice(0, variables.length);
    }

    generatedAll[room.id] = {};

    // (d) SORT VARIABLES based on mode
    if(mode === 'spread') {
      // Interleave by day: 1st slot Mon, 1st slot Tue, ... 1st slot Sun, 2nd slot Mon, ...
      variables.sort(function(a,b){
        if(a.slId !== b.slId) return parseInt(a.slId)-parseInt(b.slId);
        return DB.days.indexOf(a.day) - DB.days.indexOf(b.day);
      });
    } else if(mode === 'cluster') {
      // Day by day, slot by slot
      variables.sort(function(a,b){
        if(a.day !== b.day) return DB.days.indexOf(a.day) - DB.days.indexOf(b.day);
        return parseInt(a.slId)-parseInt(b.slId);
      });
    } else {
      // random
      shuffleArray(variables);
    }

    // (e) SORT SUBJECT POOL:
    //   - Subjects with fewer eligible teachers go FIRST (MRV-like)
    //   - Within same, random order for variety
    shuffleArray(subjPool);
    subjPool.sort(function(a,b){
      var ea = eligibleFor(a).length, eb = eligibleFor(b).length;
      if(ea !== eb) return ea - eb; // fewer options first
      return 0; // keep random order
    });

    // (f) ASSIGNMENT LOOP with forward-checking
    var usedInRoom = {};
    var assignedIdx = {};  // subject → count of times placed in this room
    var placedByDay = {};  // day → count of same subject on that day (for spread)
    DB.days.forEach(function(d){ placedByDay[d] = {}; });

    variables.forEach(function(cell){
      if(subjPool.length === 0) return; // nothing left to assign

      // Find best subject for this cell
      // Strategy: try subjects in order, prefer those not yet on this day (for spread)
      var tried = new Set();
      var bestIdx = -1;

      for(var attempt = 0; attempt < subjPool.length; attempt++) {
        var idx = attempt;
        if(tried.has(idx)) continue;
        tried.add(idx);
        var sname = subjPool[idx];

        // Skip if already placed too many times on this day (spread mode)
        if(mode === 'spread') {
          var todayCount = placedByDay[cell.day][sname] || 0;
          var totalForSubj = 0;
          for(var di=0; di<DB.days.length; di++) {
            totalForSubj += (placedByDay[DB.days[di]][sname] || 0);
          }
          // Skip if this day already has 2+ of this subject and some days have 0
          if(todayCount >= 2) {
            var hasZeroDay = DB.days.some(function(d){ return (placedByDay[d][sname]||0) === 0; });
            if(hasZeroDay && attempt < subjPool.length - 1) continue;
          }
        }

        bestIdx = idx;
        break;
      }

      if(bestIdx < 0) bestIdx = 0; // fallback first
      var sname = subjPool[bestIdx];
      subjPool.splice(bestIdx, 1);

      // Pick teacher with conflict avoidance
      var existingCv = DB.sched[cell.k];
      var tname = '';
      if(keepTeacher && existingCv && existingCv.teacher) {
        tname = existingCv.teacher;
      } else {
        tname = pickTeacher(sname, cell.slId, cell.day, usedInRoom);
        if(!tname) {
          conflictsAvoided++;
          // All eligible teachers are busy — leave teacher blank for user to fix
        }
      }

      // ASSIGN
      DB.sched[cell.k] = {
        subject: sname,
        teacher: tname,
        teacher2: keepTeacher && existingCv ? (existingCv.teacher2||'') : '',
        teacher3: keepTeacher && existingCv ? (existingCv.teacher3||'') : '',
        learnRoom: keepTeacher && existingCv ? (existingCv.learnRoom||'') : '',
        locked: false
      };

      // Update state
      if(tname) {
        setBusy(tname, cell.slId, cell.day, true);
        usedInRoom[tname] = (usedInRoom[tname]||0) + 1;
      } else {
        unassignedCells++;
      }
      placedByDay[cell.day][sname] = (placedByDay[cell.day][sname]||0) + 1;
      generatedAll[room.id][cell.k] = DB.sched[cell.k];
    });
  });

  // ── 7. POST-PROCESSING & REPORTING ─────────────────────
  markDirty();
  renderAutoResult(rooms, generatedAll, totalQ);

  // Success toast
  var msg = '✨ จัดตาราง '+rooms.length+' ห้อง เสร็จแล้ว!';
  if(lockedSkipped > 0) msg += '  (ข้ามคาบที่ล็อก '+lockedSkipped+')';
  if(conflictsAvoided > 0) msg += '  (หลีกเลี่ยงชน '+conflictsAvoided+' คาบ)';
  toast(msg, 'succ');

  // Delayed warnings
  if(orphanSubjects.length > 0) {
    setTimeout(function(){
      toast('⚠️ วิชาที่ไม่มีครูสอน: '+orphanSubjects.slice(0,3).join(', ')+(orphanSubjects.length>3?' +'+(orphanSubjects.length-3):''), 'warn');
    }, 600);
  }
  if(unassignedCells > 0) {
    setTimeout(function(){
      toast('ℹ️ มี '+unassignedCells+' คาบที่ครูว่างไม่พอ — กรุณาใส่ครูเองในหน้า Builder', 'info');
    }, 1200);
  }
  if(warnings.length > 0) {
    setTimeout(function(){
      toast('⚠️ '+warnings[0], 'warn');
    }, 1800);
  }
}

function renderAutoResult(rooms, generated, totalQuota) {
  var area = document.getElementById('autoResultArea');
  if(!area) return;

  var filled = Object.values(DB.sched).filter(function(v){return v&&v.subject;}).length;

  var html = '<div class="auto-stat-row">' +
    '<div class="auto-stat-box"><div class="auto-stat-num">'+rooms.length+'</div><div class="auto-stat-lbl">ห้องที่จัด</div></div>' +
    '<div class="auto-stat-box"><div class="auto-stat-num">'+totalQuota+'</div><div class="auto-stat-lbl">คาบที่วางแผน</div></div>' +
    '<div class="auto-stat-box"><div class="auto-stat-num">'+filled+'</div><div class="auto-stat-lbl">ช่องที่มีวิชา</div></div>' +
    '<div class="auto-stat-box" style="border-color:#2E7D32"><div class="auto-stat-num" style="color:#2E7D32">'+rooms.length+'</div><div class="auto-stat-lbl">ห้องสำเร็จ</div></div>' +
    '</div>';

  html += '<div class="alert a-succ" style="margin-bottom:12px">' +
    '✅ <b>จัดตารางสำเร็จแล้ว!</b> กรุณาเลือกครูผู้สอนในแต่ละช่องด้านล่าง จากนั้นกดปุ่ม “บันทึกครูทั้งหมด”' +
    '</div>';

  rooms.forEach(function(room) {
    html += '<div class="card" style="margin-bottom:16px">';
    html += '<div class="card-hd">' +
      '<div class="card-title">🚪 '+room.label+'</div>' +
      '<button class="btn btn-sm btn-ghost" onclick="autoApplyTeachersRoom(\''+room.id+'\')">💾 บันทึกห้องนี้</button>' +
      '</div>';

    var slotHds = TeacherSchedule.studentSlots(DB).map(function(sl){
      if(sl.isBreak){
        return '<th style="background:#E65100;min-width:66px;width:66px">' +
          '<div style="font-weight:800">'+sl.label+'</div>' +
          '<div style="font-size:10px;opacity:.85;margin-top:2px">'+sl.start+'–'+sl.end+'</div>' +
          '</th>';
      }
      return '<th style="min-width:150px">' +
        '<div style="font-weight:800">'+sl.label+'</div>' +
        '<div style="font-size:10px;opacity:.8;margin-top:2px">'+sl.start+'–'+sl.end+'</div>' +
        '</th>';
    }).join('');

    var rows = DB.days.map(function(day, dayIndex){
      var cells = TeacherSchedule.studentSlots(DB).map(function(sl){
        if(sl.isBreak){
          if(dayIndex>0) return '';
          return '<td class="builder-break-cell" rowspan="'+DB.days.length+'" style="min-width:66px;width:66px;background:#FFF8E1;vertical-align:middle;text-align:center">' +
            '<div style="font-weight:800;color:#E65100;writing-mode:vertical-rl;transform:rotate(180deg);margin:auto;letter-spacing:1px">พักเที่ยง</div>' +
            '</td>';
        }

        var k = room.id+'_'+sl.id+'_'+day;
        var cv = DB.sched[k];
        if(!(cv && cv.subject)) {
          return '<td><div class="arc-empty">—</div></td>';
        }

        var subj = findSubjectForRoom(cv.subject, room.id) || DB.subjects.find(function(s){return s.name===cv.subject;});
        var bg = subj ? subj.color+'80' : '#EEF3FF';
        var subjLabel = subj ? subjectOptionLabel(subj) : cv.subject;

        function buildTchrOpts(fieldVal, label) {
          var opts = '<option value="">― '+label+' ―</option>';
          var busyMap = getBusyTeachersAt(sl.id, day, room.id);
          var eligible = cv.subject
            ? DB.teachers.filter(function(t){return (t.subjects||[]).includes(cv.subject);})
            : DB.teachers;
          var list = eligible.length ? eligible : DB.teachers;
          var free = [], busy = [];
          list.forEach(function(t){
            var n = t.prefix+t.first+' '+t.last;
            if(busyMap[n]) busy.push(n); else free.push(n);
          });
          if(free.length) {
            opts += '<optgroup label="✅ ว่าง ('+free.length+')">';
            free.forEach(function(n){ opts += '<option value="'+n+'"'+(n===fieldVal?' selected':'')+'>'+n+'</option>'; });
            opts += '</optgroup>';
          }
          if(busy.length) {
            opts += '<optgroup label="⚠️ ยุ่งอยู่ ('+busy.length+')">';
            busy.forEach(function(n){ opts += '<option value="'+n+'"'+(n===fieldVal?' selected':'')+' class="busy">⚠️ '+n+'</option>'; });
            opts += '</optgroup>';
          }
          return opts;
        }

        var busyMap2 = getBusyTeachersAt(sl.id, day, room.id);
        var isBusy  = cv.teacher  && busyMap2[cv.teacher];
        var isBusy2 = cv.teacher2 && busyMap2[cv.teacher2];
        var isBusy3 = cv.teacher3 && busyMap2[cv.teacher3];

        return '<td style="padding:3px;background:'+bg+';vertical-align:top">' +
          '<div class="auto-result-cell" style="background:transparent;padding:5px 4px">' +
          '<div class="arc-subj" style="margin-bottom:3px">'+subjLabel+'</div>' +
          '<span class="arc-tchr-label">ครูที่ 1</span>' +
          '<select class="arc-tchr-sel'+(isBusy?' conflict-sel':'')+'" data-k="'+k+'" data-field="teacher" onchange="autoUpdateTeacher(this)">' +
          buildTchrOpts(cv.teacher, 'เลือกครู') +
          '</select>' +
          '<span class="arc-tchr-label">ครูที่ 2</span>' +
          '<select class="arc-tchr-sel arc-tchr2-sel'+(isBusy2?' conflict-sel':'')+'" data-k="'+k+'" data-field="teacher2" onchange="autoUpdateTeacher(this)">' +
          buildTchrOpts(cv.teacher2, 'ครู 2 (ถ้ามี)') +
          '</select>' +
          '<span class="arc-tchr-label">ครูที่ 3</span>' +
          '<select class="arc-tchr-sel arc-tchr3-sel'+(isBusy3?' conflict-sel':'')+'" data-k="'+k+'" data-field="teacher3" onchange="autoUpdateTeacher(this)">' +
          buildTchrOpts(cv.teacher3, 'ครู 3 (ถ้ามี)') +
          '</select></div></td>';
      }).join('');

      return '<tr><td class="td-period" style="font-weight:800;font-size:12px;color:var(--pri);min-width:74px;width:74px">'+day+'</td>'+cells+'</tr>';
    }).join('');

    html += '<div class="sched-wrap" style="margin-top:10px"><table class="sched-tbl" style="min-width:'+Math.max(760,74+(TeacherSchedule.studentSlots(DB).filter(function(s){return !s.isBreak;}).length*150)+(TeacherSchedule.studentSlots(DB).some(function(s){return s.isBreak;})?66:0))+'px">' +
      '<thead><tr><th class="th-time" style="min-width:74px;width:74px">วัน/คาบ</th>'+slotHds+'</tr></thead>' +
      '<tbody>'+rows+'</tbody></table></div>';
    html += '</div>';
  });

  html += '<div class="auto-apply-bar">' +
    '<button class="btn btn-pri" onclick="autoApplyAllTeachers()">💾 บันทึกครูทั้งหมด</button>' +
    '<button class="btn btn-pri" style="background:#2E7D32" onclick="exportAutoResultDocx()">📄 ส่งออก Word</button>' +
    '<button class="btn btn-ghost" onclick="printAutoResult()">🖨️ พิมพ์</button>' +
    '</div>';

  area.innerHTML = html;
}

function autoUpdateTeacher(sel) {
  var k = sel.dataset.k;
  var field = sel.dataset.field || 'teacher';
  if(!k) return;
  if(!DB.sched[k]) DB.sched[k] = {subject:'',teacher:'',teacher2:'',teacher3:''};
  DB.sched[k][field] = sel.value;
  // Check conflict
  var parts = k.split('_');
  var isBusy = sel.value && isTeacherBusy(sel.value, parts[1], parts[2], parts[0]);
  sel.classList.toggle('conflict-sel', !!isBusy);
  if(isBusy) showConflictWarning(sel.value, parts[1], parts[2], parts[0]);
  markDirty();
  updateConflictBadge();
}


function exportAutoResultDocx() {
  var rooms = DB.rooms.filter(function(r){ return _autoSelectedRooms.has(r.id); });
  if(!rooms.length) { toast('ยังไม่มีห้องที่จัด','warn'); return; }
  var delay = 0;
  rooms.forEach(function(room, i) {
    setTimeout(function() {
      buildDocx('student', room);
    }, delay);
    delay += 400;
  });
  toast('กำลังส่งออก Word '+rooms.length+' ห้อง...','succ');
}

function printAutoResult() {
  window.print();
}

function autoApplyTeachersRoom(roomId) {
  var room = DB.rooms.find(function(r){return r.id===roomId;});
  var label = room ? room.label : roomId;
  markDirty();
  updateConflictBadge();
  toast('\ud83d\udcbe \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e2b\u0e49\u0e2d\u0e07 '+label+' \u0e41\u0e25\u0e49\u0e27', 'succ');
}

function autoApplyAllTeachers() {
  markDirty();
  updateConflictBadge();
  renderQuotaPanel(currentBuilderRoom);
  // Show success + scroll to action bar
  toast('\ud83d\udcbe \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e04\u0e23\u0e39\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e41\u0e25\u0e49\u0e27 — \u0e15\u0e32\u0e23\u0e32\u0e07\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e43\u0e0a\u0e49\u0e07\u0e32\u0e19', 'succ');
  var bar = document.querySelector('.auto-apply-bar');
  if(bar) bar.scrollIntoView({behavior:'smooth', block:'center'});
}


function refreshAllConflictUI() {
  // 1. Update sidebar badge
  updateConflictBadge();
  // 2. Update every cell in the current builder grid
  document.querySelectorAll('.cell-tchr-sel').forEach(function(sel) {
    var td = sel.closest('td');
    if(!td) return;
    var d = sel.dataset;
    if(!d.room || !d.slot || !d.day) return;
    // Remove old badge
    var old = td.querySelector('.cell-warn-badge,.cell-ok-badge');
    if(old) old.remove();
    // Remove conflict style
    sel.classList.remove('has-conflict');
    if(!sel.value) return;
    var busy = isTeacherBusy(sel.value, d.slot, d.day, d.room);
    if(busy) {
      sel.classList.add('has-conflict');
      var badge = document.createElement('span');
      badge.className = 'cell-warn-badge';
      badge.textContent = '\u26a0\ufe0f \u0e0a\u0e19\u0e01\u0e31\u0e19: ' + busy.map(function(x){return x.roomLabel;}).join(', ');
      td.appendChild(badge);
    }
  });
  // 3. Update conflict count on dashboard widget (if visible)
  var cfEl = document.getElementById('dashConflict');
  if(cfEl && document.getElementById('page-dashboard') &&
     document.getElementById('page-dashboard').classList.contains('active')) {
    renderDashboard();
  }
  // 4. Live-refresh teacher view if open
  var tvPage = document.getElementById('page-teacher-view');
  if(tvPage && tvPage.classList.contains('active')) {
    renderTeacherList(); // refresh period counts
    if(_tvCurrentTeacherId) renderTeacherViewById(_tvCurrentTeacherId);
  }
}

function isTeacherBusy(teacherName, slotId, day, ignoreRoomId) {
  if(!teacherName) return null;
  var conflicts = [];
  Object.keys(DB.sched).forEach(function(k) {
    var parts = k.split('_');
    var rId = parts[0], sId = parts[1], d = parts[2];
    if(rId === ignoreRoomId && sId === String(slotId) && d === day) return;
    if(sId === String(slotId) && d === day) {
      var cv = DB.sched[k];
      if(cv && cv.teacher === teacherName && cv.subject) {
        var room = DB.rooms.find(function(r){return r.id===rId;});
        conflicts.push({
          roomLabel: room ? room.label : rId,
          subject: cv.subject
        });
      }
    }
  });
  TeacherSchedule.activities(DB,teacherName,slotId,day).forEach(a=>conflicts.push({roomLabel:'เลือกวิชา',subject:a.subject}));
  return conflicts.length > 0 ? conflicts : null;
}

// Get all busy teachers at a slot/day
function getBusyTeachersAt(slotId, day, ignoreRoomId) {
  var busy = {};
  Object.keys(DB.sched).forEach(function(k) {
    var parts = k.split('_');
    var rId = parts[0], sId = parts[1], d = parts[2];
    if(rId === ignoreRoomId) return;
    if(sId !== String(slotId) || d !== day) return;
    var cv = DB.sched[k];
    if(cv && cv.teacher && cv.subject) {
      if(!busy[cv.teacher]) busy[cv.teacher] = [];
      var room = DB.rooms.find(function(r){return r.id===rId;});
      busy[cv.teacher].push({
        roomLabel: room ? room.label : rId,
        subject: cv.subject
      });
    }
  });
  TeacherSchedule.activities(DB,null,slotId,day).forEach(a=>{(busy[a.teacher]||=[]).push({roomLabel:'เลือกวิชา',subject:a.subject});});
  return busy;
}

// Build teacher options with busy status markers
function buildTeacherOptsConflict(subjName, selected, slotId, day, roomId) {
  var eligible = subjName
    ? DB.teachers.filter(function(t){return (t.subjects||[]).includes(subjName);})
    : DB.teachers;
  var allTeachers = eligible.length ? eligible : DB.teachers;
  var busyMap = getBusyTeachersAt(slotId, day, roomId);
  var opts = '<option value="">-- เลือกครู --</option>';
  // Show non-busy first, busy last
  var free = [], busy = [];
  allTeachers.forEach(function(t) {
    var n = t.prefix + t.first + ' ' + t.last;
    if(busyMap[n]) busy.push({n:n, info:busyMap[n]});
    else free.push({n:n});
  });
  if(free.length) {
    opts += '<optgroup label="✅ ว่างในคาบนี้ (' + free.length + ' คน)">';
    free.forEach(function(item) {
      opts += '<option value="' + item.n + '"' + (item.n===selected?' selected':'') + '>' + item.n + '</option>';
    });
    opts += '</optgroup>';
  }
  if(busy.length) {
    opts += '<optgroup label="⚠️ สอนคาบนี้อยู่แล้ว (' + busy.length + ' คน)">';
    busy.forEach(function(item) {
      var detail = item.info.map(function(i){return i.roomLabel+':'+i.subject;}).join(', ');
      opts += '<option value="' + item.n + '"' + (item.n===selected?' selected':'') + ' class="busy">';
      opts += '⚠️ ' + item.n + ' [สอน ' + detail + ']</option>';
    });
    opts += '</optgroup>';
  }
  // Add selected if not in list
  if(selected && !allTeachers.find(function(t){return t.prefix+t.first+' '+t.last===selected;})) {
    opts += '<option value="' + selected + '" selected>' + selected + '</option>';
  }
  return opts;
}

// Show real-time conflict warning toast
var _conflictToastTimer = null;
function showConflictWarning(teacherName, slotId, day, roomId) {
  var conflicts = isTeacherBusy(teacherName, slotId, day, roomId);
  var el = document.getElementById('conflictToast');
  if(!conflicts) {
    if(el) el.remove();
    return;
  }
  var slot = DB.slots.find(function(s){return s.id===parseInt(slotId);});
  var slotLabel = slot ? slot.label + ' (' + slot.start + '–' + slot.end + ')' : 'คาบ '+slotId;
  var detail = conflicts.map(function(c){return c.roomLabel + ': ' + c.subject;}).join(', ');
  var msg = '⚠️ ' + teacherName + ' สอน ' + slotLabel + ' วัน' + day + ' อยู่แล้ว (' + detail + ')';
  if(!el) {
    el = document.createElement('div');
    el.id = 'conflictToast';
    el.className = 'conflict-toast';
    document.body.appendChild(el);
  }
    el.innerHTML = '';
  var _sp=document.createElement('span'); _sp.textContent=msg; el.appendChild(_sp);
  var _b=document.createElement('span'); _b.className='ct-close'; _b.textContent='✕';
  _b.onclick=function(){var _t=document.getElementById('conflictToast');if(_t)_t.remove();};
  el.appendChild(_b);
  clearTimeout(_conflictToastTimer);
  _conflictToastTimer = setTimeout(function(){
    var t = document.getElementById('conflictToast');
    if(t) t.remove();
  }, 6000);
}

// Update cell warning badge
function updateCellBadge(td, slotId, day, roomId, teacherName) {
  var old = td.querySelector('.cell-warn-badge,.cell-ok-badge');
  if(old) old.remove();
  if(!teacherName) return;
  var conflicts = isTeacherBusy(teacherName, slotId, day, roomId);
  var badge = document.createElement('span');
  if(conflicts) {
    badge.className = 'cell-warn-badge';
    badge.textContent = '⚠️ ชนกัน: ' + conflicts.map(function(c){return c.roomLabel;}).join(', ');
  } else {
    badge.className = 'cell-ok-badge';
    badge.textContent = '✅ ว่าง';
    // Auto-hide ok badge after 2s
    setTimeout(function(){ if(badge.parentNode) badge.remove(); }, 2000);
  }
  td.appendChild(badge);
}

function buildTeacherOpts(subjName,selected){
  const eligible=subjName?DB.teachers.filter(t=>(t.subjects||[]).includes(subjName)):DB.teachers;
  let opts='<option value="">-- ครู --</option>';
  const list=eligible.length?eligible:DB.teachers;
  list.forEach(t=>{const n=t.prefix+t.first+' '+t.last;opts+=`<option value="${n}"${n===selected?' selected':''}>${n}</option>`;});
  if(selected&&!list.find(t=>t.prefix+t.first+' '+t.last===selected))
    opts+=`<option value="${selected}" selected>${selected}</option>`;
  return opts;
}
function switchBuilderRoom(id){ currentBuilderRoom=id; schoolRememberBuilderRoom(id); renderBuilder(); }
function clearCurrentRoom(){
  if(!currentBuilderRoom||!confirm('ล้างตารางห้องนี้ทั้งหมด?')) return;
  Object.keys(DB.sched).filter(k=>k.startsWith(currentBuilderRoom+'_')).forEach(k=>delete DB.sched[k]);
  renderBuilder(); markDirty();
}
function copyRoomSchedule(){
  if(DB.rooms.length<2){alert('ต้องมีห้องมากกว่า 1 ห้อง');return;}
  document.getElementById('copyFromRoom').innerHTML=DB.rooms.filter(r=>r.id!==currentBuilderRoom)
    .map(r=>`<option value="${r.id}">${r.label}</option>`).join('');
  openModal('modalCopyRoom');
}
function doCopyRoom(){
  const fromId=document.getElementById('copyFromRoom').value;
  Object.keys(DB.sched).filter(k=>k.startsWith(fromId+'_')).forEach(k=>{
    const newKey=k.replace(fromId,currentBuilderRoom);
    DB.sched[newKey]={...DB.sched[k]};
  });
  closeModal('modalCopyRoom'); renderBuilder(); markDirty();
  toast('📋 คัดลอกตารางแล้ว','succ');
}

// ════════════════════════════════════════════
//  TEACHER VIEW
// ════════════════════════════════════════════
// ── Current selected teacher ID for TV ──
var _tvCurrentTeacherId = '';

async function renderTeacherViewPage() {
  if(window.SCHOOL_OS_STORAGE==='firebase' && window.SCHOOL_ONLINE && (!SCHOOL_ONLINE.isReady() || SCHOOL_ONLINE.isLoading())) {
    var list=document.getElementById('tvTeacherList'),count=document.getElementById('tvTeacherCount'),retry=document.getElementById('tvTeacherRetry');if(retry)retry.hidden=true;
    if(count)count.textContent='กำลังโหลด…';
    if(list){list.setAttribute('aria-busy','true');list.disabled=true;list.innerHTML='<option value="">กำลังโหลดรายชื่อครู…</option>';}
    try{await SCHOOL_ONLINE.loadDatabaseOnce();}
    catch(e){if(count)count.textContent='โหลดไม่สำเร็จ';if(list)list.innerHTML='<option value="">โหลดรายชื่อไม่สำเร็จ ลองใหม่</option>';if(retry)retry.hidden=false;return;}
    finally{if(list){list.removeAttribute('aria-busy');list.disabled=false;}}
  }
  renderTeacherList();
  // If a teacher was previously selected, re-render their timetable (live update)
  if(_tvCurrentTeacherId) {
    renderTeacherViewById(_tvCurrentTeacherId);
  }
}

function renderTeacherList(){
  const select=document.getElementById('tvTeacherList'),count=document.getElementById('tvTeacherCount');
  if(!select)return;
  const available=DB.teachers.some(t=>t.id===_tvCurrentTeacherId);
  if(!available)_tvCurrentTeacherId='';
  select.replaceChildren(new Option(DB.teachers.length?'เลือกครู':'ยังไม่มีข้อมูลครู',''),...DB.teachers.map((teacher,index)=>new Option((index+1)+'. '+TeacherSchedule.name(teacher),teacher.id)));
  select.value=_tvCurrentTeacherId;select.disabled=!DB.teachers.length;
  if(count)count.textContent=DB.teachers.length+' คน';
  if(!_tvCurrentTeacherId){document.getElementById('teacherViewContent').innerHTML='';document.getElementById('tvExportBar').style.display='none';document.getElementById('tvNoTeacher').style.display='';}
}

function filterTeacherList(val) {
  renderTeacherViewPage();
}

function selectTeacherView(teacherId){
  _tvCurrentTeacherId=teacherId;
  const select=document.getElementById('tvTeacherList');if(select)select.value=teacherId;
  if(!teacherId){renderTeacherList();return;}
  renderTeacherViewById(teacherId);
}

function renderTeacherViewById(teacherId) {
  _tvCurrentTeacherId=teacherId;
  const teacherSelect=document.getElementById('tvTeacherList');if(teacherSelect)teacherSelect.value=teacherId;
  var t = DB.teachers.find(function(x){return x.id===teacherId;});
  var el = document.getElementById('teacherViewContent');
  var exportBar = document.getElementById('tvExportBar');
  var noTeacher = document.getElementById('tvNoTeacher');
  if(!t || !el) return;

  var name = t.prefix+t.first+' '+t.last;

  // Hide empty state, show export bar
  if(noTeacher) noTeacher.style.display='none';
  if(exportBar) exportBar.style.display='flex';

  // Update title and stats
  var titleEl = document.getElementById('tvTeacherTitle');
  if(titleEl) titleEl.innerHTML = '<span style="font-size:18px">👩‍🏫</span> '+name;

  // Count live stats
  var periods = 0;
  var subjects = new Set();
  var rooms = new Set();
  Object.entries(DB.sched).forEach(function(entry){
    var cv = entry[1];
    if(!cv||!cv.subject) return;
    if(cv.teacher===name||cv.teacher2===name||cv.teacher3===name){
      periods++;
      subjects.add(cv.subject);
      rooms.add(entry[0].split('_')[0]);
    }
  });
  TeacherSchedule.activities(DB,name).forEach(a=>{periods++;subjects.add(a.subject);});
  var conflicts = detectConflicts().filter(function(cf){return cf.teacherName===name;});
  var chipsEl = document.getElementById('tvStatsChips');
  if(chipsEl){
    chipsEl.innerHTML =
      '<span class="tv-chip">\u23f0 '+periods+' \u0e04\u0e32\u0e1a/\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c</span>'+
      '<span class="tv-chip">\ud83d\udcda '+subjects.size+' \u0e27\u0e34\u0e0a\u0e32</span>'+
      '<span class="tv-chip">\ud83d\udeaa '+rooms.size+' \u0e2b\u0e49\u0e2d\u0e07</span>'+
      (conflicts.length?'<span class="tv-chip warn">\u26a0\ufe0f \u0e0a\u0e19\u0e01\u0e31\u0e19 '+conflicts.length+' \u0e08\u0e38\u0e14</span>':
       '<span class="tv-chip ok">\u2705 \u0e44\u0e21\u0e48\u0e0a\u0e19\u0e01\u0e31\u0e19</span>');
  }

  // Render timetable
  el.innerHTML = buildTeacherViewTable(name);

  // Update print header
  var ph = document.getElementById('tvPrintHeader');
  if(ph){
    ph.querySelector('h2').textContent = '\u0e15\u0e32\u0e23\u0e32\u0e07\u0e2a\u0e2d\u0e19: '+name;
    ph.querySelector('p').textContent = DB.school.name+'  |  \u0e1b\u0e35\u0e01\u0e32\u0e23\u0e28\u0e36\u0e01\u0e29\u0e32 '+(DB.school.year||'')+' \u0e20\u0e32\u0e04\u0e40\u0e23\u0e35\u0e22\u0e19\u0e17\u0e35\u0e48 '+(DB.school.semester||'');
  }
}
// renderTeacherView kept for backward compat (called from old dropdown if any)
function renderTeacherView(){
  var id = _tvCurrentTeacherId;
  if(!id) return;
  renderTeacherViewById(id);
}
function renderTeacherViewAll(){
  if(!DB.teachers.length){alert('ยังไม่มีข้อมูลครู');return;}
  document.getElementById('teacherViewContent').innerHTML=DB.teachers.map(t=>{
    const name=t.prefix+t.first+' '+t.last;
    return`<div style="margin-bottom:20px"><div style="font-weight:700;color:var(--pri);font-size:14px;margin-bottom:8px">📖 ${name}</div>${buildTeacherViewTable(name)}</div>`;
  }).join('<hr style="margin:16px 0;border-color:var(--border)">');
}

// ══════════════════════════════════════════════════════
// TEACHER VIEW — EXPORT & PRINT
// ══════════════════════════════════════════════════════

// Build a single teacher's schedule data
function getTeacherScheduleData(teacherName) {
  var data = [];
  DB.slots.forEach(function(sl) {
    var row = { slot: sl, cells: {} };
    DB.days.forEach(function(day) {
      var matches = [];
      DB.rooms.forEach(function(r) {
        var k = r.id + '_' + sl.id + '_' + day;
        var cv = DB.sched[k];
        if(cv && cv.subject && (cv.teacher===teacherName||cv.teacher2===teacherName||cv.teacher3===teacherName)) {
          matches.push({
            subject:   cv.subject,
            room:      r.label,
            learnRoom: TeacherSchedule.learnRoom(DB,cv,r.id),
            teacher2:  cv.teacher===teacherName?(cv.teacher2||''):'',
            teacher3:  cv.teacher===teacherName?(cv.teacher3||''):'',
          });
        }
      });
      TeacherSchedule.activities(DB,teacherName,sl.id,day).forEach(a=>matches.push({subject:a.subject,room:'เลือกวิชา',learnRoom:'',teacher2:'',teacher3:''}));
      row.cells[day] = matches;
    });
    data.push(row);
  });
  return data;
}

// Use a normal-flow print overlay so every teacher can paginate.
async function printTeacherViews(teachers){
 try{await TeacherPrint.print(DB,teachers,{logo:await getRequiredExportLogo()});}catch(error){toast(error.message,'warn');}
}
function printTeacherView(){const teacher=DB.teachers.find(t=>t.id===_tvCurrentTeacherId);if(!teacher){toast('กรุณาเลือกครูก่อน','warn');return;}printTeacherViews([teacher]);}
function printAllTeacherViews(){printTeacherViews(DB.teachers);}

// Export teacher timetable to Word (.docx)
function exportTeacherViewDocx() {
  var id = _tvCurrentTeacherId;
  if(!id) { toast('\u0e01\u0e23\u0e38\u0e13\u0e32\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e04\u0e23\u0e39\u0e01\u0e48\u0e2d\u0e19','warn'); return; }
  var t = DB.teachers.find(function(x){ return x.id===id; });
  if(!t) { toast('\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e04\u0e23\u0e39','warn'); return; }
  buildTeacherDocx(t.prefix+t.first+' '+t.last, t);
}

async function exportTeacherViewDocxAll(){
 const button=document.getElementById('tvExportAllDocx');if(button?.disabled)return;
 if(!DB.teachers.length){toast('ยังไม่มีข้อมูลครู','warn');return;}
 if(typeof window.docx==='undefined'){toast('ไลบรารี Word ยังไม่พร้อม','warn');return;}
 const label=button?.textContent;if(button){button.disabled=true;button.textContent='กำลังรวมตารางสอน…';}
 try{
  const sections=[],logo=await getRequiredExportLogo();
  for(const teacher of DB.teachers)sections.push(await buildTeacherDocx(TeacherSchedule.name(teacher),teacher,{sectionOnly:true,logo}));
  const doc=new window.docx.Document({styles:{default:{document:{run:{font:'TH SarabunPSK',size:18,sizeComplexScript:18}}}},sections});
  const blob=await window.docx.Packer.toBlob(doc);dlBlob(blob,'ตารางสอนครูทั้งหมด_ปี'+(DB.school.year||'')+'.docx');toast('ดาวน์โหลดตารางสอน '+sections.length+' คน ในไฟล์เดียวแล้ว','succ');
 }catch(error){toast('ส่งออกไม่สำเร็จ: '+error.message,'warn');}finally{if(button){button.disabled=false;button.textContent=label;}}
}

async function buildTeacherDocx(teacherName, teacherObj, options={}) {
  if(typeof docx === 'undefined') { alert('ไลบรารี docx ยังไม่พร้อม'); return; }
  const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,ImageRun,
    AlignmentType,PageOrientation,WidthType,ShadingType,BorderStyle,VerticalAlign}=window.docx;

  const school=DB.school, font='TH SarabunPSK', margin=540, contentW=15750;
  const dayW=1250, breakW=900, remaining=contentW-dayW;
  const baseW=Math.floor((remaining-DB.slots.filter(s=>s.isBreak).length*breakW)/Math.max(1,DB.slots.filter(s=>!s.isBreak).length));
  const colWidths=[dayW,...DB.slots.map(s=>s.isBreak?breakW:baseW)];
  colWidths[colWidths.length-1]+=contentW-colWidths.reduce((a,b)=>a+b,0);
  const bdr=(c,sz)=>({style:BorderStyle.SINGLE,size:sz,color:c});
  const dkB={top:bdr('1A3A6E',6),bottom:bdr('1A3A6E',6),left:bdr('1A3A6E',4),right:bdr('1A3A6E',4)};
  const ltB={top:bdr('C5D3EA',3),bottom:bdr('C5D3EA',3),left:bdr('C5D3EA',3),right:bdr('C5D3EA',3)};
  const mg={top:55,bottom:55,left:75,right:75};
  const t=(text,opts={})=>new TextRun({text:String(text||''),font,...opts,...(opts.size?{size:Math.round(opts.size*1.5),sizeComplexScript:Math.round(opts.size*1.5)}:{})});

  const hdrChildren=[new TableCell({borders:dkB,width:{size:dayW,type:WidthType.DXA},margins:mg,shading:{fill:'1A3A6E',type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,children:[new Paragraph({alignment:AlignmentType.CENTER,children:[t('วัน / คาบ',{bold:true,color:'FFFFFF',size:12})]})]})];
  DB.slots.forEach((sl,i)=>{
    hdrChildren.push(new TableCell({borders:dkB,width:{size:colWidths[i+1],type:WidthType.DXA},margins:mg,shading:{fill:sl.isBreak?'E65100':'1A3A6E',type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,children:[
      new Paragraph({alignment:AlignmentType.CENTER,children:[t(sl.label,{bold:true,color:'FFFFFF',size:12})]}),
      new Paragraph({alignment:AlignmentType.CENTER,children:[t(sl.start+'–'+sl.end,{color:'FFFFFF',size:10})]})
    ]}));
  });
  const hdrRow=new TableRow({tableHeader:true,children:hdrChildren});

  const rows=DB.days.map(day=>{
    const cells=[new TableCell({borders:ltB,width:{size:dayW,type:WidthType.DXA},margins:mg,shading:{fill:'EEF3FF',type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,children:[new Paragraph({alignment:AlignmentType.CENTER,children:[t(day,{bold:true,color:'1A3A6E',size:12})]})]})];
    DB.slots.forEach((sl,i)=>{
      if(sl.isBreak){
        cells.push(new TableCell({borders:ltB,width:{size:colWidths[i+1],type:WidthType.DXA},margins:mg,shading:{fill:'FFF8E1',type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,children:[new Paragraph({alignment:AlignmentType.CENTER,children:[t('พักเที่ยง',{bold:true,color:'E65100',size:12})]})]}));
        return;
      }
      const matches=[];
      DB.rooms.forEach(r=>{const cv=DB.sched[r.id+'_'+sl.id+'_'+day];if(cv&&cv.subject&&(cv.teacher===teacherName||cv.teacher2===teacherName||cv.teacher3===teacherName))matches.push({cv,room:r.label});});
      TeacherSchedule.activities(DB,teacherName,sl.id,day).forEach(a=>matches.push({cv:{subject:a.subject},room:'เลือกวิชา'}));
      let fill='FFFFFF'; const paras=[];
      if(matches.length){
        matches.forEach(m=>{
          paras.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:8},children:[t(m.cv.subject,{bold:true,size:11,color:'1A3A6E'})]}));
          paras.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:4},children:[t(m.room,{size:10,color:'666666'})]}));
          if(TeacherSchedule.learnRoom(DB,m.cv)) paras.push(new Paragraph({alignment:AlignmentType.CENTER,children:[t('ห้อง '+TeacherSchedule.learnRoom(DB,m.cv),{size:9,color:'555555'})]}));
        });
      } else paras.push(new Paragraph({alignment:AlignmentType.CENTER,children:[t('',{size:12})]}));
      cells.push(new TableCell({borders:ltB,width:{size:colWidths[i+1],type:WidthType.DXA},margins:mg,shading:{fill:fill,type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,children:paras}));
    });
    return new TableRow({children:cells});
  });

  const exportLogo=options.logo||await getRequiredExportLogo();
  const logoSize=LOGO_SIZES['medium']||LOGO_SIZES.small;
  const logoBuf=await logoToArrayBuffer(exportLogo);
  const logoType=logoMimeToType(exportLogo);
  const logoRun=new ImageRun({type:logoType,data:logoBuf,transformation:{width:logoSize.w,height:logoSize.h},altText:{title:'logo',description:'logo',name:'logo'}});
  const rankTxt=teacherObj&&teacherObj.rank?teacherObj.rank+(teacherObj.dept?'  กลุ่มสาระ'+teacherObj.dept:''):'';
  const section={properties:{type:window.docx.SectionType.NEXT_PAGE,page:{size:{width:11906,height:16838,orientation:PageOrientation.LANDSCAPE},margin:{top:margin,right:margin,bottom:margin,left:margin}}},children:[
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[logoRun]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:50},children:[t('ตารางสอน',{bold:true,size:20,color:'1A3A6E'})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:35},children:[t(teacherName,{bold:true,size:16,color:'1A3A6E'})]}),
    ...(rankTxt?[new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:30},children:[t(rankTxt,{size:12,color:'4A5568'})]})]:[]),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:30},children:[t('โรงเรียน'+(school.name||''),{bold:true,size:15})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:120},children:[t('ภาคเรียนที่ '+(school.semester||'')+'   ปีการศึกษา '+(school.year||''),{size:13})]}),
    new Table({width:{size:contentW,type:WidthType.DXA},columnWidths:colWidths,rows:[hdrRow,...rows]})
  ]};
  if(options.sectionOnly)return section;
  const doc=new Document({styles:{default:{document:{run:{font:'TH SarabunPSK',size:18,sizeComplexScript:18}}}},sections:[section]});
  const blob=await Packer.toBlob(doc);
  const safe=teacherName.replace(/[^\u0e00-\u0e7fa-zA-Z0-9]/g,'_');
  dlBlob(blob,'ตารางสอน_'+safe+'_ปี'+(school.year||'')+'.docx');
  toast('ดาวน์โหลดตารางสอน '+teacherName+' เสร็จแล้ว','succ');
}

function buildTeacherViewTable(teacherName){
  if(!DB.slots.length||!DB.days.length) return '<div class="alert a-warn">กรุณาตั้งค่าคาบและวัน</div>';

  const slotHds=DB.slots.map(sl=>{
    if(sl.isBreak){
      return `<th style="width:66px;max-width:66px;min-width:66px;background:#E65100;color:#fff;padding:8px 5px;text-align:center;border:1px solid #D95A00">
        <div>${sl.label}</div><div style="font-size:10px;font-weight:600">${sl.start}–${sl.end}</div>
      </th>`;
    }
    return `<th style="min-width:118px;background:var(--pri);color:#fff;padding:8px 5px;text-align:center;border:1px solid #1a2f5e">
      <div>${sl.label}</div><div style="font-size:10px;font-weight:600;opacity:.85">${sl.start}–${sl.end}</div>
    </th>`;
  }).join('');

  const rows=DB.days.map((day,dayIndex)=>{
    const cells=DB.slots.map(sl=>{
      if(sl.isBreak){
        if(dayIndex>0) return '';
        return `<td rowspan="${DB.days.length}" style="background:#FFF8E1;border:1px solid #FFD05A;text-align:center;vertical-align:middle;font-weight:800;color:#E65100;min-width:66px;width:66px"><div style="writing-mode:vertical-lr;transform:none;text-orientation:mixed;margin:auto">พักเที่ยง</div></td>`;
      }
      const matches=[];
      DB.rooms.forEach(r=>{
        const k=r.id+'_'+sl.id+'_'+day; const cv=DB.sched[k];
        if(cv&&cv.subject){
          const isT1=cv.teacher===teacherName;
          const isT2=cv.teacher2===teacherName;
          const isT3=cv.teacher3===teacherName;
          if(isT1||isT2||isT3){
            const role=isT1?'':(isT2?'<span class="tv-role">+2</span>':'<span class="tv-role">+3</span>');
            const coTeacher=(isT1&&cv.teacher2)?`<div style="font-size:9px;color:#555;margin-top:1px">+${cv.teacher2}</div>`:'';
            matches.push(`<div class="tv-cell">
              ${role}<div class="tv-subj">${cv.subject}</div>
              <div class="tv-room">${r.label}</div>${coTeacher}
              ${TeacherSchedule.learnRoom(DB,cv)?`<div class="cell-room-tag" style="background:#fff;color:#555;border:1px solid #D9E2F2">ห้อง ${TeacherSchedule.escape(TeacherSchedule.learnRoom(DB,cv))}</div>`:''}
            </div>`);
          }
        }
      });
      TeacherSchedule.activities(DB,teacherName,sl.id,day).forEach(a=>matches.push('<div class="tv-cell"><div class="tv-subj">'+teacherBuilderEscape(a.subject)+'</div><div class="tv-room">เลือกวิชา</div></div>'));
      return `<td style="border:1px solid #dde;padding:4px;vertical-align:top;min-width:118px;background:#FFFFFF">${matches.join('')||'<div style="color:#ccc;text-align:center;padding:8px">—</div>'}</td>`;
    }).join('');
    return `<tr>
      <td class="tc-row" style="border:1px solid #dde;padding:9px 10px;background:#EEF3FF;text-align:center;white-space:nowrap;font-weight:800;font-size:12px;position:sticky;left:0;z-index:2;color:var(--pri);min-width:74px;width:74px">${day}</td>
      ${cells}
    </tr>`;
  }).join('');

  return `<div class="teacher-view-wrap" style="overflow:auto">
    <table class="tv-tbl" style="width:100%;border-collapse:collapse;min-width:${120 + DB.slots.length*118}px">
      <thead><tr>
        <th style="min-width:74px;width:74px;background:var(--pri);color:#fff;padding:8px 4px;border:1px solid #1a2f5e;position:sticky;left:0;z-index:4">วัน/คาบ</th>
        ${slotHds}
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}

// ════════════════════════════════════════════
//  WORKLOAD
// ════════════════════════════════════════════
function calcWorkload(){
  return DB.teachers.map(t=>{
    const name=t.prefix+t.first+' '+t.last;
    const hours1=Object.values(DB.sched).filter(c=>c&&c.teacher===name&&c.subject).length;
    const hours2=Object.values(DB.sched).filter(c=>c&&c.teacher2===name&&c.subject).length;
    return{id:t.id,name,hours:hours1+hours2+TeacherSchedule.activities(DB,name).length,dept:t.dept||''};
  });
}
function renderWorkload(){
  const el=document.getElementById('workloadContent'); if(!el) return;
  const wl=calcWorkload();
  if(!wl.length){el.innerHTML='<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">ยังไม่มีข้อมูลครู</div></div>';return;}
  el.innerHTML=`<table class="tbl"><thead><tr><th>ครู</th><th>กลุ่มสาระ</th><th>ชม./สัปดาห์</th><th>ภาระงาน</th><th>สถานะ</th></tr></thead>
  <tbody>${wl.sort((a,b)=>b.hours-a.hours).map(t=>`<tr>
    <td><strong>${t.name}</strong></td><td>${t.dept||'-'}</td>
    <td style="font-size:20px;font-weight:800;color:${t.hours>20?'var(--err)':t.hours>18?'var(--gold)':'var(--succ)'}">${t.hours}</td>
    <td><div class="wl-row"><div class="wl-bar-bg" style="min-width:100px">
      <div class="wl-bar-fill ${t.hours>20?'wl-over':t.hours>18?'wl-warn':'wl-ok'}" style="width:${Math.min(100,t.hours/25*100)}%"></div>
    </div></div></td>
    <td>${t.hours>20?'<span class="badge b-red">เกินมาตรฐาน</span>':t.hours>18?'<span class="badge b-yellow">ค่อนข้างมาก</span>':t.hours>0?'<span class="badge b-green">ปกติ</span>':'<span class="badge" style="background:#f3f4f6;color:#6b7280">ยังไม่มีชั่วโมง</span>'}</td>
  </tr>`).join('')}</tbody></table>`;
}

// ════════════════════════════════════════════
//  EXPORT PAGE
// ════════════════════════════════════════════
function renderExportPage(){
  const listEl=document.getElementById('exportRoomList');
  const previewSel=document.getElementById('previewRoomSel');
  if(!listEl) return;
  if(!DB.rooms.length){
    listEl.innerHTML='<div class="alert a-warn">ยังไม่มีห้องเรียน กรุณาเพิ่มห้องก่อน</div>';
    if(previewSel) previewSel.innerHTML=''; return;
  }
  listEl.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:8px">${DB.rooms.map(r=>`
    <label style="display:flex;align-items:center;gap:7px;padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;background:#fff;font-size:13px;font-weight:600">
      <input type="checkbox" value="${r.id}" checked style="accent-color:var(--pri)"> 🚪 ${r.label}
    </label>`).join('')}</div>`;
  if(previewSel) previewSel.innerHTML='<option value="">-- เลือกห้อง --</option>'+DB.rooms.map(r=>`<option value="${r.id}">${r.label}</option>`).join('');
}
function renderPreview(){
  const id=document.getElementById('previewRoomSel').value;
  const el=document.getElementById('previewContent'); if(!el) return;
  if(!id){el.innerHTML='<div class="empty-state"><div class="empty-icon">🗓️</div><div class="empty-text">เลือกห้องเพื่อดูตัวอย่าง</div></div>';return;}
  const r=DB.rooms.find(x=>x.id===id); if(!r) return;
  el.innerHTML=roomPreviewHTML(r);
}
function roomPreviewHTML(r,exportLogo){
  const hr=DB.teachers.find(t=>t.id===r.homeroom);
  const slotHds=TeacherSchedule.studentSlots(DB).map(sl=>{
    if(sl.isBreak){
      return `<th style="background:#E65100;color:#fff;padding:10px 6px;text-align:center;border:1px solid #c94a00;min-width:90px">
        <div style="font-weight:800">${sl.label}</div><div style="font-size:10px;opacity:.9">${sl.start}–${sl.end}</div></th>`;
    }
    return `<th style="background:var(--pri);color:#fff;padding:10px 6px;text-align:center;border:1px solid #1a2f5e;min-width:118px">
      <div style="font-weight:800">${sl.label}</div><div style="font-size:10px;opacity:.85">${sl.start}–${sl.end}</div></th>`;
  }).join('');
  const rows=DB.days.map((d,dayIndex)=>{
    const cells=TeacherSchedule.studentSlots(DB).map(sl=>{
      if(sl.isBreak){
        if(dayIndex>0) return '';
        return `<td rowspan="${DB.days.length}" style="background:#FFF8E1;border:1px solid #FFC107;padding:4px;text-align:center;font-weight:800;color:#E65100;min-width:66px;width:66px;vertical-align:middle"><div style="writing-mode:vertical-lr;transform:none;text-orientation:mixed;margin:auto">พักเที่ยง</div></td>`;
      }
      const cv=DB.sched[r.id+'_'+sl.id+'_'+d]||{};
      const subj=findSubjectForRoom(cv.subject,r.id);
      return`<td style="background:#fff;border:1px solid #cdd;padding:5px 6px;text-align:center;min-width:125px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:2px">${cv.subject||''}</div>
        ${cv.teacher?`<div style="font-size:11px;color:#1a3a6e;font-weight:600">${cv.teacher}</div>`:''}
        ${cv.teacher2?`<div style="font-size:10px;color:#2a5298">+${cv.teacher2}</div>`:''}
        ${cv.teacher3?`<div style="font-size:10px;color:#4472c4">+${cv.teacher3}</div>`:''}
        ${TeacherSchedule.learnRoom(DB,cv,r.id)?`<div class="cell-room-tag">ห้อง ${TeacherSchedule.escape(TeacherSchedule.learnRoom(DB,cv,r.id))}</div>`:''}
      </td>`;
    }).join('');
    return`<tr><td style="background:#eef3ff;border:1px solid #cdd;padding:8px 10px;text-align:center;font-weight:800;color:var(--pri);min-width:74px;width:74px">${d}</td>${cells}</tr>`;
  }).join('');
  const logoSource=exportLogo||DB.school.logoDataUrl;
  const logoHtml=logoSource
    ?`<img src="${logoSource}" style="width:60px;height:60px;object-fit:contain;margin-bottom:6px;display:block;margin-left:auto;margin-right:auto">`:'';
  return `<div style="text-align:center;margin-bottom:14px">
    ${logoHtml}
    <div style="font-family:'Noto Serif Thai',serif;font-size:20px;font-weight:700;color:var(--pri)">ตารางเรียน</div>
    <div style="font-weight:700;font-size:15px;margin-top:4px">โรงเรียน${DB.school.name||'...'} ชั้น ${r.label}</div>
    <div style="font-size:13px;color:var(--muted)">ภาคเรียนที่ ${DB.school.semester} ปีการศึกษา ${DB.school.year}</div>
  </div>
  <div style="overflow:auto"><table style="width:100%;border-collapse:collapse">
    <thead><tr><th style="background:var(--pri);color:#fff;padding:10px;text-align:center;border:1px solid #1a2f5e;min-width:74px;width:74px">วัน/คาบ</th>${slotHds}</tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  ${StudentSignatures.html(DB.school)}`;
}
async function doExportSelected(type){
  const checked=[...document.querySelectorAll('#exportRoomList input:checked')].map(x=>x.value);
  const msgEl=document.getElementById('exportMsg'); if(msgEl) msgEl.innerHTML='';
  if(!checked.length){if(msgEl) msgEl.innerHTML='<div class="alert a-warn">กรุณาเลือกห้องอย่างน้อย 1 ห้อง</div>';return;}
  if(!window.docx||!window.saveAs){
    if(msgEl) msgEl.innerHTML='<div class="alert a-err">❌ ไลบรารีสร้างไฟล์ Word ยังไม่โหลด กรุณารอสักครู่แล้วลองใหม่</div>';
    return;
  }
  if(msgEl) msgEl.innerHTML='<div class="alert a-info">⏳ กำลังสร้างไฟล์...</div>';
  try{
    for(const rid of checked){
      const r=DB.rooms.find(x=>x.id===rid); if(!r) continue;
      if(type==='both'){ await buildDocx('student',r); await delay(400); await buildDocx('teacher',r); }
      else await buildDocx(type,r);
      await delay(300);
    }
    if(msgEl) msgEl.innerHTML=`<div class="alert a-succ">✅ ส่งออก ${checked.length} ห้อง สำเร็จ!</div>`;
  }catch(err){
    if(msgEl) msgEl.innerHTML=`<div class="alert a-err">❌ ${err.message}</div>`;
  }
}


async function _buildRoomExportPng(roomId,type){
  if(typeof html2canvas==='undefined') throw new Error('ระบบสร้าง PNG ยังไม่พร้อม');
  var room=DB.rooms.find(function(r){return r.id===roomId;});
  if(!room) throw new Error('ไม่พบห้องเรียน');

  await getRequiredExportLogo();
  var wrap=document.createElement('div');
  wrap.className='room-png-export';
  wrap.style.cssText='position:fixed;left:-20000px;top:0;background:#fff;padding:26px 28px;width:1500px;box-sizing:border-box;font-family:Sarabun,sans-serif;color:#1a2a44;z-index:-1;';

  // Use only the current preview header/table. Do not create a second PNG header.
  wrap.innerHTML = '<div id="_roomPngTable"></div>';

  document.body.appendChild(wrap);

  // Reuse the current export preview renderer so PNG always matches the on-screen preview.
  var host=wrap.querySelector('#_roomPngTable');
  var oldPreview=document.getElementById('previewContent');
  var oldSelect=document.getElementById('previewRoomSel');
  var restoreValue=oldSelect?oldSelect.value:null;

  try{
    if(oldSelect) oldSelect.value=roomId;
    if(typeof renderPreview==='function'){
      renderPreview();
      await new Promise(function(r){setTimeout(r,80);});
      if(oldPreview && oldPreview.children.length){
        var clone=oldPreview.cloneNode(true);
        clone.removeAttribute('id');
        clone.querySelectorAll('button,.no-print').forEach(function(x){x.remove();});
        clone.style.maxWidth='none';
        clone.style.width='100%';
        clone.style.overflow='visible';
        host.appendChild(clone);
      }
    }
    if(!host.children.length){
      throw new Error('ไม่สามารถสร้างตัวอย่างตารางสำหรับ PNG ได้');
    }
    await new Promise(function(r){setTimeout(r,80);});
    var canvas=await html2canvas(wrap,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false});
    return canvas;
  }finally{
    if(oldSelect && restoreValue!==null) oldSelect.value=restoreValue;
    if(typeof renderPreview==='function' && oldSelect) renderPreview();
    wrap.remove();
  }
}

function _downloadCanvasPng(canvas,filename){
  var a=document.createElement('a');
  a.download=filename;
  a.href=canvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function exportSelectedRoomPng(type){
  var checked=[];
  document.querySelectorAll('#exportRoomList input:checked').forEach(function(x){checked.push(x.value);});
  if(!checked.length){
    toast('กรุณาเลือกห้องที่ต้องการส่งออก','warn');
    return;
  }
  try{
    var kinds=type==='both'?['student','teacher']:[type];
    for(var i=0;i<checked.length;i++){
      var room=DB.rooms.find(function(r){return r.id===checked[i];});
      if(!room) continue;
      for(var k=0;k<kinds.length;k++){
        var kind=kinds[k];
        var canvas=await _buildRoomExportPng(room.id,kind);
        var label=kind==='teacher'?'ตารางสอน':'ตารางเรียน';
        var safe=(room.label||room.id).replace(/[^\u0e00-\u0e7fa-zA-Z0-9_-]/g,'_');
        _downloadCanvasPng(canvas,label+'_'+safe+'.png');
        await new Promise(function(r){setTimeout(r,120);});
      }
    }
    var count=checked.length*(type==='both'?2:1);
    var msg=document.getElementById('exportMsg');
    if(msg) msg.innerHTML='<div style="padding:11px 14px;background:#e8f5e9;border-left:4px solid #2e7d32;border-radius:8px;color:#2e7d32;font-weight:700">☑ ส่งออก PNG '+count+' ไฟล์ สำเร็จ!</div>';
    toast('ส่งออก PNG สำเร็จ '+count+' ไฟล์','succ');
  }catch(e){
    console.error(e);
    toast('ส่งออก PNG ไม่สำเร็จ: '+e.message,'warn');
  }
}

async function exportAllDocx(){ nav('export'); }

// ════════════════════════════════════════════
//  STORAGE PAGE
// ════════════════════════════════════════════
function renderStoragePage(){
  updateStorageUI();
}
function updateStorageUI(){
  if(window.SCHOOL_OS_STORAGE==='firebase'){var size=document.getElementById('storageUsed');if(size)size.textContent=(new TextEncoder().encode(JSON.stringify(DB)).length/1024).toFixed(1)+' KB';}

  const lst=document.getElementById('lastSavedTime');
  const apn=document.getElementById('activeProfileName');
  if(lst) lst.textContent='ออนไลน์';
  if(apn) apn.textContent=(DB.school&&DB.school.name)||'School-OS';
}
function saveNow(){ if(window.SCHOOL_OS_STORAGE==='firebase')lastSavedSnapshotKey=''; persistNow(); showMsg('saveNowMsg','✅ ส่งคำสั่งบันทึกข้อมูลแล้ว','succ'); renderStoragePage(); }
async function reloadFromStorage(){
  if(!window.SCHOOL_AUTH||!SCHOOL_AUTH.loggedIn){
    toast('กรุณาเข้าสู่ระบบก่อนรีเฟรชฐานข้อมูล','warn');
    return;
  }
  if(!window.SCHOOL_ONLINE||typeof SCHOOL_ONLINE.refreshDatabase!=='function'){
    toast('ระบบรีเฟรชฐานข้อมูลยังไม่พร้อม','warn');
    return;
  }
  if(!confirm('รีเฟรชข้อมูลล่าสุดจากฐานข้อมูลออนไลน์?')) return;
  try{
    await SCHOOL_ONLINE.refreshDatabase();
    toast('🔄 รีเฟรชฐานข้อมูลล่าสุดแล้ว','succ');
  }catch(e){
    toast('รีเฟรชฐานข้อมูลไม่สำเร็จ: '+(e.message||e),'warn');
  }
}
function exportBackup(){
  const data={version:'4.0',exportedAt:new Date().toISOString(),data:DB};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  dlBlob(blob,'school_os_backup_'+new Date().toISOString().slice(0,10)+'.json');
  toast('📤 ส่งออก Backup สำเร็จ','succ');
}
function importBackup(event){
  const file=event.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const raw=JSON.parse(e.target.result);
      const incoming=raw&&raw.data?raw.data:raw;
      if(!incoming||typeof incoming!=='object'||!incoming.school) throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
      if(!confirm('นำเข้าข้อมูล Backup นี้และแทนที่ข้อมูลที่กำลังเปิดอยู่?')) return;
      DB=JSON.parse(JSON.stringify(incoming));
      if(typeof applySubjectColorScheme==='function') applySubjectColorScheme(false);
      if(typeof refreshAllDeptDropdowns==='function') refreshAllDeptDropdowns();
      if(typeof renderCustomDeptList==='function') renderCustomDeptList();
      renderAllUI();
      markDirty();
      toast('✅ นำเข้า Backup สำเร็จ และกำลังบันทึกออนไลน์','succ');
      showMsg('importMsg','✅ นำเข้าข้อมูลสำเร็จ','succ');
    }catch(err){
      showMsg('importMsg','❌ ไฟล์ไม่ถูกต้อง: '+err.message,'err');
    }
  };
  reader.readAsText(file,'UTF-8');
}

// ════════════════════════════════════════════
//  DOCX EXPORT
// ════════════════════════════════════════════
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function buildRoomSection(docType,room){
  const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,ImageRun,
    AlignmentType,PageOrientation,WidthType,ShadingType,BorderStyle,VerticalAlign}=window.docx;
  const school=DB.school, docTitle=docType==='teacher'?'ตารางสอน':'ตารางเรียน';
  const font='TH SarabunPSK', margin=540, contentW=15800;
  const dayCW=1250;
  const breakSlots=TeacherSchedule.studentSlots(DB).filter(sl=>sl.isBreak).length;
  const normalSlots=TeacherSchedule.studentSlots(DB).length-breakSlots;
  const breakCW=900;
  const usable=Math.max(1000,contentW-dayCW-(breakSlots*breakCW));
  const normalCW=normalSlots?Math.floor(usable/normalSlots):usable;
  let used=dayCW;
  const slotWidths=TeacherSchedule.studentSlots(DB).map((sl,i)=>{
    let w=sl.isBreak?breakCW:normalCW;
    if(i===TeacherSchedule.studentSlots(DB).length-1) w=contentW-used;
    used+=w;
    return Math.max(700,w);
  });
  const colWidths=[dayCW,...slotWidths];
  const b=(c,sz)=>({style:BorderStyle.SINGLE,size:sz,color:c});
  const dkB={top:b('1a3a6e',8),bottom:b('1a3a6e',8),left:b('1a3a6e',4),right:b('1a3a6e',4)};
  const ltB={top:b('c5d3ea',4),bottom:b('c5d3ea',4),left:b('c5d3ea',4),right:b('c5d3ea',4)};
  const brB={top:b('FFC107',4),bottom:b('FFC107',4),left:b('FFC107',4),right:b('FFC107',4)};
  const noB={style:BorderStyle.NONE,size:0,color:'FFFFFF'}, noBs={top:noB,bottom:noB,left:noB,right:noB};
  const mg={top:60,bottom:60,left:70,right:70};
  // PNG/CSS uses px; Word uses half-points. 1 px = 0.75 pt.
  const t=(text,opts={})=>new TextRun({text:String(text||''),font,...opts,...(opts.size?{size:Math.round(opts.size*1.5),sizeComplexScript:Math.round(opts.size*1.5)}:{})});
  const hr=DB.teachers.find(x=>x.id===room.homeroom);

  // Header: วัน / คาบ | คาบ 1 | คาบ 2 | ... | พักเที่ยง | ...
  const hdrRow=new TableRow({tableHeader:true,children:[
    new TableCell({borders:dkB,width:{size:dayCW,type:WidthType.DXA},margins:mg,
      shading:{fill:'1a3a6e',type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,
      children:[new Paragraph({alignment:AlignmentType.CENTER,children:[t('วัน / คาบ',{bold:true,color:'FFFFFF',size:14})]})]}),
    ...TeacherSchedule.studentSlots(DB).map((sl,i)=>new TableCell({
      borders:sl.isBreak?brB:dkB,
      width:{size:slotWidths[i],type:WidthType.DXA},margins:mg,
      shading:{fill:sl.isBreak?'E65100':'1a3a6e',type:ShadingType.CLEAR},
      verticalAlign:VerticalAlign.CENTER,
      children:[
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[t(sl.label,{bold:true,color:'FFFFFF',size:14})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[t(sl.start+'–'+sl.end,{bold:sl.isBreak,color:'FFFFFF',size:10})]})
      ]
    }))
  ]});

  // Rows: Monday–Friday, matching the on-screen Preview exactly.
  const dataRows=DB.days.map(day=>new TableRow({children:[
    new TableCell({borders:ltB,width:{size:dayCW,type:WidthType.DXA},margins:mg,
      shading:{fill:'EEF3FF',type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,
      children:[new Paragraph({alignment:AlignmentType.CENTER,children:[t(day,{bold:true,size:14,color:'1a3a6e'})]})]}),
    ...TeacherSchedule.studentSlots(DB).map((sl,i)=>{
      if(sl.isBreak){
        return new TableCell({borders:brB,width:{size:slotWidths[i],type:WidthType.DXA},margins:mg,
          shading:{fill:'FFF8E1',type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,
          children:[new Paragraph({alignment:AlignmentType.CENTER,children:[t('พักเที่ยง',{bold:true,size:14,color:'E65100'})]})]});
      }
      const cv=DB.sched[room.id+'_'+sl.id+'_'+day]||{};
      const subj=(typeof findSubjectForRoom==='function')?findSubjectForRoom(cv.subject,room.id):DB.subjects.find(s=>s.name===cv.subject);
      const fill='FFFFFF';
      const paras=[];
      paras.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:10},children:[t(cv.subject||'',{bold:!!cv.subject,size:13})]}));
      if(cv.teacher) paras.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[t(cv.teacher,{size:11,color:'1a3a6e',bold:true})]}));
      if(cv.teacher2) paras.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[t('+'+cv.teacher2,{size:10,color:'2a5298'})]}));
      if(cv.teacher3) paras.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[t('+'+cv.teacher3,{size:10,color:'4472c4'})]}));
      if(TeacherSchedule.learnRoom(DB,cv,room.id)) paras.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[t('ห้อง '+TeacherSchedule.learnRoom(DB,cv,room.id),{size:9,color:'2A5298',italics:true})]}));
      return new TableCell({borders:ltB,width:{size:slotWidths[i],type:WidthType.DXA},margins:mg,
        shading:{fill,type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,children:paras});
    })
  ]}));

  let sigTable;
  if(docType==='student'){
    const signers=StudentSignatures.signers(school),sigCW=Math.floor(contentW/3);
    const cells=[new TableCell({borders:noBs,width:{size:sigCW,type:WidthType.DXA},children:[new Paragraph({children:[]})]})];
    for(const signer of signers){
      const signature=signer.image?new ImageRun({type:'png',data:await logoToArrayBuffer(signer.image),transformation:StudentSignatures.size(signer.image),altText:{title:'ลายเซ็น'+signer.position,description:'ลายเซ็น'+signer.position,name:'signature'}}):null;
      cells.push(new TableCell({borders:noBs,width:{size:sigCW,type:WidthType.DXA},margins:{top:70,bottom:70,left:140,right:140},children:[
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:80,after:0},children:signature?[signature]:[t(' ',{size:40})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:40},children:[t('ลงชื่อ ..........................................',{size:13})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:30},children:[t('('+(signer.name||'..........................................')+')',{size:13})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:30},children:[t(signer.position,{bold:true,size:12,color:'1a3a6e'})]})
      ]}));
    }
    sigTable=new Table({width:{size:contentW,type:WidthType.DXA},columnWidths:[sigCW,sigCW,sigCW],rows:[new TableRow({children:cells})]});
  }else{
  const sigCW=Math.floor(contentW/3);
  function sig(title,name,pos){
    return new TableCell({borders:noBs,width:{size:sigCW,type:WidthType.DXA},margins:{top:70,bottom:70,left:140,right:140},
      children:[
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:240,after:40},children:[t('ลงชื่อ ..........................................',{size:13})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:30},children:[t('('+(name||'..........................................')+')',{size:13})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:30},children:[t(pos||title,{bold:true,size:12,color:'1a3a6e'})]})
      ]});
  }
  const sigCells=[];
  if(hr) sigCells.push(sig('ครูประจำชั้น'+(room.homeroom2||room.homeroom3?' (1)':''),hr.prefix+hr.first+' '+hr.last,hr.rank||'ครูประจำชั้น'));
  if(room.homeroom2){const t2=DB.teachers.find(x=>x.id===room.homeroom2);if(t2)sigCells.push(sig('ครูประจำชั้น (2)',t2.prefix+t2.first+' '+t2.last,t2.rank||'ครูประจำชั้น'));}
  if(room.homeroom3){const t3=DB.teachers.find(x=>x.id===room.homeroom3);if(t3)sigCells.push(sig('ครูประจำชั้น (3)',t3.prefix+t3.first+' '+t3.last,t3.rank||'ครูประจำชั้น'));}
  sigCells.push(sig('ครูวิชาการ',school.acadName,school.acadPos||'ครูวิชาการ'));
  while(sigCells.length<3) sigCells.unshift(new TableCell({borders:noBs,width:{size:sigCW,type:WidthType.DXA},children:[new Paragraph({children:[]})]}));
  sigTable=new Table({width:{size:contentW,type:WidthType.DXA},columnWidths:[sigCW,sigCW,sigCW],rows:[new TableRow({children:sigCells.slice(-3)})]});

  }

  const exportLogo=await getRequiredExportLogo();
  const logoSize=LOGO_SIZES['medium']||LOGO_SIZES.small;
  const logoBuf=await logoToArrayBuffer(exportLogo);
  const logoType=logoMimeToType(exportLogo);
  const logoRun=new ImageRun({type:logoType,data:logoBuf,transformation:{width:logoSize.w,height:logoSize.h},altText:{title:'โลโก้โรงเรียน',description:'โลโก้โรงเรียน',name:'logo'}});

  return {
    properties:{page:{size:{width:11906,height:16838,orientation:PageOrientation.LANDSCAPE},margin:{top:margin,right:margin,bottom:margin,left:margin}}},
    children:[
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:50},children:[logoRun]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:60},children:[t(docTitle,{bold:true,size:20,color:'1a3a6e'})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:30},children:[t('โรงเรียน'+(school.name||'')+' ชั้น '+room.label,{bold:true,size:15})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:110},children:[t('ภาคเรียนที่ '+school.semester+' ปีการศึกษา '+school.year,{size:13,color:'5a6a80'})]}),
      new Table({width:{size:contentW,type:WidthType.DXA},columnWidths:colWidths,rows:[hdrRow,...dataRows]}),
      new Paragraph({spacing:{before:0,after:10},children:[]}),
      sigTable
    ]
  };
}
function roomDocument(sections){return new window.docx.Document({styles:{default:{document:{run:{font:'TH SarabunPSK',size:20,sizeComplexScript:20}}}},sections});}
async function buildDocx(docType,room){
 const section=await buildRoomSection(docType,room),blob=await window.docx.Packer.toBlob(roomDocument([section]));
 const title=docType==='teacher'?'ตารางสอน':'ตารางเรียน';
 dlBlob(blob,(title+'_'+room.label+'_ปี'+DB.school.year+'_ภาค'+DB.school.semester+'.docx').replace(/\//g,'-'));
}
function selectedStudentRooms(mode='selected'){
 const ids=mode==='current'?[document.getElementById('previewRoomSel').value]:[...document.querySelectorAll('#exportRoomList input:checked')].map(el=>el.value);
 const rooms=ids.map(id=>DB.rooms.find(r=>r.id===id)).filter(Boolean);if(!rooms.length)throw Error('กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง');return rooms;
}
async function exportStudentRoomsCombined(){
 const msg=document.getElementById('exportMsg');try{const rooms=selectedStudentRooms();if(msg)msg.textContent='กำลังสร้าง Word รวม '+rooms.length+' ห้อง…';const sections=[];for(const room of rooms){const section=await buildRoomSection('student',room);section.properties.type=window.docx.SectionType.NEXT_PAGE;sections.push(section);}const blob=await window.docx.Packer.toBlob(roomDocument(sections));dlBlob(blob,('ตารางเรียน_รวม'+rooms.length+'ห้อง_ปี'+DB.school.year+'_ภาค'+DB.school.semester+'.docx').replace(/\//g,'-'));if(msg)msg.textContent='ส่งออก Word รวม '+rooms.length+' ห้องในไฟล์เดียวแล้ว';}catch(error){if(msg)msg.textContent=error.message;toast(error.message,'warn');}
}
async function printStudentRooms(mode){try{const rooms=selectedStudentRooms(mode),logo=await getRequiredExportLogo();await TeacherPrint.printHTML(StudentPrint.documentHTML(rooms,room=>roomPreviewHTML(room,logo)));}catch(error){toast(error.message,'warn');}}

// ════════════════════════════════════════════
//  MODAL HELPERS
// ════════════════════════════════════════════
function openModal(id){ const el=document.getElementById(id); if(el) el.classList.add('open'); }
function closeModal(id){ const el=document.getElementById(id); if(el) el.classList.remove('open'); }

// ════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════
function gv(id){ const el=document.getElementById(id); return el ? el.value.trim() : ''; }
function showMsg(elId,text,type='info'){
  const el=document.getElementById(elId); if(!el) return;
  const cls={succ:'a-succ',err:'a-err',info:'a-info',warn:'a-warn'}[type]||'a-info';
  el.innerHTML='<div class="alert '+cls+'">'+text+'</div>';
  setTimeout(()=>{ if(el) el.innerHTML=''; },4000);
}
function dlBlob(blob,fname){
  if(window.saveAs){ saveAs(blob,fname); return; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; a.click();
}
// ════════════════════════════════════════════════════
// CONFLICT DETECTION SYSTEM
// ════════════════════════════════════════════════════
function detectConflicts(){
  var conflicts = [];
  var map = {};
  Object.entries(DB.sched).forEach(function(entry){
    var key=entry[0], val=entry[1];
    if(!val || !val.subject || !val.teacher) return;
    var parts = key.split('_');
    var roomId=parts[0], slotId=parseInt(parts[1]), day=parts[2];
    var teacher = val.teacher;
    var teacher2 = val.teacher2||'';
    var teacher3 = val.teacher3||'';
    var addToMap = function(tName) {
      if(!tName) return;
      if(!map[tName]) map[tName]={};
      if(!map[tName][day]) map[tName][day]={};
      if(!map[tName][day][slotId]) map[tName][day][slotId]=[];
      var room = DB.rooms.find(function(r){return r.id===roomId;});
      map[tName][day][slotId].push({
        roomId:roomId, roomLabel:room?room.label:roomId, subject:val.subject
      });
    };
    addToMap(teacher);
    addToMap(teacher2);
    addToMap(teacher3);
  });
  TeacherSchedule.activities(DB).forEach(a=>{map[a.teacher]||={};map[a.teacher][a.day]||={};(map[a.teacher][a.day][a.slotId]||=[]).push({roomId:'',roomLabel:'เลือกวิชา',subject:a.subject});});
  Object.keys(map).forEach(function(teacher){
    Object.keys(map[teacher]).forEach(function(day){
      Object.keys(map[teacher][day]).forEach(function(slotId){
        var rooms = map[teacher][day][slotId];
        if(rooms.length >= 2){
          var slot = DB.slots.find(function(s){return s.id===parseInt(slotId);});
          conflicts.push({
            teacherName:teacher, day:day,
            slotId:parseInt(slotId),
            slotLabel:slot?(slot.label+' ('+slot.start+'–'+slot.end+')'):('คาบ '+slotId),
            rooms:rooms
          });
        }
      });
    });
  });
  var dayOrder = DB.days||['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];
  conflicts.sort(function(a,b){
    if(a.teacherName!==b.teacherName) return a.teacherName.localeCompare(b.teacherName,'th');
    var da=dayOrder.indexOf(a.day), db=dayOrder.indexOf(b.day);
    if(da!==db) return da-db;
    return a.slotId-b.slotId;
  });
  return conflicts;
}
function getConflictCount(){ return detectConflicts().length; }
function updateConflictBadge(){
  var cnt = getConflictCount();
  var el = document.getElementById('conflictBadge');
  if(!el) return;
  el.textContent = cnt;
  el.className = 'conflict-badge'+(cnt===0?' zero':'');
  el.title = cnt===0?'ไม่มีตารางชนกัน':'พบ '+cnt+' จุดที่ชนกัน';
}
var _cfFilter = 'all';
function setCfFilter(v){ _cfFilter=v; renderConflictPage(); }
function renderConflictPage(){
  var area = document.getElementById('conflictContent');
  if(!area) return;
  var conflicts = detectConflicts();
  var cnt = conflicts.length;
  var byTeacher = {};
  conflicts.forEach(function(cf){
    if(!byTeacher[cf.teacherName]) byTeacher[cf.teacherName]=[];
    byTeacher[cf.teacherName].push(cf);
  });
  var teachers = Object.keys(byTeacher);
  var filterTeachers = (_cfFilter==='all')?teachers:teachers.filter(function(t){return t===_cfFilter;});
  var h = '';
  // Hero
  if(cnt===0){
    h += '<div class="conflict-hero conflict-ok-hero">';
    h += '<div class="conflict-hero-icon">&#10003;</div>';
    h += '<div><div class="conflict-hero-title">ไม่พบตารางสอนชนกัน</div>';
    h += '<div class="conflict-hero-sub">ตารางสอนของครูทุกคนถูกต้อง ไม่มีคาบซ้ำซ้อน</div></div></div>';
  } else {
    h += '<div class="conflict-hero">';
    h += '<div class="conflict-hero-icon">&#9888;</div>';
    h += '<div><div class="conflict-hero-title">พบตารางสอนชนกัน '+cnt+' จุด</div>';
    h += '<div class="conflict-hero-sub">ครู '+teachers.length+' คน มีคาบสอนซ้ำซ้อน — กรุณาแก้ไขก่อนประกาศใช้</div></div>';
    h += '<div style="margin-left:auto;text-align:center">';
    h += '<div style="font-size:40px;font-weight:800">'+cnt+'</div>';
    h += '<div style="font-size:12px;opacity:.8">จุดที่ชนกัน</div></div></div>';
    // Stats
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">';
    h += '<div class="uni-stat-card" style="border-color:#E53935"><div class="uni-stat-num" style="color:#E53935">'+cnt+'</div><div class="uni-stat-lbl">จุดที่ชนกันทั้งหมด</div></div>';
    h += '<div class="uni-stat-card" style="border-color:#FF6F00"><div class="uni-stat-num" style="color:#FF6F00">'+teachers.length+'</div><div class="uni-stat-lbl">ครูที่มีปัญหา</div></div>';
    h += '<div class="uni-stat-card" style="border-color:#1A3A6E"><div class="uni-stat-num" style="color:#1A3A6E">'+(DB.teachers.length-teachers.length)+'</div><div class="uni-stat-lbl">ครูที่ตารางปกติ</div></div>';
    h += '</div>';
    // Filter chips — use onclick with setCfFilter (safe function call, no dynamic string)
    h += '<div class="conflict-filter">';
    h += '<div class="cf-chip'+(_cfFilter==='all'?' on':'')+'" onclick="setCfFilter(\'all\')">ทั้งหมด ('+cnt+')</div>';
    teachers.forEach(function(t, ti){
      var on = (_cfFilter===t)?' on':'';
      // store teacher name in data attribute, use index-based lookup
      h += '<div class="cf-chip'+on+'" onclick="setCfFilter(cfTeachers['+ti+'])">'+t+' ('+byTeacher[t].length+')</div>';
    });
    h += '</div>';
    // Store teachers array globally for filter chips
    h += '<script>var cfTeachers='+JSON.stringify(teachers)+';<\/script>';
    // Cards
    filterTeachers.forEach(function(teacher){
      var cfs = byTeacher[teacher];
      h += '<div class="conflict-card">';
      h += '<div class="conflict-card-hd" onclick="var b=this.nextElementSibling;b.style.display=b.style.display===\'none\'?\'block\':\'none\'">';
      h += '<div style="font-size:22px">&#128106;</div>';
      h += '<div class="conflict-teacher-name">'+teacher+'</div>';
      h += '<span class="conflict-count-badge">'+cfs.length+' จุด</span>';
      h += '<span style="font-size:18px;margin-left:8px;color:#E53935">&#9660;</span></div>';
      h += '<div class="conflict-card-body">';
      h += '<div class="conflict-row conflict-col-hdr"><div>วัน</div><div>คาบ / เวลา</div><div>วิชา 1</div><div>วิชา 2+</div></div>';
      cfs.forEach(function(cf){
        h += '<div class="conflict-row">';
        h += '<div><b>'+cf.day+'</b></div>';
        h += '<div><span class="conflict-slot">'+cf.slotLabel+'</span></div>';
        h += '<div><div class="conflict-subj">'+cf.rooms[0].subject+'</div><div class="conflict-room-tag">'+cf.rooms[0].roomLabel+'</div></div>';
        h += '<div>';
        cf.rooms.slice(1).forEach(function(r){
          h += '<div class="conflict-subj">'+r.subject+'</div><div class="conflict-room-tag">'+r.roomLabel+'</div>';
        });
        h += '</div></div>';
      });
      h += '</div></div>';
    });
    h += '<div class="alert a-info" style="margin-top:16px">';
    h += '<b>วิธีแก้ไข:</b> ไปที่เมนู <b>สร้างตาราง (Builder)</b> ';
    h += 'เลือกห้องที่มีปัญหา แล้วเปลี่ยนครูหรือย้ายวิชาไปคาบอื่น ';
    h += 'จากนั้นกลับมาตรวจสอบอีกครั้ง</div>';
  }
  if(cnt===0){
    h += '<div class="no-conflict-box">';
    h += '<div class="no-conflict-icon">&#127881;</div>';
    h += '<div class="no-conflict-title">ตารางสอนสะอาด!</div>';
    h += '<div class="no-conflict-sub">ครูทุกคน '+DB.teachers.length+' คน ';
    h += 'ไม่มีคาบสอนซ้ำซ้อนกัน<br>พร้อมส่งออกและประกาศใช้งาน</div></div>';
  }
  area.innerHTML = h;
}
function getConflictCells(){
  var conflicts=detectConflicts(), bad=new Set();
  conflicts.forEach(function(cf){
    cf.rooms.forEach(function(r){
      bad.add(r.roomId+'_'+cf.slotId+'_'+cf.day);
    });
  });
  return bad;
}

function renderAllUI(){
  updateTopbar(); updateSidebarCounts();
  const p=currentPage;
  if(p==='dashboard') renderDashboard();
  else if(p==='school') fillSchoolForm();
  else if(p==='teachers') renderTeacherTable();
  else if(p==='subjects') renderSubjectTable();
  else if(p==='rooms') renderRoomTable();
  else if(p==='timeslots') renderTimeslots();
  else if(p==='builder') renderBuilder();
  else if(p==='teacher-builder') renderTeacherBuilder();
  else if(p==='auto-schedule') renderAutoSchedulePage();
  else if(p==='teacher-view') renderTeacherViewPage();
  else if(p==='workload') renderWorkload();
  else if(p==='export') renderExportPage();
  else if(p==='exchange'){ renderExchangePage(); }
  else if(p==='substitute'){ if(currentSubDate){ renderSubContent(); } else { setSubDateToday(); } }
  else if(p==='announcements') renderAnnouncements();
  else if(p==='sub-history') renderSubHistoryPage();
  else if(p==='conflict') renderConflictPage();
  updateConflictBadge();
}


// ════════════════════════════════════════════
//  LOGO MANAGEMENT
// ════════════════════════════════════════════
const LOGO_SIZES = {small:{w:60,h:60,emu_w:685800,emu_h:685800},
                    medium:{w:90,h:90,emu_w:1028700,emu_h:1028700},
                    large:{w:130,h:130,emu_w:1485900,emu_h:1485900}};

function handleLogoDrop(e){
  e.preventDefault();
  const dz=document.getElementById('logoDropZone'); if(dz) dz.classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if(file && file.type.startsWith('image/')) loadLogoFile(file);
  else toast('⚠️ กรุณาเลือกไฟล์รูปภาพเท่านั้น','warn');
}
function handleLogoFile(e){
  const file = e.target.files[0];
  if(file) loadLogoFile(file); e.target.value='';
}
function loadLogoFile(file){
  if(file.size > 2*1024*1024){ toast('⚠️ ไฟล์รูปต้องไม่เกิน 2MB','warn'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const dataUrl = ev.target.result;
    DB.school.logoDataUrl = dataUrl;
    _exportLogoCache = '';
    DB.school.logoSize = 'medium';
    renderLogoPreview(dataUrl, file.name, formatBytes(file.size), 'medium');
    markDirty();
    toast('🏫 โหลดโลโก้แล้ว','succ');
  };
  reader.readAsDataURL(file);
}
function renderLogoPreview(dataUrl, name, size, logoSize){
  const ph   = document.getElementById('logoPlaceholder');
  const area = document.getElementById('logoPreviewArea');
  const img  = document.getElementById('logoPreviewImg');
  const fn   = document.getElementById('logoFileName');
  const fs   = document.getElementById('logoFileSize');
  const rm   = document.getElementById('logoRemoveBtn');
  const dz   = document.getElementById('logoDropZone');
  if(!area||!img) return;
  img.src = dataUrl;
  img.style.display = 'block';
  if(ph) ph.style.display = 'none';
  if(fn) fn.textContent = name || 'โลโก้โรงเรียน';
  if(fs) fs.textContent = size || '';
  if(rm) rm.style.display = 'inline-flex';
  if(dz) dz.classList.remove('drag');
  area.style.display = 'block';
  DB.school.logoSize = 'medium';
}
function clearLogoPreview(){
  const ph   = document.getElementById('logoPlaceholder');
  const area = document.getElementById('logoPreviewArea');
  const img  = document.getElementById('logoPreviewImg');
  const fn   = document.getElementById('logoFileName');
  const fs   = document.getElementById('logoFileSize');
  const rm   = document.getElementById('logoRemoveBtn');
  const dz   = document.getElementById('logoDropZone');
  if(ph) ph.style.display = 'flex';
  if(img){ img.src=''; img.style.display='none'; }
  if(fn) fn.textContent = 'ยังไม่ได้อัปโหลดโลโก้';
  if(fs) fs.textContent = '';
  if(rm) rm.style.display = 'none';
  if(dz) dz.classList.remove('drag');
  if(area) area.style.display = 'block';
}
function setLogoSize(size){
  DB.school.logoSize = 'medium';
}
function removeLogo(){
  if(!confirm('ลบโลโก้โรงเรียน?')) return;
  DB.school.logoDataUrl = '';
  _exportLogoCache = '';
  DB.school.logoSize = 'medium';
  const inp = document.getElementById('logoFileInput');
  if(inp) inp.value = '';
  clearLogoPreview();
  markDirty();
  toast('🗑️ ลบโลโก้แล้ว','warn');
}
function formatBytes(b){
  if(b<1024) return b+' B';
  if(b<1024*1024) return (b/1024).toFixed(1)+' KB';
  return (b/(1024*1024)).toFixed(1)+' MB';
}

// ════════════════════════════════════════════
//  LOGO → Base64 bytes for docx ImageRun
// ════════════════════════════════════════════
const EXPORT_LOGO_FALLBACK = 'assets/school-logo.svg';
let _exportLogoCache = '';

async function imageSourceToPngDataUrl(src){
  return await new Promise(function(resolve,reject){
    const img = new Image();
    img.onload = function(){
      try{
        const max = 512;
        const scale = Math.min(1, max / Math.max(img.naturalWidth||max, img.naturalHeight||max));
        const w = Math.max(1, Math.round((img.naturalWidth||max)*scale));
        const h = Math.max(1, Math.round((img.naturalHeight||max)*scale));
        const c = document.createElement('canvas');
        c.width=w; c.height=h;
        const ctx=c.getContext('2d');
        ctx.clearRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL('image/png'));
      }catch(e){ reject(e); }
    };
    img.onerror = function(){ reject(new Error('โหลด Logo ไม่สำเร็จ')); };
    img.src = src;
  });
}

async function getRequiredExportLogo(){
  if(_exportLogoCache) return _exportLogoCache;
  const school = DB.school || {};
  const source = school.logoDataUrl || school.logoUrl || EXPORT_LOGO_FALLBACK;
  try{
    _exportLogoCache = /^data:image\/png/i.test(source) ? source : await imageSourceToPngDataUrl(source);
    return _exportLogoCache;
  }catch(e){
    if(source !== EXPORT_LOGO_FALLBACK){
      _exportLogoCache = await imageSourceToPngDataUrl(EXPORT_LOGO_FALLBACK);
      return _exportLogoCache;
    }
    throw new Error('ไม่สามารถเตรียม Logo สำหรับไฟล์ Export ได้');
  }
}

async function logoToArrayBuffer(dataUrl){
  const base64 = dataUrl.split(',')[1];
  if(!base64) throw new Error('ข้อมูล Logo ไม่ถูกต้อง');
  const binary  = atob(base64);
  const buf     = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) buf[i]=binary.charCodeAt(i);
  return buf.buffer;
}
function logoMimeToType(dataUrl){
  const m = dataUrl.match(/data:image\/([^;]+)/);
  if(!m) return 'png';
  const t = m[1].toLowerCase();
  if(t==='jpeg') return 'jpg';
  return t;
}


// ════════════════════════════════════════════
//  SUBSTITUTE TEACHING SYSTEM
// ════════════════════════════════════════════
// DB.sched key = `roomId_slotId_day`
// Substitute data stored in DB.substitute:
// { "2568-01-15": { absentList:[{teacherId,type,note,periods:[{slotId,day,roomId,subject,subTeacher,subNote}]}] } }

const TH_DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const ABSENCE_ICONS = {'ลาป่วย':'🤒','ลากิจ':'📋','ลาพักผ่อน':'🌴','ราชการ':'🏛️','อบรม':'📚','อื่นๆ':'📝'};

let currentSubDate = '';

function getSubDB(){
  if(!DB.substitute) DB.substitute = {};
  return DB.substitute;
}
function peekSubDay(dateStr){
  const db = DB.substitute || {};
  return db[dateStr] || null;
}
function getSubDay(dateStr){
  const db = getSubDB();
  if(!db[dateStr]) db[dateStr] = {absentList:[]};
  return db[dateStr];
}

// ── Date helpers ─────────────────────────────
function formatDateThai(dateStr){
  if(!dateStr) return '';
  const d = new Date(dateStr+'T00:00:00');
  return d.toLocaleDateString('th-TH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}
function getDayNameThai(dateStr){
  if(!dateStr) return '';
  const d = new Date(dateStr+'T00:00:00');
  return 'วัน'+TH_DAYS[d.getDay()];
}
function mapDayNameToSched(dateStr){
  // map JS date weekday → Thai day name used in sched keys
  const d = new Date(dateStr+'T00:00:00');
  const dayMap = {0:'อาทิตย์',1:'จันทร์',2:'อังคาร',3:'พุธ',4:'พฤหัสบดี',5:'ศุกร์',6:'เสาร์'};
  return dayMap[d.getDay()]||'';
}
function formatSchoolDateInput_(iso){
  if(!iso) return '';
  var p=String(iso).split('-');
  if(p.length!==3) return '';
  var y=Number(p[0]);
  return String(p[2]).padStart(2,'0')+'/'+String(p[1]).padStart(2,'0')+'/'+String(y+543);
}
function parseSchoolDateInput_(text){
  var m=String(text||'').trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if(!m) return '';
  var d=Number(m[1]), mo=Number(m[2]), y=Number(m[3]);
  if(y>2400) y-=543;
  var test=new Date(y,mo-1,d);
  if(test.getFullYear()!==y || test.getMonth()!==mo-1 || test.getDate()!==d) return '';
  return String(y).padStart(4,'0')+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0');
}
function syncSchoolDateControl(id){
  var native=document.getElementById(id), text=document.getElementById(id+'Text');
  if(native&&text) text.value=formatSchoolDateInput_(native.value||'');
}
function applySchoolDateControl(id,showWarning){
  var native=document.getElementById(id), text=document.getElementById(id+'Text');
  if(!native||!text) return false;
  var iso=parseSchoolDateInput_(text.value);
  if(!iso){
    if(showWarning!==false) toast('กรุณากรอกวันที่เป็น วัน/เดือน/ปี เช่น 05/10/2569','warn');
    syncSchoolDateControl(id); return false;
  }
  native.value=iso; text.value=formatSchoolDateInput_(iso); return true;
}
function openSchoolDatePicker(id){
  var el=document.getElementById(id); if(!el) return;
  if(typeof el.showPicker==='function') el.showPicker(); else el.click();
}
function syncSubDateText(){
  var iso=(document.getElementById('subDate')||{}).value||'';
  var text=document.getElementById('subDateText');
  if(text) text.value=formatSchoolDateInput_(iso);
}
function applySubDateText(showWarning){
  var text=document.getElementById('subDateText');
  var native=document.getElementById('subDate');
  if(!text||!native) return;
  var iso=parseSchoolDateInput_(text.value);
  if(!iso){
    if(showWarning!==false) toast('กรุณากรอกวันที่เป็น วัน/เดือน/ปี เช่น 04/09/2569','warn');
    syncSubDateText();
    return;
  }
  native.value=iso;
  text.value=formatSchoolDateInput_(iso);
  loadSubstituteDay();
}
function openSubDatePicker(){ openSchoolDatePicker('subDate'); }
function setSubDateToday(){
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2,'0');
  const d = String(today.getDate()).padStart(2,'0');
  const iso = y+'-'+m+'-'+d;
  document.getElementById('subDate').value = iso;
  syncSubDateText();
  loadSubstituteDay();
}

// ── Render substitute page for a date ────────
function loadSubstituteDay(){
  const dateStr = (document.getElementById('subDate')||{}).value||'';
  if(!dateStr){ return; }
  currentSubDate = dateStr;
  const dayName = getDayNameThai(dateStr);
  const dayEl = document.getElementById('subDayName');
  if(dayEl) dayEl.textContent = dayName + '  |  ' + formatDateThai(dateStr);
  renderSubContent();
}

function buildScheduledPeriodsForTeacher_(teacher,dateStr,existingPeriods){
  var schedDay=mapDayNameToSched(dateStr);
  var teacherName=subV2TeacherName(teacher);
  var existing={};
  (existingPeriods||[]).forEach(function(p){existing[String(p.slotId)+'|'+String(p.roomId||'')]=p;});
  var periods=[];
  (DB.rooms||[]).forEach(function(room){
    (DB.slots||[]).forEach(function(slot){
      if(slot.isBreak) return;
      var cv=DB.sched[room.id+'_'+slot.id+'_'+schedDay];
      if(!cv) return;
      if(cv.teacher!==teacherName && cv.teacher2!==teacherName && cv.teacher3!==teacherName) return;
      var key=String(slot.id)+'|'+String(room.id);
      var old=existing[key]||{};
      periods.push({
        slotId:slot.id,day:schedDay,roomId:room.id,subject:cv.subject||'',
        subTeacher:old.subTeacher||'',subNote:old.subNote||'',
        workType:old.workType||'',messageStatus:old.messageStatus||''
      });
    });
  });
  return periods;
}

function getSubViewDay(dateStr){
  var saved=peekSubDay(dateStr);
  var day={absentList:[]};
  if(saved && Array.isArray(saved.absentList)){
    day.absentList=saved.absentList.map(function(a){
      return Object.assign({},a,{periods:(a.periods||[]).map(function(p){return Object.assign({},p);})});
    });
  }
  return day;
}

function ensurePersistentAbsentFromView_(teacherId){
  var day=getSubDay(currentSubDate);
  return (day.absentList||[]).find(function(a){return String(a.teacherId)===String(teacherId);}) || null;
}


// ══════════════════════════════════════════════════════════════
//  SMART SUBSTITUTE: Teacher availability analyzer
// ══════════════════════════════════════════════════════════════
function analyzeSubTeacher(teacherObj, slotId, schedDay, subjectName, currentAbsentList) {
  /* Returns: {
       status: 'best'|'available'|'busy'|'absent',
       busyIn: '<room>' | null,
       busySubject: '<subject>' | null,
       canTeach: boolean,
       score: 0-100 (higher = better)
     }
  */
  var tName = teacherObj.prefix + teacherObj.first + ' ' + teacherObj.last;

  // 1. Check if teacher is also absent today
  var isAbsent = (currentAbsentList||[]).some(function(a){ return String(a.teacherId) === String(teacherObj.id) && (!a.manualOnly || (a.periods||[]).some(function(p){return String(p.slotId)===String(slotId);})); });
  if(isAbsent) {
    return { status:'absent', busyIn:null, busySubject:null, canTeach:false, score:0 };
  }

  // 2. Check if teacher is teaching in this slot+day
  var busyRoom = null, busySubj = null;
  for(var i=0; i<DB.rooms.length; i++) {
    var room = DB.rooms[i];
    var k = room.id + '_' + slotId + '_' + schedDay;
    var cv = DB.sched[k];
    if(cv && (cv.teacher === tName || cv.teacher2 === tName || cv.teacher3 === tName)) {
      busyRoom = room.label;
      busySubj = cv.subject;
      break;
    }
  }

  // 3. Can teach this subject?
  var canTeach = subjectName
    ? (teacherObj.subjects || []).includes(subjectName)
    : true;

  var freeActivity=TeacherSchedule.activities(DB,tName,slotId,schedDay)[0];if(freeActivity){busyRoom='เลือกวิชา';busySubj=freeActivity.subject;}
  if(busyRoom) {
    return { status:'busy', busyIn:busyRoom, busySubject:busySubj, canTeach:canTeach, score:0 };
  }

  // FREE — score: canTeach adds 100, base 50
  var score = canTeach ? 100 : 50;
  return {
    status: canTeach ? 'best' : 'available',
    busyIn: null, busySubject: null, canTeach: canTeach,
    score: score
  };
}

function buildSmartSubOptions(absent, p, schedDay, absentList) {
  /* Build dropdown options categorized by availability */
  var results = DB.teachers
    .filter(function(x){ return x.id !== absent.teacherId; })
    .map(function(x){
      var analysis = analyzeSubTeacher(x, p.slotId, schedDay, p.subject, absentList);
      return { teacher:x, name:x.prefix+x.first+' '+x.last, ...analysis };
    });

  // Sort: best > available > busy > absent, then by name
  results.sort(function(a,b){
    if(b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name, 'th');
  });

  // Group by status
  var groups = { best:[], available:[], busy:[], absent:[] };
  results.forEach(function(r){ groups[r.status].push(r); });

  var opts = '<option value="">-- เลือกครูสอนแทน --</option>';

  function mkOptLine(r, selected) {
    var sel = selected ? ' selected' : '';
    var prefix = '';
    var suffix = '';
    if(r.status === 'best')      prefix = '✅ ';
    else if(r.status === 'available') prefix = '🟡 ';
    else if(r.status === 'busy') {
      prefix = '🔴 ';
      suffix = ' — กำลังสอน ' + r.busyIn + (r.busySubject?' ('+r.busySubject+')':'');
    }
    else if(r.status === 'absent') {
      prefix = '⛔ ';
      suffix = ' — ลาวันนี้';
    }
    return '<option value="'+r.name+'"'+sel+(r.status==='busy'||r.status==='absent'?' disabled':'')+'>'+prefix+r.name+suffix+'</option>';
  }

  if(groups.best.length) {
    opts += '<optgroup label="✅ ว่าง + สอนวิชานี้ได้ ('+groups.best.length+')">';
    groups.best.forEach(function(r){ opts += mkOptLine(r, p.subTeacher===r.name); });
    opts += '</optgroup>';
  }
  if(groups.available.length) {
    opts += '<optgroup label="🟡 ว่าง (ไม่ใช่วิชาถนัด) ('+groups.available.length+')">';
    groups.available.forEach(function(r){ opts += mkOptLine(r, p.subTeacher===r.name); });
    opts += '</optgroup>';
  }
  if(groups.busy.length) {
    opts += '<optgroup label="🔴 กำลังสอนคาบนี้ ('+groups.busy.length+')">';
    groups.busy.forEach(function(r){ opts += mkOptLine(r, p.subTeacher===r.name); });
    opts += '</optgroup>';
  }
  if(groups.absent.length) {
    opts += '<optgroup label="⛔ ลาวันนี้ ('+groups.absent.length+')">';
    groups.absent.forEach(function(r){ opts += mkOptLine(r, p.subTeacher===r.name); });
    opts += '</optgroup>';
  }

  return {
    opts: opts,
    summary: {
      best: groups.best.length,
      available: groups.available.length,
      busy: groups.busy.length,
      absent: groups.absent.length
    }
  };
}



// ── Set substitute teacher ─────────────────
function setSubTeacher(ai,pi,val,selEl){
  const day = getSubDay(currentSubDate);
  if(!day.absentList[ai]) return;
  day.absentList[ai].periods[pi].subTeacher = val;
  if(selEl){ selEl.classList.toggle('assigned',!!val); }
  // update summary count
  const totalAssigned = day.absentList.reduce((s,a)=>s+a.periods.filter(p=>p.subTeacher).length,0);
  const sg = document.getElementById('sumAssigned');
  if(sg) sg.textContent = totalAssigned;
  markDirty();
}
function setSubNote(ai,pi,val){
  const day = getSubDay(currentSubDate);
  if(day.absentList[ai]) day.absentList[ai].periods[pi].subNote = val;
  markDirty();
}
function removeAbsent(ai){
  if(!confirm('ลบครูคนนี้ออกจากรายการลา?')) return;
  getSubDay(currentSubDate).absentList.splice(ai,1);
  renderSubContent(); markDirty();
}
function removePeriodFromAbsent(ai,pi){
  const day = getSubDay(currentSubDate);
  day.absentList[ai].periods.splice(pi,1);
  renderSubContent(); markDirty();
}

// ── Add absent teacher modal ──────────────
function addAbsentTeacher(){
  if(!currentSubDate){ toast('⚠️ กรุณาเลือกวันที่ก่อน','warn'); return; }
  const sel = document.getElementById('absentTeacherSel');
  const day = getSubViewDay(currentSubDate);
  const alreadyAbsent = (day.absentList||[]).map(a=>a.teacherId);
  if(sel){
    sel.innerHTML = '<option value="">-- เลือกครู --</option>'+
      DB.teachers.filter(t=>!alreadyAbsent.includes(t.id))
        .map(t=>`<option value="${t.id}">${t.prefix}${t.first} ${t.last} (${t.dept||'ไม่ระบุ'})</option>`).join('');
  }
  document.getElementById('absentType').value='ลาป่วย';
  document.getElementById('absentNote').value='';
  document.getElementById('absentPeriodsPreview').innerHTML='';
  openModal('modalAbsent');
}
function loadAbsentPeriods(){
  const tid = document.getElementById('absentTeacherSel').value;
  const preview = document.getElementById('absentPeriodsPreview');
  if(!tid||!preview){ if(preview) preview.innerHTML=''; return; }
  const t = DB.teachers.find(x=>x.id===tid);
  if(!t){ preview.innerHTML=''; return; }
  const tName = t.prefix+t.first+' '+t.last;
  const schedDay = mapDayNameToSched(currentSubDate);
  // find all periods this teacher has on this day across all rooms
  const periods = [];
  DB.rooms.forEach(room=>{
    DB.slots.forEach(slot=>{
      const k = room.id+'_'+slot.id+'_'+schedDay;
      const cv = DB.sched[k];
      if(cv && cv.teacher===tName){
        periods.push({slotId:slot.id,day:schedDay,roomId:room.id,
          subject:cv.subject,subTeacher:'',subNote:'',
          slotLabel:slot.label,slotTime:slot.start+'–'+slot.end,roomLabel:room.label});
      }
    });
  });
  if(!periods.length){
    preview.innerHTML=`<div class="alert a-info" style="margin:0">ℹ️ ครูคนนี้ไม่มีคาบสอนในวัน${getDayNameThai(currentSubDate)} — สามารถเพิ่มคาบด้วยตนเองได้ภายหลัง</div>`;
    return;
  }
  preview.innerHTML=`<div style="margin-bottom:6px;font-size:12px;font-weight:700;color:var(--pri)">📋 คาบสอนในวัน${getDayNameThai(currentSubDate)} (${periods.length} คาบ)</div>`+
    `<div style="background:#f7f9ff;border-radius:8px;border:1px solid var(--border);overflow:hidden">`+
    periods.map(p=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid #edf1f8;font-size:12px">
      <span class="period-pill" style="font-size:10px">${p.slotLabel}</span>
      <span style="color:var(--muted)">${p.slotTime}</span>
      <strong>${p.subject||'–'}</strong>
      <span class="badge b-blue" style="font-size:10px">${p.roomLabel}</span>
    </div>`).join('')+`</div>`;
}
function confirmAddAbsent(){
  const tid = document.getElementById('absentTeacherSel').value;
  if(!tid){ alert('กรุณาเลือกครู'); return; }
  const t = DB.teachers.find(x=>x.id===tid);
  const tName = t.prefix+t.first+' '+t.last;
  const type = document.getElementById('absentType').value;
  const note = document.getElementById('absentNote').value.trim();
  const schedDay = mapDayNameToSched(currentSubDate);
  // collect periods
  const periods = [];
  DB.rooms.forEach(room=>{
    DB.slots.forEach(slot=>{
      const k = room.id+'_'+slot.id+'_'+schedDay;
      const cv = DB.sched[k];
      if(cv && cv.teacher===tName){
        periods.push({slotId:slot.id,day:schedDay,roomId:room.id,
          subject:cv.subject,subTeacher:'',subNote:''});
      }
    });
  });
  getSubDay(currentSubDate).absentList.push({teacherId:tid,type,note,periods});
  closeModal('modalAbsent');
  renderSubContent(); markDirty();
  toast('✅ บันทึกครูที่ลาแล้ว'+' ('+periods.length+' คาบ)','succ');
}

// ── Add manual period ──────────────────────
function addManualPeriod(ai){
  const slotSel = DB.slots.map(s=>`<option value="${s.id}">${s.label} (${s.start}–${s.end})</option>`).join('');
  const roomSel = DB.rooms.map(r=>`<option value="${r.id}">${r.label}</option>`).join('');
  const subjSel = DB.subjects.map(s=>`<option value="${s.name}">${subjectOptionLabel(s)}</option>`).join('');
  const html = `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end;padding:10px 16px;background:#fffde7;border-top:1px dashed #ffe082" id="manualPeriodForm${ai}">
    <div class="fg"><label style="font-size:11px">คาบ</label><select id="mpSlot${ai}" style="padding:5px 8px;font-size:12px;border:1px solid var(--border);border-radius:5px">${slotSel}</select></div>
    <div class="fg"><label style="font-size:11px">ห้อง</label><select id="mpRoom${ai}" style="padding:5px 8px;font-size:12px;border:1px solid var(--border);border-radius:5px"><option value="">–</option>${roomSel}</select></div>
    <div class="fg"><label style="font-size:11px">วิชา</label><select id="mpSubj${ai}" style="padding:5px 8px;font-size:12px;border:1px solid var(--border);border-radius:5px"><option value="">–</option>${subjSel}</select></div>
    <button class="btn btn-succ btn-xs" onclick="saveManualPeriod(${ai})">✅ เพิ่ม</button>
    <button class="btn btn-ghost btn-xs" onclick="this.closest('#manualPeriodForm${ai}').remove()">ยกเลิก</button>
  </div>`;
  const cards = document.querySelectorAll('.absent-card');
  if(cards[ai]){
    const addBtn = cards[ai].querySelector('.btn-out.btn-xs');
    if(addBtn) addBtn.closest('div').insertAdjacentHTML('beforebegin', html);
  }
}
function saveManualPeriod(ai){
  const slotId = document.getElementById('mpSlot'+ai).value;
  const roomId = document.getElementById('mpRoom'+ai).value;
  const subject= document.getElementById('mpSubj'+ai).value;
  const schedDay = mapDayNameToSched(currentSubDate);
  getSubDay(currentSubDate).absentList[ai].periods.push(
    {slotId:+slotId, day:schedDay, roomId, subject, subTeacher:'', subNote:''});
  renderSubContent(); markDirty();
}

// ── History page ───────────────────────────
function renderSubHistoryPage(){
  renderSubSemesterReport();
  const el = document.getElementById('subHistoryContent'); if(!el) return;
  const sub = DB.substitute || {};
  const dates = Object.keys(sub).filter(function(d){
    var day=sub[d];
    return !!(day && Array.isArray(day.absentList) && day.absentList.length);
  }).sort().reverse();
  if(!dates.length){
    el.innerHTML='<div class="empty-state"><div class="empty-icon">📂</div><div class="empty-text">ยังไม่มีประวัติการสอนแทน</div></div>';
    return;
  }
  el.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>วันที่</th><th>วัน</th><th>ครูที่ลา</th><th>คาบทั้งหมด</th><th>มอบหมายแล้ว</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>'+
    dates.map(d=>{
      const day = sub[d];
      const absent = day.absentList.filter(a=>!a.manualOnly).length;
      const total = day.absentList.reduce((s,a)=>s+a.periods.length,0);
      const assigned = day.absentList.reduce((s,a)=>s+a.periods.filter(p=>p.subTeacher).length,0);
      const done = total>0&&assigned===total;
      const partial = assigned>0&&assigned<total;
      const dateDisp = formatDateThai(d);
      return`<tr>
        <td><strong>${d}</strong></td>
        <td>${getDayNameThai(d)}</td>
        <td>${absent} คน</td>
        <td>${total} คาบ</td>
        <td>${assigned} คาบ</td>
        <td>${done?'<span class="badge b-green">✅ ครบ</span>':partial?'<span class="badge b-yellow">⏳ บางส่วน</span>':total===0?'<span class="badge" style="background:#f3f4f6;color:#6b7280">ไม่มีคาบ</span>':'<span class="badge b-red">❌ ยังไม่มอบหมาย</span>'}</td>
        <td style="display:flex;gap:4px">
          <button class="btn btn-pri btn-xs" onclick="openHistoryDate('${d}')">✏️ แก้ไข</button>
          <button class="btn btn-gold btn-xs" onclick="exportSubDocxByDate('${d}')">📄 พิมพ์</button>
          <button class="btn btn-danger btn-xs" onclick="deleteSubHistory('${d}')">🗑️</button>
        </td>
      </tr>`;
    }).join('')+'</tbody></table></div>';
}
function openHistoryDate(dateStr){
  currentSubDate = dateStr;
  document.getElementById('subDate').value = dateStr;
  nav('substitute');
  loadSubstituteDay();
}
function deleteSubHistory(dateStr){
  if(!confirm('ลบประวัติการสอนแทนวันที่ '+dateStr+'?')) return;
  delete DB.substitute[dateStr];
  renderSubHistoryPage(); markDirty();
}

// ── Export substitute docx ─────────────────
async function exportSubstituteDocx(){
  if(!currentSubDate){ toast('⚠️ กรุณาเลือกวันที่ก่อน','warn'); return; }
  await exportSubDocxByDate(currentSubDate);
}
async function exportSubDocxByDate(dateStr){
  if(!window.docx||!window.saveAs){ toast('❌ ไลบรารียังไม่โหลด','err'); return; }
  const day = getSubDay(dateStr);
  if(!day.absentList.length){ toast('⚠️ ไม่มีข้อมูลการลาในวันนี้','warn'); return; }
  toast('⏳ กำลังสร้างไฟล์...','info');
  try{
    await buildSubstituteDocx(dateStr, day);
    toast('✅ ดาวน์โหลดตารางสอนแทนแล้ว','succ');
  }catch(e){ toast('❌ '+e.message,'err'); }
}
async function buildSubstituteDocx(dateStr, day){
  const logo=await getRequiredExportLogo();
  const model=SubstituteReport.model(DB,dateStr,day);
  const document=SubstituteReport.word(model,window.docx,{data:await logoToArrayBuffer(logo),type:logoMimeToType(logo)});
  dlBlob(await window.docx.Packer.toBlob(document),'ตารางสอนแทน_'+dateStr+'_'+(DB.school.name||'โรงเรียน')+'.docx');
}

// ════════════════════════════════════════════
//  BOOTSTRAP
// ════════════════════════════════════════════

// ════════════════════════════════════════════
//  SETUP WIZARD (PRIMARY SCHOOL)
// ════════════════════════════════════════════
let wzStep = 1;
const WZ_TOTAL = 5;
// temp data collected by wizard
let wzData = {
  schoolName:'', address:'', year:'2568', semester:'1',
  acadName:'', acadPos:'', principalName:'', principalPos:'',
  grades:[], rooms:{}, // grade→rooms e.g. {'ป.1':['1','2']}
  selectedSubjects:[], // names
  slotsPreset:'standard', customDays:['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์'],
};

function showWizard(){
  wzStep=1; wzData={schoolName:'',address:'',year:'2568',semester:'1',
    acadName:'',acadPos:'',principalName:'',principalPos:'',
    grades:[],rooms:{},selectedSubjects:[],slotsPreset:'standard',
    customDays:['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์']};
  document.getElementById('setupWizard').style.display='flex';
  renderWzStep();
}
function hideWizard(){ document.getElementById('setupWizard').style.display='none'; }

function wzUpdateDots(){
  for(let i=1;i<=WZ_TOTAL;i++){
    const d=document.getElementById('wd'+i);
    if(!d) continue;
    d.className='wz-dot'+(i<wzStep?' done':i===wzStep?' active':'');
    d.textContent=i<wzStep?'✓':String(i);
  }
  document.getElementById('wzProgress').textContent='ขั้นที่ '+wzStep+' / '+WZ_TOTAL;
  document.getElementById('wzBack').style.opacity=wzStep===1?'0':'1';
  document.getElementById('wzBack').disabled=wzStep===1;
  document.getElementById('wzNext').textContent=wzStep===WZ_TOTAL?'🚀 เริ่มใช้งาน!':'ถัดไป ›';
}

function renderWzStep(){
  wzUpdateDots();
  const body=document.getElementById('wzBody');
  if(wzStep===1) body.innerHTML=wzStep1();
  else if(wzStep===2) body.innerHTML=wzStep2();
  else if(wzStep===3) body.innerHTML=wzStep3();
  else if(wzStep===4) body.innerHTML=wzStep4();
  else if(wzStep===5) body.innerHTML=wzStep5();
  // bind events per step
  if(wzStep===2) bindWzStep2();
  if(wzStep===3) bindWzStep3();
  if(wzStep===4) bindWzStep4();
}

// ── Step 1: ข้อมูลโรงเรียน ──────────────────
function wzStep1(){
  return`<div class="wz-section">
    <div class="wz-section-title">🏫 ข้อมูลโรงเรียน</div>
    <div class="fgrid">
      <div class="fg s2"><label>ชื่อโรงเรียน <span class="req">*</span></label>
        <input type="text" id="wz_name" value="${wzData.schoolName}" placeholder="เช่น โรงเรียนบ้านนาดี" style="font-size:15px"></div>
      <div class="fg s2"><label>ที่อยู่</label>
        <textarea id="wz_addr" placeholder="ที่อยู่ / ตำบล / อำเภอ / จังหวัด" rows="2">${wzData.address}</textarea></div>
      <div class="fg"><label>ปีการศึกษา</label>
        <input type="text" id="wz_year" value="${wzData.year}" placeholder="2568"></div>
      <div class="fg"><label>ภาคเรียน</label>
        <select id="wz_sem">
          <option value="1" ${wzData.semester==='1'?'selected':''}>ภาคเรียนที่ 1</option>
          <option value="2" ${wzData.semester==='2'?'selected':''}>ภาคเรียนที่ 2</option>
        </select></div>
      <div class="fg"><label>ครูวิชาการ / หัวหน้าฝ่ายวิชาการ</label>
        <input type="text" id="wz_acad" value="${wzData.acadName}" placeholder="ชื่อ-นามสกุล"></div>
      <div class="fg"><label>ตำแหน่ง/วิทยฐานะ</label>
        <input type="text" id="wz_acadpos" value="${wzData.acadPos}" placeholder="เช่น ครู คศ.2"></div>
      <div class="fg"><label>ผู้อำนวยการโรงเรียน</label>
        <input type="text" id="wz_prin" value="${wzData.principalName}" placeholder="ชื่อ-นามสกุล"></div>
      <div class="fg"><label>ตำแหน่ง/วิทยฐานะ</label>
        <input type="text" id="wz_prinpos" value="${wzData.principalPos}" placeholder="เช่น ผอ. คศ.3"></div>
    </div>
  </div>`;
}
function wzSave1(){
  const n=document.getElementById('wz_name').value.trim();
  if(!n){alert('กรุณากรอกชื่อโรงเรียน');return false;}
  wzData.schoolName=n;
  wzData.address=document.getElementById('wz_addr').value.trim();
  wzData.year=document.getElementById('wz_year').value.trim()||'2568';
  wzData.semester=document.getElementById('wz_sem').value;
  wzData.acadName=document.getElementById('wz_acad').value.trim();
  wzData.acadPos=document.getElementById('wz_acadpos').value.trim();
  wzData.principalName=document.getElementById('wz_prin').value.trim();
  wzData.principalPos=document.getElementById('wz_prinpos').value.trim();
  return true;
}

// ── Step 2: ห้องเรียน ──────────────────────
const PRIMARY_GRADES=['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];
function wzStep2(){
  return`<div class="wz-section">
    <div class="wz-section-title">🚪 ห้องเรียน — เลือกชั้นที่มีในโรงเรียน</div>
    <div class="grade-pick-grid" id="wzGradeGrid">
      ${PRIMARY_GRADES.map(g=>`
        <div class="grade-pick-btn${wzData.grades.includes(g)?' on':''}" onclick="wzToggleGrade('${g}')" id="gpBtn_${g.replace('.','_')}">
          <div class="gp-grade">${g}</div>
          <div class="gp-label">${g.startsWith('ม.')?'ม.'+g.replace('ม.','')+(parseInt(g.replace('ม.',''))>3?' (ม.ปลาย)':' (ม.ต้น)'):g}</div>
          <div id="gpRoomCount_${g.replace('.','_')}" style="font-size:11px;color:var(--gold);margin-top:4px">
            ${wzData.grades.includes(g)?(wzData.rooms[g]||['1']).length+' ห้อง':''}</div>
        </div>`).join('')}
    </div>
    <div id="wzRoomSetup" style="margin-top:16px"></div>
    <div class="alert a-info" style="margin-top:12px;margin-bottom:0">💡 กดชั้นที่ต้องการ แล้วระบุจำนวนห้อง เช่น ป.1 มี 3 ห้องเรียน</div>
  </div>`;
}
function bindWzStep2(){
  renderWzRoomSetup();
}
function wzToggleGrade(g){
  const btn=document.getElementById('gpBtn_'+g.replace('.','_'));
  if(wzData.grades.includes(g)){
    wzData.grades=wzData.grades.filter(x=>x!==g);
    delete wzData.rooms[g];
    if(btn){btn.classList.remove('on');}
  } else {
    wzData.grades.push(g);
    if(!wzData.rooms[g]) wzData.rooms[g]=['1'];
    if(btn){btn.classList.add('on');}
  }
  renderWzRoomSetup();
  // update badge
  const bc=document.getElementById('gpRoomCount_'+g.replace('.','_'));
  if(bc) bc.textContent=wzData.grades.includes(g)?(wzData.rooms[g]||[]).length+' ห้อง':'';
}
function renderWzRoomSetup(){
  const el=document.getElementById('wzRoomSetup');if(!el)return;
  if(!wzData.grades.length){el.innerHTML='';return;}
  el.innerHTML='<div style="font-size:13px;font-weight:700;color:var(--pri);margin-bottom:8px">จำนวนห้องเรียนแต่ละชั้น</div>'+
    '<div style="display:flex;flex-direction:column;gap:8px">'+
    wzData.grades.map(g=>`
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f7f9ff;border:1px solid var(--border);border-radius:8px">
        <span style="font-weight:800;color:var(--pri);min-width:40px">${g}</span>
        <span style="font-size:12px;color:var(--muted)">จำนวนห้อง:</span>
        <input type="number" min="1" max="10" value="${(wzData.rooms[g]||[]).length||1}"
          id="roomCnt_${g.replace('.','_')}"
          style="width:64px;padding:5px 8px;font-size:14px;font-weight:700;text-align:center;border:1.5px solid var(--border);border-radius:6px"
          oninput="wzUpdateRoomCount('${g}',this.value)">
        <span style="font-size:12px;color:var(--muted)">ห้อง</span>
        <span style="font-size:12px;color:var(--muted);margin-left:4px">(${(wzData.rooms[g]||[]).map((_,i)=>g+'/'+(i+1)).join(', ')})</span>
      </div>`).join('')+
    '</div>';
}
function wzUpdateRoomCount(g,val){
  const n=Math.max(1,Math.min(10,parseInt(val)||1));
  wzData.rooms[g]=Array.from({length:n},(_,i)=>String(i+1));
  // update badge
  const bc=document.getElementById('gpRoomCount_'+g.replace('.','_'));
  if(bc) bc.textContent=n+' ห้อง';
}

// ── Step 3: วิชาเรียน ───────────────────────
function wzStep3(){
  const all=PRIMARY_SUBJECTS_FULL;
  return`<div class="wz-section">
    <div class="wz-section-title">📚 วิชาเรียน — เลือกวิชาที่ใช้ในโรงเรียน</div>
    <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <button class="btn btn-pri btn-sm" onclick="wzSelectAllSubjects()">✅ เลือกทั้งหมด</button>
      <button class="btn btn-ghost btn-sm" onclick="wzClearSubjects()">ล้างทั้งหมด</button>
    </div>
    <div class="subj-preset-grid" id="wzSubjGrid">
      ${all.map(s=>`
        <div class="subj-preset-chip${wzData.selectedSubjects.includes(s.name)?' on':''}"
          onclick="wzToggleSubject('${s.name.replace(/'/,"\\'")}','${s.color}')"
          id="sc_${all.indexOf(s)}">
          <div class="sc" style="background:${s.color}"></div>${s.name}
          <span style="font-size:10px;color:var(--muted);margin-left:2px">${s.hours}ชม</span>
        </div>`).join('')}
    </div>
    <div style="margin-top:12px">
      <label style="font-size:12px;font-weight:700;color:var(--pri)">+ เพิ่มวิชาพิเศษเอง</label>
      <div style="display:flex;gap:6px;margin-top:4px">
        <input type="text" id="wzCustomSubj" placeholder="ชื่อวิชา..." style="flex:1;padding:7px 10px;font-size:13px">
        <button class="btn btn-out btn-sm" onclick="wzAddCustomSubject()">+ เพิ่ม</button>
      </div>
    </div>
  </div>`;
}
function bindWzStep3(){
  // pre-select all if nothing selected yet
  if(!wzData.selectedSubjects.length) wzSelectAllSubjects();
}
function wzToggleSubject(name,color){
  const idx=wzData.selectedSubjects.indexOf(name);
  if(idx>=0) wzData.selectedSubjects.splice(idx,1);
  else wzData.selectedSubjects.push(name);
  // update chip UI
  const chips=document.querySelectorAll('.subj-preset-chip');
  chips.forEach(ch=>{
    const chipName=ch.textContent.trim().replace(/\d+ชม/,'').trim();
    ch.classList.toggle('on', wzData.selectedSubjects.includes(chipName));
  });
}
function wzSelectAllSubjects(){
  wzData.selectedSubjects=PRIMARY_SUBJECTS_FULL.map(s=>s.name);
  document.querySelectorAll('.subj-preset-chip').forEach(ch=>ch.classList.add('on'));
}
function wzClearSubjects(){
  wzData.selectedSubjects=[];
  document.querySelectorAll('.subj-preset-chip').forEach(ch=>ch.classList.remove('on'));
}
function wzAddCustomSubject(){
  const el=document.getElementById('wzCustomSubj');
  const name=(el.value||'').trim(); if(!name)return;
  if(!wzData.selectedSubjects.includes(name)) wzData.selectedSubjects.push(name);
  const grid=document.getElementById('wzSubjGrid');
  if(grid){
    const chip=document.createElement('div');
    chip.className='subj-preset-chip on';
    chip.innerHTML=`<div class="sc" style="background:#e0e7ff"></div>${name}`;
    chip.onclick=()=>wzToggleSubject(name,'#e0e7ff');
    grid.appendChild(chip);
  }
  el.value='';
}

// ── Step 4: คาบ & วัน ──────────────────────
const SLOT_PRESETS={
  standard:{label:'มาตรฐาน 8 คาบ',slots:DEF_SLOTS},
  short:{label:'6 คาบ (ช่วงสั้น)',slots:[
    {id:1,label:'คาบที่ 1',start:'08:00',end:'09:00'},
    {id:2,label:'คาบที่ 2',start:'09:00',end:'10:00'},
    {id:3,label:'คาบที่ 3',start:'10:00',end:'11:00'},
    {id:4,label:'คาบที่ 4',start:'11:00',end:'12:00'},
    {id:5,label:'คาบที่ 5',start:'13:00',end:'14:00'},
    {id:6,label:'คาบที่ 6',start:'14:00',end:'15:00'},
  ]},
  half:{label:'4 คาบ (ครึ่งวัน)',slots:[
    {id:1,label:'คาบที่ 1',start:'08:30',end:'09:30'},
    {id:2,label:'คาบที่ 2',start:'09:30',end:'10:30'},
    {id:3,label:'คาบที่ 3',start:'10:30',end:'11:30'},
    {id:4,label:'คาบที่ 4',start:'11:30',end:'12:30'},
  ]},
};
function wzStep4(){
  return`<div class="wz-section">
    <div class="wz-section-title">⏰ คาบเรียนและวันเรียน</div>
    <div style="margin-bottom:14px">
      <label style="font-size:12px;font-weight:700;color:var(--pri);display:block;margin-bottom:6px">รูปแบบคาบเรียน</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.entries(SLOT_PRESETS).map(([k,v])=>`
          <div class="grade-pick-btn${wzData.slotsPreset===k?' on':''}" style="min-width:150px"
            onclick="wzPickSlot('${k}')" id="slotPick_${k}">
            <div class="gp-grade" style="font-size:14px">${v.label}</div>
            <div class="gp-label">${v.slots.length} คาบ/วัน</div>
          </div>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:14px">
      <label style="font-size:12px;font-weight:700;color:var(--pri);display:block;margin-bottom:6px">วันเรียน</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'].map(d=>`
          <div class="rtab${wzData.customDays.includes(d)?' active':''}" onclick="wzToggleDay('${d}')"
            id="wzDay_${d}">${d}</div>`).join('')}
      </div>
    </div>
    <div style="background:#f5f8ff;border-radius:8px;border:1px solid var(--border);padding:12px;max-height:200px;overflow-y:auto">
      <div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:6px">ตัวอย่างคาบที่เลือก</div>
      <div id="wzSlotPreview"></div>
    </div>
  </div>`;
}
function bindWzStep4(){ renderWzSlotPreview(); }
function wzPickSlot(key){
  wzData.slotsPreset=key;
  document.querySelectorAll('[id^="slotPick_"]').forEach(el=>{
    el.classList.toggle('on', el.id==='slotPick_'+key);
  });
  renderWzSlotPreview();
}
function wzToggleDay(d){
  if(wzData.customDays.includes(d)){
    if(wzData.customDays.length<=1){toast('⚠️ ต้องมีอย่างน้อย 1 วัน','warn');return;}
    wzData.customDays=wzData.customDays.filter(x=>x!==d);
  } else {
    wzData.customDays.push(d);
  }
  const el=document.getElementById('wzDay_'+d);
  if(el) el.classList.toggle('active', wzData.customDays.includes(d));
}
function renderWzSlotPreview(){
  const el=document.getElementById('wzSlotPreview');if(!el)return;
  const slots=SLOT_PRESETS[wzData.slotsPreset].slots;
  el.innerHTML=slots.map(s=>`<div style="display:flex;gap:8px;padding:4px 0;font-size:12px;border-bottom:1px solid #e8eef8">
    <span style="font-weight:700;color:var(--pri);min-width:55px">${s.label}</span>
    <span style="color:var(--muted)">${s.start} – ${s.end}</span>
  </div>`).join('');
}

// ── Step 5: เสร็จสิ้น ──────────────────────
function wzStep5(){
  const totalRooms=Object.values(wzData.rooms).reduce((s,arr)=>s+arr.length,0);
  return`<div style="text-align:center;padding:20px 0">
    <div style="font-size:56px;margin-bottom:12px">🎉</div>
    <div style="font-family:'Noto Serif Thai',serif;font-size:22px;font-weight:700;color:var(--pri);margin-bottom:6px">
      พร้อมแล้ว!</div>
    <div style="font-size:14px;color:var(--muted);margin-bottom:24px">ระบบจะสร้างข้อมูลเริ่มต้นให้โดยอัตโนมัติ</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:400px;margin:0 auto 20px">
      <div class="sum-box s1" style="min-width:0">
        <div class="sum-num">${wzData.grades.length}</div>
        <div class="sum-lbl">ระดับชั้น (${wzData.grades.join(', ')||'–'})</div></div>
      <div class="sum-box s3" style="min-width:0">
        <div class="sum-num">${totalRooms}</div>
        <div class="sum-lbl">ห้องเรียนทั้งหมด</div></div>
      <div class="sum-box s2" style="min-width:0">
        <div class="sum-num">${wzData.selectedSubjects.length}</div>
        <div class="sum-lbl">วิชาที่เลือก</div></div>
      <div class="sum-box" style="min-width:0;border-color:var(--pri2)">
        <div class="sum-num">${SLOT_PRESETS[wzData.slotsPreset].slots.length}</div>
        <div class="sum-lbl">คาบ/วัน (${wzData.customDays.length} วัน)</div></div>
    </div>
    <div style="background:#e8f5e9;border-radius:10px;padding:14px;font-size:13px;color:#1b5e20;text-align:left;max-width:400px;margin:0 auto">
      <strong>โรงเรียน:</strong> ${wzData.schoolName}<br>
      <strong>ปีการศึกษา:</strong> ${wzData.year} ภาคเรียนที่ ${wzData.semester}<br>
      ${wzData.principalName?`<strong>ผู้อำนวยการ:</strong> ${wzData.principalName}<br>`:''}
      ${wzData.acadName?`<strong>ครูวิชาการ:</strong> ${wzData.acadName}`:''}
    </div>
  </div>`;
}

// ── Wizard nav ──────────────────────────────
function wzNext(){
  if(wzStep===1){ if(!wzSave1()) return; }
  else if(wzStep===2){ if(!wzData.grades.length){toast('⚠️ กรุณาเลือกอย่างน้อย 1 ชั้น','warn');return;} }
  else if(wzStep===3){ if(!wzData.selectedSubjects.length){toast('⚠️ กรุณาเลือกอย่างน้อย 1 วิชา','warn');return;} }
  if(wzStep===WZ_TOTAL){ wzApply(); return; }
  wzStep++;
  renderWzStep();
}
function wzPrev(){
  if(wzStep<=1)return;
  wzStep--;
  renderWzStep();
}

// ── Apply wizard data to DB ─────────────────
function wzApply(){
  // school
  DB.school={
    name:wzData.schoolName, address:wzData.address,
    year:wzData.year, semester:wzData.semester,
    acadName:wzData.acadName, acadPos:wzData.acadPos,
    principalName:wzData.principalName, principalPos:wzData.principalPos,
    logoDataUrl:'', logoSize:'medium'
  };
  // subjects
  DB.subjects=[];
  wzData.selectedSubjects.forEach(name=>{
    const preset=PRIMARY_SUBJECTS_FULL.find(s=>s.name===name);
    DB.subjects.push({
      id:uid(), name,
      code:preset?preset.code:'',
      dept:preset?preset.dept:'',
      hours:preset?preset.hours:1,
      color:preset?preset.color:COLORS[DB.subjects.length%COLORS.length]
    });
  });
  // rooms
  DB.rooms=[];
  PRIMARY_GRADES.forEach(g=>{
    if(!wzData.rooms[g]) return;
    let level;
    if(g.startsWith('อ.')) level='อนุบาล';
    else if(['ม.1','ม.2','ม.3'].includes(g)) level='มัธยมศึกษาตอนต้น';
    else if(['ม.4','ม.5','ม.6'].includes(g)) level='มัธยมศึกษาตอนปลาย';
    else level='ประถมศึกษา';
    wzData.rooms[g].forEach(roomNo=>{
      DB.rooms.push({id:uid(),level,grade:g,room:roomNo,
        homeroom:'',label:g+'/'+roomNo});
    });
  });
  // slots & days
  DB.slots=SLOT_PRESETS[wzData.slotsPreset].slots.map(s=>({...s}));
  DB.days=wzData.customDays.slice();
  DB.sched={};
  DB.substitute={};
  // save & refresh
  markDirty();
  hideWizard();
  renderAllUI();
  toast('🎉 ตั้งค่าโรงเรียนเสร็จสิ้น!','succ');
}

// ════════════════════════════════════════════
//  PRIMARY SCHOOL CURRICULUM CHECK
// ════════════════════════════════════════════
function renderCurriculumCheck(grade){
  let stdHours;
  if(['ม.1','ม.2','ม.3'].includes(grade)) stdHours=PRIMARY_STD_HOURS['ม.1'];
  else if(['ม.4','ม.5','ม.6'].includes(grade)) stdHours=PRIMARY_STD_HOURS['ม.4'];
  else stdHours=null;
  if(!stdHours) return '<div style="font-size:13px;color:var(--muted);padding:8px">ห้องพิเศษ — ไม่มีข้อมูลมาตรฐานหลักสูตร</div>';
  // count actual periods per subject across all rooms of this grade
  const gradeRooms=DB.rooms.filter(r=>r.grade===grade);
  const actualHours={};
  DB.subjects.forEach(s=>{ actualHours[s.name]=0; });
  gradeRooms.forEach(room=>{
    DB.slots.forEach(sl=>{
      DB.days.forEach(d=>{
        const cv=DB.sched[room.id+'_'+sl.id+'_'+d];
        if(cv&&cv.subject) actualHours[cv.subject]=(actualHours[cv.subject]||0)+1;
      });
    });
  });
  const rows=Object.entries(stdHours).map(([subj,std])=>{
    const actual=actualHours[subj]||0;
    const cls=actual===0?'curr-warn':actual<std?'curr-warn':actual>std*1.2?'curr-over':'curr-ok';
    const bar=Math.min(100,actual/std*100);
    return`<div class="curr-row">
      <span class="curr-subj">${subj}</span>
      <span class="curr-std">มาตรฐาน ${std} ชม.</span>
      <div style="flex:1;margin:0 10px">
        <div style="background:rgba(255,255,255,.15);border-radius:4px;height:6px">
          <div style="width:${bar}%;background:${actual>=std?'#69f070':'#ffd740'};height:6px;border-radius:4px;transition:width .3s"></div>
        </div>
      </div>
      <span class="curr-actual ${cls}">${actual}</span>
    </div>`;
  }).join('');
  return`<div class="curriculum-card">
    <div style="font-size:13px;font-weight:800;color:var(--gold2);margin-bottom:10px">
      📊 ตรวจสอบหลักสูตรแกนกลาง — ชั้น ${grade}
    </div>${rows}
    <div style="font-size:11px;opacity:.6;margin-top:8px">🟢 = ครบ  🟡 = ยังไม่ครบ/ไม่มีข้อมูล  🔴 = เกินมาตรฐาน</div>
  </div>`;
}

// ════════════════════════════════════════════
//  OVERRIDE renderDashboard for Primary
// ════════════════════════════════════════════
function renderDashboard(){
  updateSidebarCounts();
  renderDashboardAnnouncements();
  if(typeof applyAccessUI==='function') applyAccessUI();
}
function updateCurrCheck(){
  const g=document.getElementById('currGradeSel').value;
  const el=document.getElementById('dashCurrCheck'); if(!el) return;
  if(!g){ el.innerHTML='<div style="font-size:13px;color:var(--muted);padding:8px">เลือกชั้นเรียนเพื่อดูสรุป</div>'; return; }
  el.innerHTML=renderCurriculumCheck(g);
}


// ════════════════════════════════════════════
//  DEMO / SAMPLE DATA LOADER
// ════════════════════════════════════════════
function loadDemoData(){
  if(DB.teachers.length||DB.rooms.length){
    if(!confirm('มีข้อมูลอยู่แล้ว ต้องการแทนที่ด้วยข้อมูลตัวอย่างหรือไม่?')) return;
  }
  const tn=id=>{const t=DB.teachers.find(x=>x.id===id);return t?t.prefix+t.first+' '+t.last:'';};

  DB.school={name:'โรงเรียนนาดีวิทยา',
    address:'456 ถ.ราษฎร์พัฒนา ต.นาดี อ.เมือง จ.อุดรธานี 41000',
    year:'2568',semester:'1',
    acadName:'นายสมศักดิ์ ปัญญาดี',acadPos:'ครูชำนาญการ คศ.2',
    principalName:'นางสาวพรทิพย์ วิชาการ',principalPos:'ผู้อำนวยการโรงเรียน คศ.3',
    logoDataUrl:'',logoSize:'medium'};

  DB.subjects=[
    {id:'sj01',name:'ภาษาไทย',          code:'ท',dept:'ภาษาไทย',                        hours:4,color:'#DBEAFE'},
    {id:'sj02',name:'คณิตศาสตร์',        code:'ค',dept:'คณิตศาสตร์',                     hours:4,color:'#DCFCE7'},
    {id:'sj03',name:'วิทยาศาสตร์และเทคโนโลยี',code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี', hours:3,color:'#FEF3C7'},
    {id:'sj04',name:'ชีววิทยา',          code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:3,color:'#D1FAE5'},
    {id:'sj05',name:'เคมี',              code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:3,color:'#CFFAFE'},
    {id:'sj06',name:'ฟิสิกส์',           code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:3,color:'#E0F7FA'},
    {id:'sj07',name:'สังคมศึกษา',        code:'ส',dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:3,color:'#EDE9FE'},
    {id:'sj08',name:'ประวัติศาสตร์',     code:'ส',dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1,color:'#FDF4FF'},
    {id:'sj09',name:'ภาษาอังกฤษ',        code:'อ',dept:'ภาษาต่างประเทศ',                hours:4,color:'#FCE7F3'},
    {id:'sj10',name:'ภาษาจีน',           code:'จ',dept:'ภาษาต่างประเทศ',                hours:2,color:'#FFF9C4'},
    {id:'sj11',name:'สุขศึกษาและพลศึกษา',code:'พ',dept:'สุขศึกษาและพลศึกษา',           hours:2,color:'#D1FAE5'},
    {id:'sj12',name:'ทัศนศิลป์',         code:'ศ',dept:'ศิลปะ',                         hours:1,color:'#FEE2E2'},
    {id:'sj13',name:'ดนตรี',             code:'ศ',dept:'ศิลปะ',                         hours:1,color:'#FEF9C3'},
    {id:'sj14',name:'การงานอาชีพ',       code:'ง',dept:'การงานอาชีพ',                   hours:2,color:'#EFF6FF'},
    {id:'sj15',name:'วิทยาการคำนวณ',     code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:1,color:'#E0E7FF'},
    {id:'sj16',name:'กิจกรรมแนะแนว',    code:'กน',dept:'แนะแนว',                       hours:1,color:'#FFF8F0'},
    {id:'sj17',name:'ลูกเสือ-เนตรนารี', code:'ลส',dept:'กิจกรรมพัฒนาผู้เรียน',         hours:2,color:'#E0F2FE'},
    {id:'sj18',name:'ชุมนุม',            code:'ชม',dept:'กิจกรรมพัฒนาผู้เรียน',         hours:1,color:'#ECFDF5'},
    // ม.ปลาย เพิ่มเติม
    {id:'sj19',name:'คณิตศาสตร์เพิ่มเติม',code:'ค',dept:'คณิตศาสตร์',                  hours:4,color:'#BBF7D0'},
    {id:'sj20',name:'ชีววิทยาเพิ่มเติม', code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:4,color:'#A7F3D0'},
    {id:'sj21',name:'เคมีเพิ่มเติม',     code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:4,color:'#99F6E4'},
    {id:'sj22',name:'ฟิสิกส์เพิ่มเติม', code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',       hours:4,color:'#BAE6FD'},
    {id:'sj23',name:'ภาษาอังกฤษเพิ่มเติม',code:'อ',dept:'ภาษาต่างประเทศ',              hours:2,color:'#FDF2F8'},
    {id:'sj24',name:'แคลคูลัส',          code:'ค',dept:'คณิตศาสตร์',                    hours:2,color:'#D1FAE5'},
    {id:'sj25',name:'ยุวกาชาด',          code:'ยก',dept:'กิจกรรมพัฒนาผู้เรียน',         hours:1,color:'#FCE4EC'},
    {id:'sj26',name:'พระพุทธศาสนา',      code:'ส',dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', hours:1,color:'#FFF7ED'},
    {id:'sj27',name:'โลก ดาราศาสตร์ และอวกาศ',code:'ว',dept:'วิทยาศาสตร์และเทคโนโลยี',hours:2,color:'#E8F4FD'},
  ];

  DB.teachers=[
    // ── ม.ต้น ──
    {id:'tc01',prefix:'นาง',   first:'สมศรี',    last:'วิชาการ',   edu:'ค.บ.',  rank:'ครูชำนาญการพิเศษ',dept:'ภาษาไทย',                       phone:'0812341001',email:'somsri@nadee.ac.th',   note:'ครูที่ปรึกษา ม.1',    createdAt:1, subjects:['ภาษาไทย']},
    {id:'tc02',prefix:'นาย',   first:'ประสิทธิ์',last:'คณิตดี',    edu:'วท.บ.', rank:'ครู คศ.2',         dept:'คณิตศาสตร์',                    phone:'0812341002',email:'prasit@nadee.ac.th',   note:'ครูที่ปรึกษา ม.2',    createdAt:2, subjects:['คณิตศาสตร์','คณิตศาสตร์เพิ่มเติม','แคลคูลัส']},
    {id:'tc03',prefix:'นางสาว',first:'วิไล',     last:'วิทยา',     edu:'วท.ม.', rank:'ครู คศ.1',         dept:'วิทยาศาสตร์และเทคโนโลยี',       phone:'0812341003',email:'wilai@nadee.ac.th',    note:'ครูที่ปรึกษา ม.3',    createdAt:3, subjects:['ชีววิทยา','ชีววิทยาเพิ่มเติม','วิทยาศาสตร์และเทคโนโลยี']},
    {id:'tc04',prefix:'นาย',   first:'ธนากร',   last:'เพชรงาม',   edu:'วท.บ.', rank:'ครู คศ.2',         dept:'วิทยาศาสตร์และเทคโนโลยี',       phone:'0812341004',email:'thanakorn@nadee.ac.th',note:'',                    createdAt:4, subjects:['เคมี','เคมีเพิ่มเติม','ฟิสิกส์','ฟิสิกส์เพิ่มเติม']},
    {id:'tc05',prefix:'นางสาว',first:'นภา',      last:'ภาษาดี',    edu:'ศศ.บ.', rank:'ครู คศ.1',         dept:'ภาษาต่างประเทศ',                phone:'0812341005',email:'napa@nadee.ac.th',     note:'',                    createdAt:5, subjects:['ภาษาอังกฤษ','ภาษาอังกฤษเพิ่มเติม']},
    {id:'tc06',prefix:'นาย',   first:'ชัยวัฒน์',last:'สังคม',     edu:'ค.บ.',  rank:'ครู คศ.1',         dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', phone:'0812341006',email:'chaiwat@nadee.ac.th',  note:'',                    createdAt:6, subjects:['สังคมศึกษา','ประวัติศาสตร์','พระพุทธศาสนา']},
    {id:'tc07',prefix:'นาย',   first:'กิตติ',   last:'พลศึกษา',   edu:'พล.บ.', rank:'ครู คศ.1',         dept:'สุขศึกษาและพลศึกษา',            phone:'0812341007',email:'kitti@nadee.ac.th',    note:'',                    createdAt:7, subjects:['สุขศึกษาและพลศึกษา','ลูกเสือ-เนตรนารี','ยุวกาชาด']},
    {id:'tc08',prefix:'นาง',   first:'รัตนา',   last:'ศิลปกรรม',  edu:'ศศ.บ.', rank:'ครูชำนาญการ',      dept:'ศิลปะ',                         phone:'0812341008',email:'rattana@nadee.ac.th',  note:'',                    createdAt:8, subjects:['ทัศนศิลป์','ดนตรี']},
    {id:'tc09',prefix:'นางสาว',first:'จิราพร',  last:'งานอาชีพ',  edu:'ค.บ.',  rank:'ครูผู้ช่วย',        dept:'การงานอาชีพ',                   phone:'0812341009',email:'jiraporn@nadee.ac.th', note:'',                    createdAt:9, subjects:['การงานอาชีพ','กิจกรรมแนะแนว']},
    {id:'tc10',prefix:'นาย',   first:'สุรพงษ์', last:'คอมพิวเตอร์',edu:'วท.บ.',rank:'ครู คศ.1',         dept:'วิทยาศาสตร์และเทคโนโลยี',       phone:'0812341010',email:'surapong@nadee.ac.th', note:'',                    createdAt:10,subjects:['วิทยาการคำนวณ','โลก ดาราศาสตร์ และอวกาศ']},
    // ── ม.ปลาย เพิ่มเติม ──
    {id:'tc11',prefix:'นาง',   first:'เพ็ญพักตร์',last:'ภาษาไทย',edu:'กศ.ม.', rank:'ครูชำนาญการ',      dept:'ภาษาไทย',                       phone:'0812341011',email:'penpak@nadee.ac.th',   note:'ครูที่ปรึกษา ม.4',    createdAt:11,subjects:['ภาษาไทย']},
    {id:'tc12',prefix:'นาย',   first:'อนุชา',   last:'คณิตเพิ่ม', edu:'วท.ม.', rank:'ครู คศ.2',         dept:'คณิตศาสตร์',                    phone:'0812341012',email:'anucha@nadee.ac.th',   note:'ครูที่ปรึกษา ม.5 วิทย์',createdAt:12,subjects:['คณิตศาสตร์เพิ่มเติม','แคลคูลัส','สถิติ']},
    {id:'tc13',prefix:'นางสาว',first:'ธีรนุช',  last:'ภาษาจีน',   edu:'ศศ.บ.', rank:'ครูผู้ช่วย',        dept:'ภาษาต่างประเทศ',                phone:'0812341013',email:'theeranuch@nadee.ac.th',note:'ครูที่ปรึกษา ม.5 ภาษา',createdAt:13,subjects:['ภาษาจีน','ภาษาอังกฤษเพิ่มเติม']},
    {id:'tc14',prefix:'นาย',   first:'พงษ์ศักดิ์',last:'ดาราศาสตร์',edu:'วท.ม.',rank:'ครู คศ.1',        dept:'วิทยาศาสตร์และเทคโนโลยี',       phone:'0812341014',email:'phongsak@nadee.ac.th', note:'ครูที่ปรึกษา ม.6 วิทย์',createdAt:14,subjects:['โลก ดาราศาสตร์ และอวกาศ','ฟิสิกส์เพิ่มเติม']},
    {id:'tc15',prefix:'นาย',   first:'สมศักดิ์',last:'วิชาการ',   edu:'ค.บ.',  rank:'ครูชำนาญการ',      dept:'สังคมศึกษา ศาสนา และวัฒนธรรม', phone:'0812341015',email:'somsak@nadee.ac.th',   note:'ครูวิชาการ',          createdAt:15,subjects:['สังคมศึกษา','ประวัติศาสตร์']},
  ];

  // ── ROOMS: ม.1–ม.6 + 2 ห้องพิเศษ ────────────
  DB.rooms=[
    {id:'rm01',level:'มัธยมศึกษาตอนต้น',  grade:'ม.1',room:'1',homeroom:'tc01',label:'ม.1/1',planName:''},
    {id:'rm02',level:'มัธยมศึกษาตอนต้น',  grade:'ม.2',room:'1',homeroom:'tc02',label:'ม.2/1',planName:''},
    {id:'rm03',level:'มัธยมศึกษาตอนต้น',  grade:'ม.3',room:'1',homeroom:'tc03',label:'ม.3/1',planName:''},
    {id:'rm04',level:'มัธยมศึกษาตอนปลาย', grade:'ม.4',room:'วิทย์-คณิต',homeroom:'tc11',label:'ม.4/วิทย์-คณิต',planName:'วิทย์-คณิต'},
    {id:'rm05',level:'มัธยมศึกษาตอนปลาย', grade:'ม.4',room:'ศิลป์-ภาษา',homeroom:'tc13',label:'ม.4/ศิลป์-ภาษา',planName:'ศิลป์-ภาษา'},
    {id:'rm06',level:'มัธยมศึกษาตอนปลาย', grade:'ม.5',room:'วิทย์-คณิต',homeroom:'tc12',label:'ม.5/วิทย์-คณิต',planName:'วิทย์-คณิต'},
    {id:'rm07',level:'มัธยมศึกษาตอนปลาย', grade:'ม.5',room:'ศิลป์-ภาษา',homeroom:'tc13',label:'ม.5/ศิลป์-ภาษา',planName:'ศิลป์-ภาษา'},
    {id:'rm08',level:'มัธยมศึกษาตอนปลาย', grade:'ม.6',room:'วิทย์-คณิต',homeroom:'tc14',label:'ม.6/วิทย์-คณิต',planName:'วิทย์-คณิต'},
    {id:'rm09',level:'มัธยมศึกษาตอนปลาย', grade:'ม.6',room:'ศิลป์-ภาษา',homeroom:'tc11',label:'ม.6/ศิลป์-ภาษา',planName:'ศิลป์-ภาษา'},
    // ห้องพิเศษ
    {id:'rm10',level:'ห้องพิเศษ',grade:'ห้องพิเศษวิทย์-คณิต',room:'MEP',homeroom:'tc04',label:'ห้องพิเศษวิทย์-คณิต/MEP',planName:'MEP'},
    {id:'rm11',level:'ห้องพิเศษ',grade:'ห้องพิเศษภาษา',      room:'EIS',homeroom:'tc05',label:'ห้องพิเศษภาษา/EIS',planName:'EIS'},
  ];

  DB.slots=[
    {id:1,label:'คาบที่ 1',start:'08:00',end:'08:50'},
    {id:2,label:'คาบที่ 2',start:'08:50',end:'09:40'},
    {id:3,label:'คาบที่ 3',start:'09:50',end:'10:40'},
    {id:4,label:'คาบที่ 4',start:'10:40',end:'11:30'},
    {id:5,label:'คาบที่ 5',start:'11:30',end:'12:20'},
    {id:6,label:'คาบที่ 6',start:'13:10',end:'14:00'},
    {id:7,label:'คาบที่ 7',start:'14:00',end:'14:50'},
    {id:8,label:'คาบที่ 8',start:'14:50',end:'15:40'},
  ];
  DB.days=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์'];

  // ── SCHEDULE TEMPLATES ──────────────────────────────────────
  const SCHED={
    // ม.ต้น (ม.1-ม.3)
    lower:[
      [1,'จันทร์','ภาษาไทย','tc01'],       [1,'อังคาร','คณิตศาสตร์','tc02'],     [1,'พุธ','ภาษาไทย','tc01'],         [1,'พฤหัสบดี','ภาษาอังกฤษ','tc05'],   [1,'ศุกร์','ภาษาไทย','tc01'],
      [2,'จันทร์','คณิตศาสตร์','tc02'],    [2,'อังคาร','ภาษาไทย','tc01'],        [2,'พุธ','คณิตศาสตร์','tc02'],      [2,'พฤหัสบดี','ภาษาไทย','tc01'],      [2,'ศุกร์','คณิตศาสตร์','tc02'],
      [3,'จันทร์','ชีววิทยา','tc03'],      [3,'อังคาร','สังคมศึกษา','tc06'],     [3,'พุธ','ภาษาอังกฤษ','tc05'],      [3,'พฤหัสบดี','คณิตศาสตร์','tc02'],   [3,'ศุกร์','วิทยาศาสตร์และเทคโนโลยี','tc03'],
      [4,'จันทร์','ภาษาอังกฤษ','tc05'],    [4,'อังคาร','ภาษาอังกฤษ','tc05'],     [4,'พุธ','สังคมศึกษา','tc06'],       [4,'พฤหัสบดี','ชีววิทยา','tc03'],     [4,'ศุกร์','สังคมศึกษา','tc06'],
      [5,'จันทร์','เคมี','tc04'],           [5,'อังคาร','ฟิสิกส์','tc04'],         [5,'พุธ','เคมี','tc04'],             [5,'พฤหัสบดี','ฟิสิกส์','tc04'],      [5,'ศุกร์','ประวัติศาสตร์','tc06'],
      [6,'จันทร์','การงานอาชีพ','tc09'],   [6,'อังคาร','วิทยาการคำนวณ','tc10'], [6,'พุธ','ภาษาจีน','tc13'],          [6,'พฤหัสบดี','ทัศนศิลป์','tc08'],   [6,'ศุกร์','ภาษาอังกฤษ','tc05'],
      [7,'จันทร์','สุขศึกษาและพลศึกษา','tc07'],[7,'อังคาร','ดนตรี','tc08'],     [7,'พุธ','กิจกรรมแนะแนว','tc09'],   [7,'พฤหัสบดี','การงานอาชีพ','tc09'], [7,'ศุกร์','พระพุทธศาสนา','tc06'],
      [8,'จันทร์','ลูกเสือ-เนตรนารี','tc07'],[8,'อังคาร','ลูกเสือ-เนตรนารี','tc07'],[8,'พุธ','วิทยาการคำนวณ','tc10'],[8,'พฤหัสบดี','ชุมนุม','tc09'],     [8,'ศุกร์','ชุมนุม','tc09'],
    ],
    // ม.ปลาย วิทย์-คณิต
    upper_sci:[
      [1,'จันทร์','ภาษาไทย','tc11'],              [1,'อังคาร','คณิตศาสตร์เพิ่มเติม','tc12'],   [1,'พุธ','ภาษาไทย','tc11'],              [1,'พฤหัสบดี','ภาษาอังกฤษ','tc05'],           [1,'ศุกร์','ภาษาไทย','tc11'],
      [2,'จันทร์','คณิตศาสตร์เพิ่มเติม','tc12'], [2,'อังคาร','ภาษาไทย','tc11'],              [2,'พุธ','คณิตศาสตร์เพิ่มเติม','tc12'],  [2,'พฤหัสบดี','ภาษาไทย','tc11'],              [2,'ศุกร์','แคลคูลัส','tc12'],
      [3,'จันทร์','ชีววิทยาเพิ่มเติม','tc03'],   [3,'อังคาร','ชีววิทยาเพิ่มเติม','tc03'],    [3,'พุธ','เคมีเพิ่มเติม','tc04'],         [3,'พฤหัสบดี','เคมีเพิ่มเติม','tc04'],        [3,'ศุกร์','วิทยาศาสตร์และเทคโนโลยี','tc10'],
      [4,'จันทร์','ฟิสิกส์เพิ่มเติม','tc14'],    [4,'อังคาร','ฟิสิกส์เพิ่มเติม','tc14'],     [4,'พุธ','ภาษาอังกฤษ','tc05'],            [4,'พฤหัสบดี','ชีววิทยาเพิ่มเติม','tc03'],    [4,'ศุกร์','เคมีเพิ่มเติม','tc04'],
      [5,'จันทร์','สังคมศึกษา','tc15'],           [5,'อังคาร','โลก ดาราศาสตร์ และอวกาศ','tc14'],[5,'พุธ','สังคมศึกษา','tc15'],           [5,'พฤหัสบดี','ฟิสิกส์เพิ่มเติม','tc14'],     [5,'ศุกร์','สังคมศึกษา','tc15'],
      [6,'จันทร์','ภาษาอังกฤษเพิ่มเติม','tc05'],[6,'อังคาร','ภาษาอังกฤษ','tc05'],           [6,'พุธ','ประวัติศาสตร์','tc15'],          [6,'พฤหัสบดี','การงานอาชีพ','tc09'],          [6,'ศุกร์','กิจกรรมแนะแนว','tc09'],
      [7,'จันทร์','สุขศึกษาและพลศึกษา','tc07'], [7,'อังคาร','ทัศนศิลป์','tc08'],             [7,'พุธ','วิทยาการคำนวณ','tc10'],         [7,'พฤหัสบดี','ดนตรี','tc08'],                [7,'ศุกร์','พระพุทธศาสนา','tc06'],
      [8,'จันทร์','ยุวกาชาด','tc07'],            [8,'อังคาร','ยุวกาชาด','tc07'],              [8,'พุธ','ชุมนุม','tc09'],                [8,'พฤหัสบดี','ชุมนุม','tc09'],               [8,'ศุกร์','โลก ดาราศาสตร์ และอวกาศ','tc14'],
    ],
    // ม.ปลาย ศิลป์-ภาษา
    upper_art:[
      [1,'จันทร์','ภาษาไทย','tc11'],       [1,'อังคาร','คณิตศาสตร์','tc02'],          [1,'พุธ','ภาษาไทย','tc11'],         [1,'พฤหัสบดี','ภาษาอังกฤษ','tc05'],         [1,'ศุกร์','ภาษาไทย','tc11'],
      [2,'จันทร์','คณิตศาสตร์','tc02'],    [2,'อังคาร','ภาษาไทย','tc11'],             [2,'พุธ','คณิตศาสตร์','tc02'],      [2,'พฤหัสบดี','ภาษาไทย','tc11'],            [2,'ศุกร์','ภาษาอังกฤษ','tc05'],
      [3,'จันทร์','ภาษาอังกฤษเพิ่มเติม','tc05'],[3,'อังคาร','ภาษาจีน','tc13'],       [3,'พุธ','ภาษาอังกฤษเพิ่มเติม','tc05'],[3,'พฤหัสบดี','ภาษาจีน','tc13'],         [3,'ศุกร์','วิทยาศาสตร์และเทคโนโลยี','tc03'],
      [4,'จันทร์','ภาษาจีน','tc13'],       [4,'อังคาร','ภาษาอังกฤษ','tc05'],         [4,'พุธ','สังคมศึกษา','tc15'],       [4,'พฤหัสบดี','ภาษาอังกฤษเพิ่มเติม','tc05'],[4,'ศุกร์','สังคมศึกษา','tc15'],
      [5,'จันทร์','สังคมศึกษา','tc15'],    [5,'อังคาร','ประวัติศาสตร์','tc15'],       [5,'พุธ','ภาษาจีน','tc13'],         [5,'พฤหัสบดี','สังคมศึกษา','tc15'],         [5,'ศุกร์','ประวัติศาสตร์','tc15'],
      [6,'จันทร์','การงานอาชีพ','tc09'],   [6,'อังคาร','วิทยาการคำนวณ','tc10'],      [6,'พุธ','ภาษาอังกฤษ','tc05'],      [6,'พฤหัสบดี','การงานอาชีพ','tc09'],        [6,'ศุกร์','กิจกรรมแนะแนว','tc09'],
      [7,'จันทร์','สุขศึกษาและพลศึกษา','tc07'],[7,'อังคาร','ทัศนศิลป์','tc08'],     [7,'พุธ','ดนตรี','tc08'],            [7,'พฤหัสบดี','วิทยาการคำนวณ','tc10'],      [7,'ศุกร์','พระพุทธศาสนา','tc06'],
      [8,'จันทร์','ยุวกาชาด','tc07'],      [8,'อังคาร','ยุวกาชาด','tc07'],           [8,'พุธ','ชุมนุม','tc09'],           [8,'พฤหัสบดี','ชุมนุม','tc09'],             [8,'ศุกร์','ดนตรี','tc08'],
    ],
    // ห้องพิเศษ MEP (Math-English Program)
    special_mep:[
      [1,'จันทร์','คณิตศาสตร์เพิ่มเติม','tc12'],[1,'อังคาร','ชีววิทยาเพิ่มเติม','tc03'],[1,'พุธ','ภาษาไทย','tc11'],      [1,'พฤหัสบดี','ภาษาอังกฤษ','tc05'],         [1,'ศุกร์','คณิตศาสตร์เพิ่มเติม','tc12'],
      [2,'จันทร์','ภาษาอังกฤษเพิ่มเติม','tc05'],[2,'อังคาร','เคมีเพิ่มเติม','tc04'],  [2,'พุธ','คณิตศาสตร์เพิ่มเติม','tc12'],[2,'พฤหัสบดี','ภาษาไทย','tc11'],          [2,'ศุกร์','ชีววิทยาเพิ่มเติม','tc03'],
      [3,'จันทร์','ฟิสิกส์เพิ่มเติม','tc14'],   [3,'อังคาร','คณิตศาสตร์เพิ่มเติม','tc12'],[3,'พุธ','ภาษาอังกฤษเพิ่มเติม','tc05'],[3,'พฤหัสบดี','เคมีเพิ่มเติม','tc04'],[3,'ศุกร์','ฟิสิกส์เพิ่มเติม','tc14'],
      [4,'จันทร์','แคลคูลัส','tc12'],            [4,'อังคาร','ฟิสิกส์เพิ่มเติม','tc14'], [4,'พุธ','ชีววิทยาเพิ่มเติม','tc03'],  [4,'พฤหัสบดี','ฟิสิกส์เพิ่มเติม','tc14'],  [4,'ศุกร์','เคมีเพิ่มเติม','tc04'],
      [5,'จันทร์','สังคมศึกษา','tc15'],          [5,'อังคาร','สังคมศึกษา','tc15'],        [5,'พุธ','สังคมศึกษา','tc15'],         [5,'พฤหัสบดี','ประวัติศาสตร์','tc15'],       [5,'ศุกร์','โลก ดาราศาสตร์ และอวกาศ','tc14'],
      [6,'จันทร์','ภาษาอังกฤษ','tc05'],         [6,'อังคาร','ภาษาอังกฤษ','tc05'],        [6,'พุธ','ภาษาอังกฤษเพิ่มเติม','tc05'],[6,'พฤหัสบดี','วิทยาการคำนวณ','tc10'],     [6,'ศุกร์','กิจกรรมแนะแนว','tc09'],
      [7,'จันทร์','สุขศึกษาและพลศึกษา','tc07'],[7,'อังคาร','ทัศนศิลป์','tc08'],        [7,'พุธ','ดนตรี','tc08'],              [7,'พฤหัสบดี','การงานอาชีพ','tc09'],        [7,'ศุกร์','พระพุทธศาสนา','tc06'],
      [8,'จันทร์','ยุวกาชาด','tc07'],           [8,'อังคาร','ยุวกาชาด','tc07'],          [8,'พุธ','ชุมนุม','tc09'],             [8,'พฤหัสบดี','ชุมนุม','tc09'],             [8,'ศุกร์','แคลคูลัส','tc12'],
    ],
    // ห้องพิเศษ EIS (English Intensive)
    special_eis:[
      [1,'จันทร์','ภาษาอังกฤษเพิ่มเติม','tc05'],[1,'อังคาร','ภาษาอังกฤษ','tc05'],  [1,'พุธ','ภาษาอังกฤษเพิ่มเติม','tc05'],[1,'พฤหัสบดี','ภาษาอังกฤษ','tc05'],       [1,'ศุกร์','ภาษาอังกฤษเพิ่มเติม','tc05'],
      [2,'จันทร์','ภาษาไทย','tc11'],           [2,'อังคาร','ภาษาไทย','tc11'],       [2,'พุธ','ภาษาไทย','tc11'],            [2,'พฤหัสบดี','ภาษาไทย','tc11'],           [2,'ศุกร์','ภาษาไทย','tc11'],
      [3,'จันทร์','ภาษาจีน','tc13'],           [3,'อังคาร','ภาษาจีน','tc13'],       [3,'พุธ','คณิตศาสตร์','tc02'],         [3,'พฤหัสบดี','ภาษาจีน','tc13'],           [3,'ศุกร์','คณิตศาสตร์','tc02'],
      [4,'จันทร์','คณิตศาสตร์','tc02'],        [4,'อังคาร','สังคมศึกษา','tc15'],    [4,'พุธ','สังคมศึกษา','tc15'],         [4,'พฤหัสบดี','สังคมศึกษา','tc15'],        [4,'ศุกร์','สังคมศึกษา','tc15'],
      [5,'จันทร์','วิทยาศาสตร์และเทคโนโลยี','tc03'],[5,'อังคาร','วิทยาศาสตร์และเทคโนโลยี','tc03'],[5,'พุธ','ประวัติศาสตร์','tc15'],[5,'พฤหัสบดี','วิทยาการคำนวณ','tc10'],[5,'ศุกร์','ประวัติศาสตร์','tc15'],
      [6,'จันทร์','การงานอาชีพ','tc09'],       [6,'อังคาร','ดนตรี','tc08'],          [6,'พุธ','ทัศนศิลป์','tc08'],          [6,'พฤหัสบดี','การงานอาชีพ','tc09'],       [6,'ศุกร์','กิจกรรมแนะแนว','tc09'],
      [7,'จันทร์','สุขศึกษาและพลศึกษา','tc07'],[7,'อังคาร','สุขศึกษาและพลศึกษา','tc07'],[7,'พุธ','ภาษาจีน','tc13'],       [7,'พฤหัสบดี','ภาษาอังกฤษเพิ่มเติม','tc05'],[7,'ศุกร์','พระพุทธศาสนา','tc06'],
      [8,'จันทร์','ยุวกาชาด','tc07'],          [8,'อังคาร','ยุวกาชาด','tc07'],       [8,'พุธ','ชุมนุม','tc09'],             [8,'พฤหัสบดี','ชุมนุม','tc09'],            [8,'ศุกร์','วิทยาการคำนวณ','tc10'],
    ],
  };

  // ── Fill sched ──────────────────────────────────────
  DB.sched={};
  DB.rooms.forEach(room=>{
    let tmpl;
    if(room.id==='rm10') tmpl=SCHED.special_mep;
    else if(room.id==='rm11') tmpl=SCHED.special_eis;
    else if(['ม.1','ม.2','ม.3'].includes(room.grade)) tmpl=SCHED.lower;
    else tmpl=room.planName==='ศิลป์-ภาษา'?SCHED.upper_art:SCHED.upper_sci;
    tmpl.forEach(([slotId,day,subj,tId])=>{
      DB.sched[room.id+'_'+slotId+'_'+day]={subject:subj,teacher:tn(tId)};
    });
  });

  // ── Sample absent teacher today ──────────────────────
  const today=new Date();
  const dayMap={1:'จันทร์',2:'อังคาร',3:'พุธ',4:'พฤหัสบดี',5:'ศุกร์'};
  const y=today.getFullYear(),m=String(today.getMonth()+1).padStart(2,'0'),d=String(today.getDate()).padStart(2,'0');
  const todayStr=y+'-'+m+'-'+d;
  DB.substitute={};
  if(today.getDay()>=1&&today.getDay()<=5){
    const todaySched=dayMap[today.getDay()];
    const absentName='นางสาววิไล วิทยา';
    const periods=[];
    DB.rooms.forEach(room=>{
      DB.slots.forEach(sl=>{
        const k=room.id+'_'+sl.id+'_'+todaySched;
        const cv=DB.sched[k];
        if(cv&&cv.teacher===absentName)
          periods.push({slotId:sl.id,day:todaySched,roomId:room.id,subject:cv.subject,subTeacher:'',subNote:''});
      });
    });
    if(periods[0]) periods[0].subTeacher='นายธนากร เพชรงาม';
    DB.substitute[todayStr]={absentList:[{teacherId:'tc03',type:'ลาป่วย',note:'ไข้หวัด',periods}]};
  }

  DB.substitute=DB.substitute||{};
  markDirty();
  renderAllUI();
  toast('🎉 โหลดข้อมูลตัวอย่าง: 11 ห้อง (ม.1–ม.6 + ห้องพิเศษ MEP/EIS) · 15 ครู · 27 วิชา','succ');
  nav('dashboard');
}

(function init(){
  document.querySelectorAll('.modal-bg').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m) m.classList.remove('open');});
  });
  DB=emptyDB();
  setSaveInd('saved','พร้อมใช้งาน');
  updateTopbar();
  updateSidebarCounts();
  renderDashboard();
})();

