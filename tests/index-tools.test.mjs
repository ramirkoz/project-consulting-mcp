import test from 'node:test';
import assert from 'node:assert/strict';
import {searchIndex,indexCapabilities,validateSearch} from '../src/index-tools.mjs';
import {exportGuide,PROVIDERS} from '../src/coster-guide.mjs';
const reply=(body,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body});
test('search validation rejects bad inputs before network',async()=>{
  assert.match(validateSearch({query:'a'}),/2–56/);
  assert.match(validateSearch({query:'a'.repeat(57)}),/2–56/);
  assert.match(validateSearch({query:'abc',limit:25}),/Limit/);
  assert.match(validateSearch({query:'abc',offset:70001}),/Offset/);
  let called=0;
  const out=await searchIndex({query:'?'},{fetchImpl:async()=>{called++;throw Error('should not fetch')}});
  assert.equal(out.isError,true);assert.equal(called,0);
});
test('search forwards bounded query to official API without browser headers',async()=>{
  const seen=[];
  const fetchImpl=async(url,options)=>{
    seen.push({url,options});
    return reply({ok:true,proof:'metadata_only',totalMatches:1,hasMore:false,nextOffset:null,
      items:[{name:'Example',description:'Metadata listing only'}],
      taskSuccessVerified:false,currentUptimeVerified:false});
  };
  const out=await searchIndex({query:'PostgreSQL',limit:3,offset:2},{fetchImpl});
  assert.equal(seen.length,1);
  assert.equal(seen[0].url,'https://pc.zp.ua/api/v1/index/agent-purpose-search');
  assert.equal(seen[0].options.method,'POST');
  assert.deepEqual(JSON.parse(seen[0].options.body),{search:'PostgreSQL',offset:2,limit:3});
  assert.equal(Object.keys(seen[0].options.headers).some(x=>/^(?:origin|sec-fetch-)/i.test(x)),false);
  assert.equal(out.structuredContent.items[0].name,'Example');
  assert.equal(out.structuredContent.taskSuccessVerified,false);
  assert.match(out.content[0].text,/not prove uptime, safety/i);
});
test('HTTP errors 400/413/429/503 do not retry',async()=>{
  const codes=new Map([[400,'INVALID_SEARCH_TERM'],[413,'SEARCH_TOO_LARGE'],
    [429,'RATE_LIMITED'],[503,'INDEX_UNAVAILABLE']]);
  for(const [status,code] of codes){
    let count=0;
    const result=await searchIndex({query:'abc'},{fetchImpl:async()=>{count++;return reply({},status)}});
    assert.equal(result.isError,true);
    assert.equal(result.structuredContent.error,code);
    assert.equal(count,1);
  }
});
test('network errors retry once, never indefinitely',async()=>{
  let count=0;
  const result=await indexCapabilities({fetchImpl:async()=>{
    count++;if(count===1)throw Error('temporary TCP');
    return reply({ok:true,product:'Project Consulting Index',public:true,readOnly:true});
  }});
  assert.equal(count,2);
  assert.equal(result.structuredContent.readOnly,true);
});
test('capabilities stay metadata, not task verification',async()=>{
  const result=await indexCapabilities({fetchImpl:async()=>reply({ok:true,product:'Project Consulting Index',features:['search'],uptimeVerified:false})});
  assert.deepEqual(result.structuredContent,{ok:true,product:'Project Consulting Index',features:['search'],uptimeVerified:false});
  assert.match(result.content[0].text,/not verified task success or safety proof/);
});
test('Coster guide is static, four providers; no local audits',()=>{
  assert.deepEqual(PROVIDERS,['openai','openrouter','anthropic','gemini']);
  const out=exportGuide();
  assert.equal(out.structuredContent.guides.length,4);
  assert.equal(out.structuredContent.phase,'A');
  assert.match(out.content[0].text,/does not read or audit local files/);
  const single=exportGuide('openrouter');
  assert.equal(single.structuredContent.guides.length,1);
  assert.match(single.content[0].text,/single authoritative Spend view/);
});

test('a 200 response without verified metadata-only envelope is NOT treated as a successful search',async()=>{
 const broken=await searchIndex({query:'pdf'},{
   fetchImpl:async()=>reply({ok:true,items:[{name:'untrusted'}],totalMatches:1})
 });
 assert.equal(broken.isError,true);
 assert.equal(broken.structuredContent.error,'INVALID_INDEX_RESPONSE');
 const badCap=await indexCapabilities({
   fetchImpl:async()=>reply({message:'unrelated JSON'})
 });
 assert.equal(badCap.isError,true);
 assert.equal(badCap.structuredContent.error,'INVALID_INDEX_RESPONSE');
});
