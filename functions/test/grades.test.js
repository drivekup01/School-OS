const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../grades-model'),{parsePage}=require('../grades-parser');
const auth={uid:'faculty',token:{email_verified:true,firebase:{sign_in_provider:'google.com'}}};
const course={code:'ท22101',name:'ภาษาไทย',credits:1.5,maximum:100,score:77,grade:3.5};
const page=()=>({page:1,code:'06678',year:2569,term:1,level:2,room:3,number:1,identityReady:true,tableReady:true,courses:[course]});
const roster=[{code:'06678',studentId:'s1',classId:'c1',className:'ม.2/3',academicYear:2569,number:1,name:'นักเรียนทดสอบ'}];
test('only verified current academic roles may upload; stale role flags cannot elevate',()=>{
 for(const schoolRole of ['admin','deputy','timetable'])assert.doesNotThrow(()=>M.requireFaculty(auth,{active:true,schoolRole}));
 for(const p of [{active:true,schoolRole:'teacher',timetableRole:'academic'},{active:false,schoolRole:'admin'}])assert.throws(()=>M.requireFaculty(auth,p),{code:'permission-denied'});
 assert.throws(()=>M.requireFaculty(null,{active:true,schoolRole:'admin'}),{code:'unauthenticated'});
});
test('leading-zero ID is primary; room, year and roster number must all match without fuzzy names',()=>{
 assert.equal(M.matchPage(page(),roster,[{code:'ท22101',name:'ภาษาไทยจากทะเบียน'}]).match.name,'นักเรียนทดสอบ');
 assert.equal(M.matchPage(page(),roster,[{code:'ท22101',name:'ภาษาไทยจากทะเบียน'}]).courses[0].name,'ภาษาไทยจากทะเบียน');
 for(const change of [{code:'6678'},{room:2},{number:2},{year:2568}])assert.equal(M.matchPage({...page(),...change},roster,[]).ready,false);
 assert.equal(M.matchPage(page(),[...roster,{...roster[0],studentId:'s2'}],[]).ready,false);
});
test('cannot publish unresolved pages or multiple pages for the same student; name edits cannot add courses',()=>{
 const row=M.matchPage(page(),roster,[]);assert.equal(M.selectedPages([row],[1]).length,1);assert.throws(()=>M.selectedPages([{...row,ready:false}],[1]));assert.throws(()=>M.selectedPages([row,{...row,page:2}],[1,2]));
 assert.deepEqual(M.validateNames({'ท22101':'ภาษาไทย'},[row]),{'ท22101':'ภาษาไทย'});assert.throws(()=>M.validateNames({'ค99999':'วิชาอื่น'},[row]));
});
test('unsupported image-only pages remain unresolved and cannot publish invented scores',()=>{const parsed=parsePage([],595,842);assert.equal(parsed.identityReady,false);assert.equal(parsed.tableReady,false);assert.deepEqual(parsed.courses,[]);});
