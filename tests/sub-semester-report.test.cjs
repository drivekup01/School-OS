const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function boot(db){const c={DB:db,window:{},document:{getElementById:()=>null},renderSubHistoryPage:()=>{}};vm.createContext(c);vm.runInContext(fs.readFileSync('timetable-runtime-19.js','utf8'),c);return c;}
const day=(...slots)=>({absentList:[{periods:slots.map(slotId=>({slotId,subTeacher:'ครู ก'}))}]});
test('semester totals include October when the actual second semester begins October 28; combined rooms count once',()=>{
 const db={teachers:[{id:'a',first:'ครู',last:'ก'}],exchangeTerm:{year:2569,term:2,from:'2026-10-28',to:'2027-04-30'},substitute:{'2026-10-27':day(1),'2026-10-28':day(1,1,2),'2026-10-29':day(1),'2026-11-04':day(1),'2027-01-04':day(1)}};
 const c=boot(db),before=JSON.stringify(db);assert.equal(c.subSemesterTotals(db,2569,2)[0].count,5);assert.equal(c.subSemesterTotals(db,2569,1)[0].count,1);assert.equal(JSON.stringify(db),before);
});
test('saved semester metadata preserves historical assignments after current term bounds change',()=>{
 const db={teachers:[],substitute:{'2026-10-28':{...day(1),academicYear:2569,semester:2}},exchangeTerm:{year:2570,term:1,from:'2027-05-01',to:'2027-10-15'}};
 const c=boot(db);assert.equal(c.subSemesterTotals(db,2569,2)[0].count,1);assert.equal(c.subSemesterTotals(db,2570,1).length,0);
});
test('fresh report data is loaded independently without overwriting editable local data',async()=>{
 const db={substitute:{'2026-11-04':day(1)}},c=boot(db);c.window.schoolFirebaseReady=Promise.resolve({readReportDatabase:async()=>({data:{substitute:{'2026-11-04':day(1,2)}}})});await c.refreshSubSemesterReport();assert.equal(c.subSemesterReportData.substitute['2026-11-04'].absentList[0].periods.length,2);assert.equal(db.substitute['2026-11-04'].absentList[0].periods.length,1);
});
