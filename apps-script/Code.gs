const SPREADSHEET_ID = '1f0vnm-dJHaVRRbPVXEIRuBYhXwyft_ceNraqs8XwqkY';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'bootstrap';
    if (action === 'health') {
      return json_({ ok: true, service: 'School-OS API', version: '1.0', time: new Date().toISOString() });
    }
    if (action === 'bootstrap') {
      const data = loadDatabaseCached_();
      return json_({ ok: true, data: data, readOnly: true, systemMode: data.systemMode || 'DAILY', version: '1.2' });
    }
    if (action === 'refresh') {
      CacheService.getScriptCache().remove('school_os_bootstrap_v1');
      const data = loadDatabaseCached_();
      return json_({ ok: true, data: data, readOnly: true, systemMode: data.systemMode || 'DAILY', version: '1.2', refreshed: true });
    }
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function loadDatabaseCached_() {
  const cache = CacheService.getScriptCache();
  const key = 'school_os_bootstrap_v1';
  const cached = cache.get(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (_) {}
  }

  const data = loadDatabase_();

  // Apps Script CacheService has a per-entry size limit.
  // Keep the cache only when the serialized school DB fits safely.
  try {
    const raw = JSON.stringify(data);
    if (raw.length < 90000) cache.put(key, raw, 300);
  } catch (_) {}

  return data;
}

function loadDatabase_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const schoolMap = keyValueSheet_(ss, 'School');
  const configMap = keyValueSheet_(ss, 'Config');

  const teachers = tableObjects_(ss, 'Teachers').map(r => ({
    id: s_(r.id), prefix: s_(r.prefix), first: s_(r.first), last: s_(r.last),
    edu: s_(r.edu), rank: s_(r.rank), dept: s_(r.dept), subjects: [],
    phone: s_(r.phone), email: s_(r.email), note: s_(r.note),
    createdAt: n_(r.createdAt)
  }));

  const subjects = tableObjects_(ss, 'Subjects').map(r => ({
    id: s_(r.id), code: s_(r.code), name: s_(r.name), grade: s_(r.grade),
    dept: s_(r.dept), hours: n_(r.hours), color: s_(r.color)
  }));

  const rooms = tableObjects_(ss, 'Rooms').map(r => ({
    id: s_(r.id), level: s_(r.level), grade: s_(r.grade), room: s_(r.room),
    label: s_(r.label), homeroom: s_(r.homeroomTeacherId), planName: s_(r.planName)
  }));

  const slots = tableObjects_(ss, 'Slots').map(r => ({
    id: n_(r.id), label: s_(r.label), start: s_(r.start), end: s_(r.end),
    isBreak: b_(r.isBreak)
  }));

  const days = tableObjects_(ss, 'Days')
    .sort((a,b) => n_(a.order) - n_(b.order))
    .map(r => s_(r.day))
    .filter(Boolean);

  const sched = {};
  tableObjects_(ss, 'Schedule').forEach(r => {
    const key = s_(r.key);
    if (!key) return;
    sched[key] = {
      subject: s_(r.subject), teacher: s_(r.teacher), teacher2: s_(r.teacher2),
      teacher3: s_(r.teacher3), learnRoom: s_(r.learnRoom)
    };
  });

  const substitute = {};
  tableObjects_(ss, 'Substitute').forEach((r, i) => {
    const key = s_(r.date) + '_' + s_(r.teacherId) + '_' + s_(r.slotId) + '_' + i;
    if (!s_(r.date)) return;
    substitute[key] = r;
  });

  let customDepts = [];
  try { customDepts = JSON.parse(configMap.customDepts || '[]'); } catch (_) {}

  return {
    school: {
      name: s_(schoolMap.name), address: s_(schoolMap.address),
      year: s_(schoolMap.year), semester: s_(schoolMap.semester),
      acadName: s_(schoolMap.acadName), acadPos: s_(schoolMap.acadPos),
      principalName: s_(schoolMap.principalName), principalPos: s_(schoolMap.principalPos),
      logoDataUrl: s_(schoolMap.logoUrl), logoUrl: s_(schoolMap.logoUrl), logoSize: s_(schoolMap.logoSize) || 'small'
    },
    teachers, subjects, rooms, slots,
    days: days.length ? days : ['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์'],
    sched, substitute, customDepts,
    subjectColorSchemeVersion: n_(configMap.subjectColorSchemeVersion) || 2,
    systemMode: (s_(configMap.systemMode) || 'DAILY').toUpperCase()
  };
}

function tableObjects_(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  const values = sh.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row.some(v => String(v).trim() !== '')).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] == null ? '' : row[i]);
    return obj;
  });
}

function keyValueSheet_(ss, sheetName) {
  const rows = tableObjects_(ss, sheetName);
  const out = {};
  rows.forEach(r => out[s_(r.key)] = r.value == null ? '' : r.value);
  return out;
}

function s_(v) { return v == null ? '' : String(v).trim(); }
function n_(v) { const n = Number(v); return isNaN(n) ? 0 : n; }
function b_(v) { return /^(true|1|yes|ใช่)$/i.test(s_(v)); }

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    const action = s_(p.action);
    if (action === 'login') return login_(p);
    if (action === 'setMode') return setMode_(p);
    if (action === 'logout') return logout_(p);
    return json_({ ok:false, error:'Unknown action' });
  } catch (err) {
    return json_({ ok:false, error:String(err && err.message ? err.message : err) });
  }
}

function login_(p) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const cfg = keyValueSheet_(ss, 'Config');
  const id = s_(p.id);
  const password = String(p.password == null ? '' : p.password);
  const storedId = s_(cfg.adminId);
  const storedHash = s_(cfg.adminPasswordHash).toLowerCase();
  if (!storedId || !storedHash) return json_({ok:false,error:'ยังไม่ได้ตั้งค่าบัญชีฝ่ายวิชาการ'});
  const actualHash = sha256Hex_(password);
  if (id !== storedId || actualHash !== storedHash) {
    Utilities.sleep(250);
    return json_({ok:false,error:'ID หรือ Password ไม่ถูกต้อง'});
  }
  const token = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
  CacheService.getScriptCache().put('school_os_session_' + token, 'admin', 21600);
  return json_({ok:true,token:token,role:'admin',systemMode:(s_(cfg.systemMode)||'DAILY').toUpperCase(),expiresIn:21600});
}

function logout_(p) {
  const token=s_(p.token);
  if(token) CacheService.getScriptCache().remove('school_os_session_'+token);
  return json_({ok:true});
}

function setMode_(p) {
  requireAdmin_(p.token);
  const mode=s_(p.mode).toUpperCase();
  if(mode!=='SETUP' && mode!=='DAILY') throw new Error('โหมดไม่ถูกต้อง');
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  setKeyValue_(ss,'Config','systemMode',mode);
  CacheService.getScriptCache().remove('school_os_bootstrap_v1');
  return json_({ok:true,systemMode:mode});
}

function requireAdmin_(token) {
  token=s_(token);
  if(!token || CacheService.getScriptCache().get('school_os_session_'+token)!=='admin') {
    throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
  }
  return true;
}

function setKeyValue_(ss,sheetName,key,value) {
  const sh=ss.getSheetByName(sheetName);
  if(!sh) throw new Error('ไม่พบชีต '+sheetName);
  const values=sh.getDataRange().getValues();
  for(let i=1;i<values.length;i++){
    if(s_(values[i][0])===key){
      sh.getRange(i+1,2).setValue(value);
      return;
    }
  }
  sh.appendRow([key,value]);
}

function sha256Hex_(text) {
  const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(text),Utilities.Charset.UTF_8);
  return bytes.map(function(b){const v=(b+256)%256;return ('0'+v.toString(16)).slice(-2);}).join('');
}
