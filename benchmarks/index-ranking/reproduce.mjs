#!/usr/bin/env node
// Public Index benchmark. Pure read-only calculation over dated public JSON metadata.
// Does NOT execute external MCP servers, collect telemetry, or write to production.
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {mergeIndexDiscovery} from './merge.mjs';
import {searchIndexCatalog as v1} from './search-v1.mjs';
import {searchIndexCatalog as v3} from './search-v3.mjs';

const URLS={
 base:'https://pc.zp.ua/data/mcp-registry-census.json',
 overlay:'https://pc.zp.ua/data/index-discovery-overlay.json'
};
const arg=(key)=>{const idx=process.argv.indexOf(key);return idx<0?null:process.argv[idx+1]||null};
const basePath=arg('--base'),overlayPath=arg('--overlay');
if(Boolean(basePath)!==Boolean(overlayPath))
 throw Error('Provide BOTH --base and --overlay or neither');
const readRemote=async(url,maxBytes)=>{
 const response=await fetch(url,{method:'GET',redirect:'error',cache:'no-store',
  headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('FETCH_FAILED status='+response.status);
 const len=Number(response.headers.get('content-length')||'0');
 if(len>maxBytes)throw Error('SOURCE_TOO_LARGE');
 // Additional bound even when no Content-Length exists.
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length>maxBytes)throw Error('SOURCE_TOO_LARGE');
 return JSON.parse(bytes.toString('utf8'));
};
const load=async(file,url,max)=>file?
 JSON.parse(readFileSync(file,'utf8')):readRemote(url,max);
const base=await load(basePath,URLS.base,34*1024*1024);
const overlay=await load(overlayPath,URLS.overlay,25*1024*1024);
const merged=mergeIndexDiscovery(base,overlay);
const items=merged.items;
const gold=JSON.parse(readFileSync(new URL('./gold.json',import.meta.url),'utf8'));
const splits=['vendor','holdout_vendor','purpose','holdout_purpose'];
const ruleRx=new RegExp(gold.notTool,'i');
function top(search,q,n=72){
 let results=[],total=0;
 for(let offset=0;offset<n;offset+=24){
  const r=search(items,q,{limit:24,offset});
  if(!r.ok)throw Error('QUERY_REJECTED '+q+':'+r.code);
  total=r.totalMatches;results.push(...r.items);
  if(!r.hasMore)break;
 }
 return {items:results,total};
}
function measure(search){
 const started=performance.now(),groups={};
 for(const group of splits){
  const rows=[];
  for(const [query,answers] of gold[group]){
   const r=top(search,query);
   const names=r.items.map(x=>x.name.toLowerCase());
   const ranks=answers.map(x=>names.indexOf(x.toLowerCase()))
    .filter(i=>i>=0).map(i=>i+1);
   const best=ranks.length?Math.min(...ranks):null;
   rows.push({query,rank:best,hit5:best!==null&&best<=5,
    top5:r.items.slice(0,5).map(x=>x.name)});
  }
  groups[group]={cases:rows.length,
   hit5:rows.filter(x=>x.hit5).length,
   mrr72:Number((rows.reduce((n,x)=>n+(x.rank?1/x.rank:0),0)/rows.length).toFixed(3)),
   rows};
 }
 const rules=[];
 for(const [query,expression] of gold.rules){
  const rx=new RegExp(expression,'i');
  const r=top(search,query,24);
  const relevant=r.items.slice(0,5).map(row=>{
   const text=[row.name,row.title,row.description].filter(Boolean).join(' ').replace(/[-_]/g,' ');
   const desc=[row.title,row.description].filter(Boolean).join(' ');
   return rx.test(text)&&!ruleRx.test(desc);
  });
  rules.push({query,p5:relevant.filter(Boolean).length/5});
 }
 return {
  vendor:{count:groups.vendor.cases,hit5:groups.vendor.hit5,mrr72:groups.vendor.mrr72},
  formerHoldoutVendor:{count:groups.holdout_vendor.cases,hit5:groups.holdout_vendor.hit5,mrr72:groups.holdout_vendor.mrr72},
  purpose:{count:groups.purpose.cases,hit5:groups.purpose.hit5},
  formerHoldoutPurpose:{count:groups.holdout_purpose.cases,hit5:groups.holdout_purpose.hit5},
  ruleMeanP5:Number((rules.reduce((a,x)=>a+x.p5,0)/rules.length).toFixed(2)),
  ruleCases:rules.length,
  elapsedMs:Math.round(performance.now()-started),
  ...(process.argv.includes('--details')?{groups,rules}:{})
 };
}
const output={
 runAt:new Date().toISOString(),
 source:{baseSourceDate:base.sourceDate||null,
  overlayGeneratedAt:overlay.generatedAt||null,
  catalogItems:items.length,source:'public_metadata_only'},
 caveat:'No MCP server was executed. The catalog is mutable; scores can differ from the 2026-11-11 baseline.',
 cases:54,
 v1:measure(v1),
 v3:measure(v3)
};
console.log(JSON.stringify(output,null,2));
