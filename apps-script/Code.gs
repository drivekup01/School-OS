const SCHOOL_OS_SPREADSHEET_ID = '1Nx-pM4dmFe9QtAfhe_zRu5f3RUf_SAjiMeJG8ggnmhc';

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
      clearBootstrapCache_();
      const data = loadDatabaseCached_();
      return json_({ ok: true, data: data, readOnly: true, systemMode: data.systemMode || 'DAILY', version: '1.2', refreshed: true });
    }
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function clearBootstrapCache_() {
  const cache = CacheService.getScriptCache();
  const metaKey = 'school_os_bootstrap_v7_meta';
  let count = 0;
  try { count = Number(cache.get(metaKey) || 0); } catch (_) {}
  const keys = [metaKey, 'school_os_bootstrap_v6'];
  for (let i = 0; i < count; i++) keys.push('school_os_bootstrap_v7_' + i);
  try { cache.removeAll(keys); } catch (_) {}
}

function loadDatabaseCached_() {
  const cache = CacheService.getScriptCache();
  const metaKey = 'school_os_bootstrap_v7_meta';

  // The old cache silently stopped working when the DB exceeded one
  // CacheService entry (~100 KB). Store it in smaller chunks instead.
  try {
    const count = Number(cache.get(metaKey) || 0);
    if (count > 0 && count <= 20) {
      const keys = [];
      for (let i = 0; i < count; i++) keys.push('school_os_bootstrap_v7_' + i);
      const parts = cache.getAll(keys);
      let raw = '';
      for (let i = 0; i < count; i++) {
        const part = parts['school_os_bootstrap_v7_' + i];
        if (!part) { raw = ''; break; }
        raw += part;
      }
      if (raw) return JSON.parse(raw);
    }
  } catch (_) {}

  const data = loadDatabase_();

  try {
    const raw = JSON.stringify(data);
    const chunkSize = 80000;
    const count = Math.ceil(raw.length / chunkSize);
    if (count > 0 && count <= 20) {
      const values = {};
      for (let i = 0; i < count; i++) {
        values['school_os_bootstrap_v7_' + i] = raw.slice(i * chunkSize, (i + 1) * chunkSize);
      }
      // Keep bootstrap warm longer. Save/refresh paths still clear this cache
      // explicitly, so a longer TTL avoids unnecessary full-sheet reloads.
      cache.putAll(values, 3600);
      cache.put(metaKey, String(count), 3600);
    }
  } catch (_) {}

  return data;
}

function loadDatabase_() {
  const ss = SpreadsheetApp.openById(SCHOOL_OS_SPREADSHEET_ID);
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

  const announcements = tableObjects_(ss, 'Announcements').map(r => ({
    id: s_(r.id),
    title: s_(r.title),
    body: s_(r.body),
    type: s_(r.type) || 'ทั่วไป',
    date: s_(r.date),
    createdAt: n_(r.createdAt),
    updatedAt: n_(r.updatedAt)
  }));

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
    sched, substitute, announcements, customDepts,
    subjectColorSchemeVersion: n_(configMap.subjectColorSchemeVersion) || 2,
    systemMode: (s_(configMap.systemMode) || 'DAILY').toUpperCase()
  };
}

function tableObjects_(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  const values = sh.getRange(1, 1, lastRow, lastCol).getDisplayValues();
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
    if (action === 'saveAnnouncement') return saveAnnouncementApi_(p);
    if (action === 'deleteAnnouncement') return deleteAnnouncementApi_(p);
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
    const ss = SpreadsheetApp.openById(SCHOOL_OS_SPREADSHEET_ID);
    const cfg = keyValueSheet_(ss, 'Config');
    const mode = (s_(cfg.systemMode) || 'DAILY').toUpperCase();

    if (mode !== 'SETUP') {
      return json_({ok:true,mode:mode,saved:[],savedAt:new Date().toISOString()});
    }

    writeSchool_(ss, db.school || {});
    writeTeachers_(ss, db.teachers || []);
    writeSubjects_(ss, db.subjects || []);
    writeRooms_(ss, db.rooms || []);
    writeSlots_(ss, db.slots || []);
    writeDays_(ss, db.days || []);
    writeSchedule_(ss, db.sched || {});

    setKeyValue_(ss, 'Config', 'customDepts', JSON.stringify(db.customDepts || []));
    setKeyValue_(ss, 'Config', 'subjectColorSchemeVersion', Number(db.subjectColorSchemeVersion || 2));

    SpreadsheetApp.flush();
    clearBootstrapCache_();

    return json_({
      ok:true,
      mode:mode,
      saved:['School','Teachers','Subjects','Rooms','Slots','Days','Schedule'],
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

function writeAnnouncements_(ss, list) {
  const headers = ['id','title','body','type','date','createdAt','updatedAt'];
  const rows = (Array.isArray(list) ? list : []).map(a => [
    s_(a.id), s_(a.title), s_(a.body), s_(a.type) || 'ทั่วไป',
    s_(a.date), n_(a.createdAt), n_(a.updatedAt)
  ]);
  ensureAnnouncementsSheet_(ss);
  writeTable_(ss, 'Announcements', headers, rows);
}

function saveAnnouncementApi_(p) {
  requireAdmin_(p.token);
  const raw = String(p.announcement == null ? '' : p.announcement);
  if (!raw) throw new Error('ไม่มีข้อมูลประกาศ');
  let item;
  try { item = JSON.parse(raw); } catch (_) { throw new Error('รูปแบบประกาศไม่ถูกต้อง'); }
  const id = s_(item.id);
  const title = s_(item.title);
  const body = s_(item.body);
  if (!id || !title || !body) throw new Error('ข้อมูลประกาศไม่ครบ');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('ระบบกำลังบันทึก กรุณาลองใหม่');
  try {
    const ss = SpreadsheetApp.openById(SCHOOL_OS_SPREADSHEET_ID);
    ensureAnnouncementsSheet_(ss);
    const list = tableObjects_(ss, 'Announcements');
    const now = Date.now();
    const row = {
      id:id,
      title:title,
      body:body,
      type:s_(item.type) || 'ทั่วไป',
      date:s_(item.date),
      createdAt:n_(item.createdAt) || now,
      updatedAt:n_(item.updatedAt) || now
    };
    const idx = list.findIndex(x => s_(x.id) === id);
    if (idx >= 0) list[idx] = row;
    else list.push(row);
    writeAnnouncements_(ss, list);
    SpreadsheetApp.flush();
    clearBootstrapCache_();
    return json_({ok:true,announcement:row,savedAt:new Date().toISOString()});
  } finally {
    lock.releaseLock();
  }
}

function deleteAnnouncementApi_(p) {
  requireAdmin_(p.token);
  const id = s_(p.id);
  if (!id) throw new Error('ไม่พบรหัสประกาศ');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('ระบบกำลังบันทึก กรุณาลองใหม่');
  try {
    const ss = SpreadsheetApp.openById(SCHOOL_OS_SPREADSHEET_ID);
    ensureAnnouncementsSheet_(ss);
    const list = tableObjects_(ss, 'Announcements').filter(x => s_(x.id) !== id);
    writeAnnouncements_(ss, list);
    SpreadsheetApp.flush();
    clearBootstrapCache_();
    return json_({ok:true,id:id,savedAt:new Date().toISOString()});
  } finally {
    lock.releaseLock();
  }
}

function ensureAnnouncementsSheet_(ss) {
  let sh = ss.getSheetByName('Announcements');
  if (!sh) {
    sh = ss.insertSheet('Announcements');
    sh.getRange(1,1,1,7).setValues([['id','title','body','type','date','createdAt','updatedAt']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function writeTable_(ss, sheetName, headers, rows) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('ไม่พบชีต ' + sheetName);

  const width = headers.length;
  const neededRows = Math.max(2, rows.length + 1);
  if (sh.getMaxColumns() < width) sh.insertColumnsAfter(sh.getMaxColumns(), width - sh.getMaxColumns());
  if (sh.getMaxRows() < neededRows) sh.insertRowsAfter(sh.getMaxRows(), neededRows - sh.getMaxRows());

  const oldLastRow = sh.getLastRow();
  const oldLastCol = sh.getLastColumn();
  if (oldLastRow > 0 && oldLastCol > 0) {
    sh.getRange(1, 1, oldLastRow, oldLastCol).clearContent();
  }
  sh.getRange(1,1,1,width).setValues([headers]);
  if (rows.length) sh.getRange(2,1,rows.length,width).setValues(rows);
}

function getAuthConfigCached_() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('school_os_auth_config_v1');
  if (saved) {
    try {
      const auth = JSON.parse(saved);
      if (auth && auth.adminId && auth.adminPasswordHash) return auth;
    } catch (_) {}
  }

  const ss = SpreadsheetApp.openById(SCHOOL_OS_SPREADSHEET_ID);
  const cfg = keyValueSheet_(ss, 'Config');
  const auth = {
    adminId: s_(cfg.adminId),
    adminPasswordHash: s_(cfg.adminPasswordHash).toLowerCase(),
    systemMode: (s_(cfg.systemMode)||'DAILY').toUpperCase()
  };
  if (auth.adminId && auth.adminPasswordHash) {
    props.setProperty('school_os_auth_config_v1', JSON.stringify(auth));
  }
  return auth;
}

function login_(p) {
  const cfg = getAuthConfigCached_();
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
  return json_({ok:true,token:token,role:'admin',systemMode:cfg.systemMode||'DAILY',expiresIn:21600});
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
  const ss=SpreadsheetApp.openById(SCHOOL_OS_SPREADSHEET_ID);
  setKeyValue_(ss,'Config','systemMode',mode);
  const props = PropertiesService.getScriptProperties();
  const auth = getAuthConfigCached_();
  auth.systemMode = mode;
  props.setProperty('school_os_auth_config_v1', JSON.stringify(auth));
  clearBootstrapCache_();
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
