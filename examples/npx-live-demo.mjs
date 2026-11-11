#!/usr/bin/env node
// Real npm -> stdio MCP client demo (no SDK dependency in the client).
// One read-only search. Does not execute any third-party MCP server.
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';

const PACKAGE='@ramirkoz/project-consulting-mcp@0.1.0';
const BIN=process.env.NPX_BIN||'npx';
const child=spawn(BIN,['-y',PACKAGE],{
 stdio:['pipe','pipe','pipe'],
 env:{...process.env,npm_config_update_notifier:'false'}
});
let stderr='',closed=false,nextId=0;
const pending=new Map();
child.stderr.setEncoding('utf8');
child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-1500)});
child.on('error',e=>{
 closed=true;
 for(const p of pending.values()){clearTimeout(p.timer);p.reject(e)}
 pending.clear();
});
child.on('close',code=>{
 closed=true;
 for(const p of pending.values()){
  clearTimeout(p.timer);p.reject(Error('MCP_PROCESS_CLOSED exit='+code));
 }
 pending.clear();
});
const lines=createInterface({input:child.stdout,crlfDelay:Infinity});
lines.on('line',line=>{
 let data;try{data=JSON.parse(line)}catch{return}
 if(data?.jsonrpc!=='2.0'||!Object.hasOwn(data,'id'))return;
 const p=pending.get(data.id);if(!p)return;
 pending.delete(data.id);clearTimeout(p.timer);
 if(data.error)p.reject(Error('MCP_RPC_ERROR code='+data.error.code));
 else p.resolve(data.result);
});
function send(method,params,timeoutMs=60000){
 if(closed)return Promise.reject(Error('MCP_PROCESS_NOT_RUNNING'));
 const id=++nextId;
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(Error('MCP_RPC_TIMEOUT '+method))},timeoutMs);
  pending.set(id,{resolve,reject,timer});
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 });
}
function notify(method){
 child.stdin.write(JSON.stringify({jsonrpc:'2.0',method})+'\n');
}
try{
 const init=await send('initialize',{
  protocolVersion:'2025-11-25',
  capabilities:{},
  clientInfo:{name:'project-consulting-public-demo',version:'0.1.0'}
 },120000);
 if(!init?.serverInfo?.name)throw Error('MCP_INITIALIZE_INVALID');
 notify('notifications/initialized');
 console.log('MCP_DEMO_INITIALIZE=PASS');
 console.log('MCP_DEMO_SERVER='+init.serverInfo.name);
 const listing=await send('tools/list',{});
 const names=(listing?.tools||[]).map(x=>x.name).sort();
 const expected=['coster_export_guide','index_capabilities','index_search_mcp_servers'];
 if(JSON.stringify(names)!==JSON.stringify(expected))
  throw Error('MCP_TOOLS_UNEXPECTED');
 if(!listing.tools.every(x=>x.annotations?.readOnlyHint===true))
  throw Error('MCP_READ_ONLY_MISSING');
 console.log('MCP_DEMO_TOOLS=PASS');
 console.log('MCP_DEMO_TOOL_COUNT='+names.length);
 const answer=await send('tools/call',{
  name:'index_search_mcp_servers',
  arguments:{query:'github',limit:5,offset:0}
 });
 const data=answer?.structuredContent;
 if(answer?.isError||data?.ok!==true||
    data?.proof!=='metadata_only'||data?.taskSuccessVerified!==false||
    !Array.isArray(data.items)||!data.items.length)
  throw Error('MCP_SEARCH_RESULT_INVALID_OR_RATE_LIMITED');
 const top1=data.items[0]?.name;
 if(top1!=='io.github.github/github-mcp-server')
  throw Error('MCP_TOP1_NOT_EXPECTED '+String(top1).slice(0,100));
 console.log('MCP_DEMO_SEARCH=PASS');
 console.log('MCP_DEMO_QUERY=github');
 console.log('MCP_DEMO_TOP1='+top1);
 console.log('MCP_DEMO_METADATA_ONLY=YES');
 console.log('MCP_DEMO_NOTE=No third-party MCP server was executed or security-verified');
}catch(error){
 console.error('MCP_DEMO=STOP '+String(error?.message||error));
 if(stderr)console.error('MCP_DEMO_STDERR_TAIL='+stderr.replace(/[\r\n]+/g,' ').slice(-900));
 process.exitCode=1;
}finally{
 try{child.stdin.end()}catch{}
 const kill=setTimeout(()=>child.kill('SIGTERM'),1500);
 kill.unref?.();
}
