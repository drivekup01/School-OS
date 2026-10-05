// School-OS Leave API — SEPARATE from the main School-OS backend.
// Data source: ระบบใบลาออนไลน์
const LEAVE_SPREADSHEET_ID = '1KA8ch40D0iFHN1nYNcgadWTQbxehEiyKtOdcivRupW0';

function doGet(e) {
  try {
    const p=(e&&e.parameter)||{};
    const action=String(p.action||'health');
    if(action==='health') return leaveJson_({ok:true,service:'School-OS Leave API'});
    if(action==='teacherLeave') return teacherLeave_(p);
    return leaveJson_({ok:false,error:'Unknown action'});
  } catch(err) {
    return leaveJson_({ok:false,error:String(err&&err.message?err.message:err)});
  }
}

function teacherLeave_(p) {
  const selected=parseIsoDateKey_(String(p.date||''));
  if(!selected) return leaveJson_({ok:false,error:'วันที่ไม่ถูกต้อง'});
  const ss=SpreadsheetApp.openById(LEAVE_SPREADSHEET_ID);
  const sh=ss.getSheetByName('data');
  if(!sh) throw new Error('ไม่พบชีต data');
  const lastRow=sh.getLastRow();
  if(lastRow<2) return leaveJson_({ok:true,date:String(p.date||''),rows:[]});
  const values=sh.getRange(2,1,lastRow-1,12).getDisplayValues();
  const rows=[];
  values.forEach(function(r){
    const name=String(r[5]||'').trim();
    const fromText=String(r[9]||'').trim();
    const toText=String(r[10]||'').trim();
    if(!name||!fromText||!toText) return;
    const from=parseThaiDateKey_(fromText),to=parseThaiDateKey_(toText);
    if(!from||!to||selected<from||selected>to) return;
    rows.push({
      row:String(r[0]||''),headApproval:String(r[1]||''),directorApproval:String(r[2]||''),
      submitted:String(r[4]||''),name:name,type:String(r[8]||''),
      from:fromText,to:toText,duration:String(r[11]||'')
    });
  });
  return leaveJson_({ok:true,date:String(p.date||''),rows:rows});
}

function parseIsoDateKey_(text) {
  const m=String(text||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return 0;
  return Number(m[1])*10000+Number(m[2])*100+Number(m[3]);
}
function parseThaiDateKey_(text) {
  const months={มกราคม:1,กุมภาพันธ์:2,มีนาคม:3,เมษายน:4,พฤษภาคม:5,มิถุนายน:6,กรกฎาคม:7,สิงหาคม:8,กันยายน:9,ตุลาคม:10,พฤศจิกายน:11,ธันวาคม:12};
  const m=String(text||'').trim().replace(/\s+/g,' ').match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);
  if(!m||!months[m[2]]) return 0;
  let year=Number(m[3]); if(year>2400) year-=543;
  return year*10000+months[m[2]]*100+Number(m[1]);
}
function leaveJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
