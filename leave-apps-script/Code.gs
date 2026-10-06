// School-OS Leave API — SEPARATE from the main School-OS backend.
// Data source: ระบบใบลาออนไลน์
const LEAVE_SPREADSHEET_ID = '1KA8ch40D0iFHN1nYNcgadWTQbxehEiyKtOdcivRupW0';

// Read-only bridge from the external leave sheet name to School-OS permanent teacher ID.
// The external sheet is never modified. Add mappings only after verifying the teacher.
const LEAVE_TEACHER_ID_MAP = {
  'นางสาวเฑียรภักดิ์ สุทธิยะรักษ์': 'muqeww60nr4w8'
};

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
  // Column F is the real leave-record marker. Formula-only rows elsewhere must not
  // make the API process hundreds of empty records.
  const maxRow=sh.getLastRow();
  if(maxRow<2) return leaveJson_({ok:true,date:String(p.date||''),rows:[]});

  const names=sh.getRange(2,6,maxRow-1,1).getDisplayValues();
  let dataRowCount=0;
  for(let i=names.length-1;i>=0;i--){
    if(String(names[i][0]||'').trim()){
      dataRowCount=i+1;
      break;
    }
  }
  if(!dataRowCount) return leaveJson_({ok:true,date:String(p.date||''),rows:[]});

  // Read only F:L through the last row that actually has a teacher name.
  const values=sh.getRange(2,6,dataRowCount,7).getDisplayValues();
  const rows=[];
  values.forEach(function(r,i){
    const name=String(r[0]||'').trim();      // F
    const type=String(r[3]||'').trim();      // I
    const fromText=String(r[4]||'').trim();  // J
    const toText=String(r[5]||'').trim();    // K
    const duration=String(r[6]||'').trim();  // L
    if(!name||!fromText||!toText) return;
    const from=parseThaiDateKey_(fromText),to=parseThaiDateKey_(toText);
    if(!from||!to||selected<from||selected>to) return;
    rows.push({
      row:String(i+2),teacherId:LEAVE_TEACHER_ID_MAP[name]||'',name:name,type:type,
      from:fromText,to:toText,duration:duration
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
