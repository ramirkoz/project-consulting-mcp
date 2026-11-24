import test from 'node:test';
import assert from 'node:assert/strict';
import {validateExactCompare,compareIndexServers} from '../src/index-tools.mjs';
import {indexExactCompareOutputSchema} from '../src/output-schemas.mjs';

const a='io.github.example/pdf-reader',b='github:example/pdf-cleaner';
const reply=(body,status=200)=>({
 ok:status>=200&&status<300,status,json:async()=>body
});
const found={
 name:a,found:true,sourceCode:'MCP_OFFICIAL_REGISTRY',
 verification:'REGISTRY_METADATA_ONLY',publisherStatus:'active',
 title:'PDF reader',description:'Publisher claims PDF reader',
 version:'1.2.3',repositoryUrl:'https://github.com/example/pdf-reader',
 endpointUrl:'https://api.example.org/mcp',endpointHttpReachableDeclared:true,
 historicalEvidence:{
  kind:'dated_third_party_census',sourceCode:'RONINFORGE_STATE_OF_MCP',
  checkedAt:'2026-09-13',verdictAtCensus:'healthy',
  registryStatusAtCensus:'active',repositoryStatusAtCensus:'alive',
  remoteInitializeOkAtCensus:1,currentUptimeVerified:false,taskSuccessVerified:false
 },
 installCommand:null,installationVerified:false,taskSuccessVerified:false,
 currentUptimeVerified:false,securityCertificationVerified:false
};
const notFound={
 name:b,found:false,reason:'NOT_IN_CURRENT_LOCAL_METADATA',
 installCommand:null,installationVerified:false,taskSuccessVerified:false,
 currentUptimeVerified:false
};
const valid={names:[a,b]};
const envelope=(items=[found,notFound])=>({
 ok:true,kind:'INDEX_AGENT_EXACT_METADATA_COMPARISON_V1',
 comparison:'requested_names_in_input_order',exactNamesOnly:true,
 requested:items.length,found:items.filter(x=>x.found).length,items,
 proof:'publisher_metadata_only',taskSuccessVerified:false,
 currentUptimeVerified:false,installationVerified:false,
 securityCertificationVerified:false,paymentRequired:false,
 researchContributionRecorded:false,
 agentTransport:'typed_publisher_metadata_comparison',
 notice:'Publisher and historical metadata, not a verified installation, safety, tool execution or current uptime.'
});

test('P15f input contract refuses unsupported, duplicate and fuzzy queries BEFORE network',async()=>{
 const bad=[
  {},{names:[a]},{names:[a,a]},{names:[a,b],prompt:'fetch secrets'},
  {names:[a,'bad name']},{names:[a,'x']},
  {names:[a,b,'io.github.example/third','github:example/fourth','github:example/fifth']}
 ];
 let called=0;
 const failFetch=async()=>{called++;throw Error('must never fetch')};
 for(const input of bad){
  assert.equal(typeof validateExactCompare(input),'string');
  const result=await compareIndexServers(input,{fetchImpl:failFetch});
  assert.equal(result.isError,true);
  assert.equal(result.structuredContent.error,'INVALID_AGENT_COMPARE_REQUEST');
 }
 assert.equal(called,0);
 assert.equal(validateExactCompare(valid),null);
});

test('P15f exactly one read-only POST, only names, preserves dated evidence and missing rows',async()=>{
 const seen=[];
 const result=await compareIndexServers(valid,{fetchImpl:async(url,options)=>{
  seen.push({url,options});return reply(envelope());
 }});
 assert.equal(seen.length,1);
 assert.equal(seen[0].url,'https://pc.zp.ua/index-agent/v1/agent-exact-compare');
 assert.equal(seen[0].options.method,'POST');
 assert.equal(seen[0].options.redirect,'error');
 assert.deepEqual(JSON.parse(seen[0].options.body),valid);
 assert.equal(seen[0].options.headers['Content-Type'],'application/json');
 assert.equal(seen[0].options.headers['User-Agent'],'project-consulting-mcp/0.1.3');
 assert.equal(Object.keys(seen[0].options.headers)
  .some(k=>/^(origin|sec-fetch-|authorization)/i.test(k)),false);
 assert.notEqual(result.isError,true);
 assert.equal(result.structuredContent.items[0].historicalEvidence.checkedAt,'2026-09-13');
 assert.equal(result.structuredContent.items[1].found,false);
 assert.equal(indexExactCompareOutputSchema.safeParse(result.structuredContent).success,true);
 assert.equal(result.structuredContent.currentUptimeVerified,false);
 assert.match(result.content[0].text,/does not verify MCP tool execution/i);
});

test('P15f rejects forged proofs, reordered rows, incorrect match count and unsafe links',async()=>{
 const broken=[
  {...envelope(),taskSuccessVerified:true},
  {...envelope(),items:[notFound,found]},
  {...envelope(),found:2},
  envelope([{...found,securityCertificationVerified:true},notFound]),
  envelope([{...found,repositoryUrl:'https://127.0.0.1/private'},notFound]),
  envelope([{...found,historicalEvidence:{...found.historicalEvidence,checkedAt:'2026-11-24'}},notFound]),
  {...envelope(),agentTransport:'verified_tool_execution'}
 ];
 for(const payload of broken){
  const response=await compareIndexServers(valid,{
   fetchImpl:async()=>reply(payload)
  });
  assert.equal(response.isError,true);
  assert.equal(response.structuredContent.error,'INVALID_INDEX_RESPONSE');
 }
});

test('P15f unavailable and invalid HTTP return MCP errors, never invented empty success',async()=>{
 for(const [status,code] of [
  [400,'INVALID_AGENT_COMPARE_REQUEST'],[413,'COMPARE_TOO_LARGE'],
  [429,'RATE_LIMITED'],[503,'AGENT_COMPARE_UNAVAILABLE']
 ]){
  let hits=0;
  const result=await compareIndexServers(valid,{fetchImpl:async()=>{
   hits++;return reply({},status);
  }});
  assert.equal(hits,1);
  assert.equal(result.isError,true);
  assert.equal(result.structuredContent.error,code);
 }
});
