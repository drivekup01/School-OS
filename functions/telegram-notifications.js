'use strict';
// Transport only. Callers must construct summaries from committed server data.
const {createHash}=require('node:crypto');
const topics=Object.freeze(['morning','substitute','grades','venue','repair']);
function eventId(topic,key){if(!topics.includes(topic)||typeof key!=='string'||!key.trim())throw Error('Invalid notification event');return createHash('sha256').update(topic+':'+key).digest('hex');}
function payload(config,event){
 if(!topics.includes(event.topic))throw Error('Unknown notification topic');
 const thread=config.threads?.[event.topic];
 if(!/^-\d+$/.test(String(config.chatId))||!Number.isSafeInteger(thread)||thread<=0)throw Error('Telegram destination is not configured');
 if(typeof event.text!=='string'||!event.text.trim()||event.text.length>3800)throw Error('Invalid summary');
 const url=new URL(event.url);
 if(url.origin!=='https://drivekup01.github.io'||!['/School-OS/','/School-Portal/','/School-Budget/'].some(p=>url.pathname.startsWith(p)))throw Error('Invalid school link');
 return {chat_id:String(config.chatId),message_thread_id:thread,text:event.text,link_preview_options:{is_disabled:true},reply_markup:{inline_keyboard:[[{text:'เปิดดูรายการ',url:url.href}]]}};
}
async function send({token,config,event,fetchImpl=fetch}){
 if(typeof token!=='string'||!/^\d+:[A-Za-z0-9_-]+$/.test(token))throw Error('Telegram token is not configured');
 const body=payload(config,event);let response;
 try{response=await fetchImpl('https://api.telegram.org/bot'+token+'/sendMessage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});}catch(_){return {status:'uncertain',retryAutomatically:false};}
 let result;try{result=await response.json();}catch(_){return {status:'uncertain',retryAutomatically:false};}
 if(response.ok&&result.ok&&Number.isSafeInteger(result.result?.message_id))return {status:'sent',messageId:result.result.message_id};
 // Do not log response descriptions or errors: a transport may include token URLs.
 if(result.error_code===429)return {status:'rate-limited',retryAfter:Math.min(3600,Math.max(1,Number(result.parameters?.retry_after)||60)),retryAutomatically:true};
 return {status:response.status>=500?'uncertain':'failed',retryAutomatically:false};
}
module.exports={topics,eventId,payload,send};
