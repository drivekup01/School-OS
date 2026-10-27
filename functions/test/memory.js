'use strict';
const {randomUUID}=require('node:crypto');
const copy=v=>v===undefined?undefined:structuredClone(v);
function memory(seed={}){
 const values=new Map(Object.entries(seed).map(([k,v])=>[k,copy(v)]));let queue=Promise.resolve(),failPublic=false;
 const snap=ref=>({ref,id:ref.id,exists:values.has(ref.path),data:()=>copy(values.get(ref.path))});
 function ref(path){return {path,id:path.split('/').at(-1),get:async()=>snap(ref(path)),collection:name=>collection(path+'/'+name),set:async v=>{values.set(path,copy(v));},create:async v=>{if(values.has(path))throw Object.assign(Error('exists'),{code:6});values.set(path,copy(v));},update:async v=>{if(!values.has(path))throw Error('missing');values.set(path,{...values.get(path),...copy(v)});}};}
 function collection(path,filters=[]){return {where:(field,op,value)=>collection(path,[...filters,[field,value]]),doc:id=>ref(path+'/'+(id||randomUUID().replaceAll('-',''))),get:async()=>({docs:[...values.keys()].filter(k=>k.startsWith(path+'/')&&k.split('/').length===path.split('/').length+1).filter(k=>filters.every(([field,value])=>values.get(k)?.[field]===value)).sort().map(k=>snap(ref(k)))})};}
 function writer(){const writes=[];return {get:async r=>snap(r),create:(r,d)=>writes.push(['create',r,d]),set:(r,d)=>writes.push(['set',r,d]),update:(r,d)=>writes.push(['update',r,d]),commit:async()=>{if(failPublic&&writes.some(w=>w[1].path.startsWith('timetable_public_versions/'))){failPublic=false;throw Error('simulated stage failure');}const next=new Map(values);for(const [type,r,d]of writes){if(type==='create'&&next.has(r.path))throw Object.assign(Error('exists'),{code:6});if(type==='update'&&!next.has(r.path))throw Error('missing');next.set(r.path,type==='update'?{...next.get(r.path),...copy(d)}:copy(d));}values.clear();for(const [k,v]of next)values.set(k,v);}};}
 return {doc:ref,collection,batch:writer,runTransaction(fn){const next=queue.then(async()=>{const tx=writer(),result=await fn(tx);await tx.commit();return result;});queue=next.catch(()=>{});return next;},values,failPublicStage(){failPublic=true;}};
}
module.exports={memory};
