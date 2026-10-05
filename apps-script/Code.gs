const SPREADSHEET_ID = '1-7kDkMUb37QqGeCPNozsDTavOgxz-jrk8pzAXtl6cR4';

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
    edu: s_(r.edu), rank: s_(r.rank), dept: s_(r.dept),
    subjects: parseList_(r.subjects || r.subjectsJson),
    phone: s_(r.phone), email: s_(r.email), note: s_(r.note),
    createdAt: n_(r.createdAt)
  }));

  const subjects = tableObjects_(ss, 'Subjects').map(r => ({
    id: s_(r.id), code: s_(r.code), name: s_(r.name), grade: s_(r.grade),
    dept: s_(r.dept), hours: n_(r.hours), color: s_(r.color)
  }));

  const rooms = tableObjects_(ss, 'Rooms').map(r => ({
    id: s_(r.id), level: s_(r.level), grade: s_(r.grade), room: s_(r.room),
    label: s_(r.label), homeroom: s_(r.homeroomTeacherId),
    homeroom2: s_(r.homeroomTeacherId2 || r.homeroom2),
    homeroom3: s_(r.homeroomTeacherId3 || r.homeroom3),
    planName: s_(r.planName)
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
      teacher3: s_(r.teacher3), learnRoom: s_(r.learnRoom), locked: b_(r.locked)
    };
  });

  const substitute = {};
  tableObjects_(ss, 'Substitute').forEach(r => {
    const date = s_(r.date);
    const teacherId = s_(r.teacherId);
    if (!date || !teacherId) return;
    if (!substitute[date]) substitute[date] = { absentList: [] };
    let absent = substitute[date].absentList.find(a => a.teacherId === teacherId);
    if (!absent) {
      absent = {
        teacherId: teacherId,
        type: s_(r.leaveType || r.type),
        note: s_(r.leaveNote || r.note),
        periods: []
      };
      substitute[date].absentList.push(absent);
    }
    const slotRaw = r.slotId;
    if (slotRaw != null && s_(slotRaw) !== '') {
      const slotNum = Number(slotRaw);
      absent.periods.push({
        slotId: isNaN(slotNum) ? s_(slotRaw) : slotNum,
        day: s_(r.day),
        roomId: s_(r.roomId),
        subject: s_(r.subject),
        subTeacher: s_(r.subTeacher || r.subTeacherId),
        subNote: s_(r.subNote),
        workType: s_(r.workType),
        messageStatus: s_(r.messageStatus)
      });
    }
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

function parseList_(v) {
  if (Array.isArray(v)) return v;
  const text = s_(v);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (_) {
    return text.split('|').map(x => s_(x)).filter(Boolean);
  }
}

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
    if (action === 'saveDatabase') return saveDatabase_(p);
    return json_({ ok:false, error:'Unknown action' });
  } catch (err) {
    return json_({ ok:false, error:String(err && err.message ? err.message : err) });
  }
}

function saveDatabase_(p) {
  requireAdmin_(p.token);

  const raw = String(p.data == null ? '' : p.data);
  if (!raw) throw new Error('ไม่มีข้อมูลสำหรับบันทึก');

  let db;
  try { db = JSON.parse(raw); }
  catch (_) { throw new Error('รูปแบบข้อมูลไม่ถูกต้อง'); }

  if (!db || typeof db !== 'object') throw new Error('ฐานข้อมูลไม่ถูกต้อง');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('ระบบกำลังบันทึกข้อมูล กรุณาลองใหม่');

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cfg = keyValueSheet_(ss, 'Config');
    const mode = (s_(cfg.systemMode) || 'DAILY').toUpperCase();

    // DAILY is operational mode: only daily substitute data may change.
    if (mode === 'DAILY') {
      writeSubstitute_(ss, db.substitute || {});
      SpreadsheetApp.flush();
      CacheService.getScriptCache().remove('school_os_bootstrap_v1');
      return json_({ok:true,mode:mode,saved:['Substitute'],savedAt:new Date().toISOString()});
    }

    if (mode !== 'SETUP') throw new Error('โหมดระบบไม่อนุญาตให้แก้ไขข้อมูล');

    writeSchool_(ss, db.school || {});
    writeTeachers_(ss, db.teachers || []);
    writeSubjects_(ss, db.subjects || []);
    writeRooms_(ss, db.rooms || []);
    writeSlots_(ss, db.slots || []);
    writeDays_(ss, db.days || []);
    writeSchedule_(ss, db.sched || {});
    writeSubstitute_(ss, db.substitute || {});

    setKeyValue_(ss, 'Config', 'customDepts', JSON.stringify(db.customDepts || []));
    setKeyValue_(ss, 'Config', 'subjectColorSchemeVersion', Number(db.subjectColorSchemeVersion || 2));

    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove('school_os_bootstrap_v1');

    return json_({
      ok:true,
      mode:mode,
      saved:['School','Teachers','Subjects','Rooms','Slots','Days','Schedule','Substitute'],
      savedAt:new Date().toISOString()
    });
  } finally {
    lock.releaseLock();
  }
}

function writeSchool_(ss, school) {
  const current = keyValueSheet_(ss, 'School');
  let logo = s_(school.logoDataUrl || school.logoUrl);
  // Google Sheets cells have a size limit. Keep the previous URL if an uploaded data URI is too large.
  if (logo.indexOf('data:') === 0 && logo.length > 45000) logo = s_(current.logoUrl);

  const values = {
    name: s_(school.name),
    address: s_(school.address),
    year: s_(school.year),
    semester: s_(school.semester),
    acadName: s_(school.acadName),
    acadPos: s_(school.acadPos),
    principalName: s_(school.principalName),
    principalPos: s_(school.principalPos),
    logoUrl: logo,
    logoSize: s_(school.logoSize) || 'small'
  };
  Object.keys(values).forEach(k => setKeyValue_(ss, 'School', k, values[k]));
}

function writeTeachers_(ss, list) {
  const headers = ['id','prefix','first','last','fullName','edu','rank','dept','phone','email','note','createdAt','subjects'];
  const rows = list.map(t => [
    s_(t.id), s_(t.prefix), s_(t.first), s_(t.last),
    (s_(t.prefix)+s_(t.first)+' '+s_(t.last)).trim(),
    s_(t.edu), s_(t.rank), s_(t.dept), s_(t.phone), s_(t.email), s_(t.note),
    n_(t.createdAt), JSON.stringify(Array.isArray(t.subjects) ? t.subjects : [])
  ]);
  writeTable_(ss, 'Teachers', headers, rows);
}

function writeSubjects_(ss, list) {
  const headers = ['id','code','name','grade','dept','hours','color'];
  const rows = list.map(x => [s_(x.id),s_(x.code),s_(x.name),s_(x.grade),s_(x.dept),n_(x.hours),s_(x.color)]);
  writeTable_(ss, 'Subjects', headers, rows);
}

function writeRooms_(ss, list) {
  const headers = ['id','level','grade','room','label','homeroomTeacherId','planName','homeroomTeacherId2','homeroomTeacherId3'];
  const rows = list.map(r => [
    s_(r.id),s_(r.level),s_(r.grade),s_(r.room),s_(r.label),s_(r.homeroom),
    s_(r.planName),s_(r.homeroom2),s_(r.homeroom3)
  ]);
  writeTable_(ss, 'Rooms', headers, rows);
}

function writeSlots_(ss, list) {
  const headers = ['id','label','start','end','isBreak'];
  const rows = list.map(x => [n_(x.id),s_(x.label),s_(x.start),s_(x.end),!!x.isBreak]);
  writeTable_(ss, 'Slots', headers, rows);
}

function writeDays_(ss, list) {
  const headers = ['order','day'];
  const rows = list.map((d,i) => [i+1,s_(d)]).filter(r => r[1]);
  writeTable_(ss, 'Days', headers, rows);
}

function writeSchedule_(ss, sched) {
  const headers = ['key','roomId','slotId','day','subject','teacher','teacher2','teacher3','learnRoom','locked'];
  const rows = Object.keys(sched).sort().map(key => {
    const c = sched[key] || {};
    const parts = String(key).split('_');
    const roomId = parts.shift() || '';
    const slotId = parts.shift() || '';
    const day = parts.join('_');
    return [key,roomId,slotId,day,s_(c.subject),s_(c.teacher),s_(c.teacher2),s_(c.teacher3),s_(c.learnRoom),!!c.locked];
  });
  writeTable_(ss, 'Schedule', headers, rows);
}

function writeSubstitute_(ss, substitute) {
  const headers = ['date','teacherId','leaveType','leaveNote','slotId','day','roomId','subject','subTeacher','subNote','workType','messageStatus','createdAt','updatedAt'];
  const rows = [];
  const now = Date.now();

  Object.keys(substitute || {}).sort().forEach(date => {
    const day = substitute[date] || {};
    (day.absentList || []).forEach(a => {
      const periods = Array.isArray(a.periods) ? a.periods : [];
      if (!periods.length) {
        rows.push([date,s_(a.teacherId),s_(a.type),s_(a.note),'','','','','','','','',now,now]);
        return;
      }
      periods.forEach(p => {
        rows.push([
          date,s_(a.teacherId),s_(a.type),s_(a.note),
          p.slotId == null ? '' : p.slotId,s_(p.day),s_(p.roomId),s_(p.subject),
          s_(p.subTeacher),s_(p.subNote),s_(p.workType),s_(p.messageStatus),now,now
        ]);
      });
    });
  });

  writeTable_(ss, 'Substitute', headers, rows);
}

function writeTable_(ss, sheetName, headers, rows) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('ไม่พบชีต ' + sheetName);

  const width = headers.length;
  const neededRows = Math.max(2, rows.length + 1);
  if (sh.getMaxColumns() < width) sh.insertColumnsAfter(sh.getMaxColumns(), width - sh.getMaxColumns());
  if (sh.getMaxRows() < neededRows) sh.insertRowsAfter(sh.getMaxRows(), neededRows - sh.getMaxRows());

  // Clear values only; preserve the sheet's formatting.
  sh.getDataRange().clearContent();
  sh.getRange(1,1,1,width).setValues([headers]);
  if (rows.length) sh.getRange(2,1,rows.length,width).setValues(rows);
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
