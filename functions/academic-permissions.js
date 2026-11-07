'use strict';
const {isDeepStrictEqual:equal}=require('node:util');
const fail=()=>{throw Object.assign(Error('สิทธิ์วิชาการ #2 จัดตารางสอนและเพิ่มข้อมูลใหม่ได้ แต่แก้ไขหรือลบข้อมูลพื้นฐานเดิมไม่ได้'),{code:'permission-denied'});};
const full=p=>p?.active===true&&(p.schoolRole?p.schoolRole==='admin'||p.schoolRole==='timetable'&&[undefined,'full'].includes(p.academicScope):p.identityAdmin===true||p.timetableRole==='academic');
const scheduler=p=>p?.active===true&&p.schoolRole==='timetable'&&p.academicScope==='scheduler';
function change(p,before,after,method){if(full(p))return;if(!scheduler(p))fail();if(!['saveDatabase','saveSubstitute'].includes(method))fail();const mutable=new Set(['sched','teacherSched','substitute']);for(const key of new Set([...Object.keys(before),...Object.keys(after)])){if(mutable.has(key))continue;if(['teachers','subjects','rooms'].includes(key)){if(!Array.isArray(after[key])||!before[key].every(old=>after[key].some(next=>next.id===old.id&&equal(old,next))))fail();}else if(key==='school'){const a={...after.school},b=before.school;if(b.logoDataUrl===undefined&&a.logoDataUrl===b.logoUrl)delete a.logoDataUrl;if(b.logoUrl===undefined&&a.logoUrl===b.logoDataUrl)delete a.logoUrl;if(!equal(b,a))fail();}else if(!equal(before[key],after[key]))fail();}}
module.exports={full,scheduler,change};
