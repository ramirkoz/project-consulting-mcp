import test from 'node:test';
import assert from 'node:assert/strict';
import {
  indexSearchOutputSchema,
  indexCapabilitiesOutputSchema,
  costerExportGuideOutputSchema
} from '../src/output-schemas.mjs';
import {searchIndex,indexCapabilities} from '../src/index-tools.mjs';
import {exportGuide} from '../src/coster-guide.mjs';

const reply=(body,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body});
const searchEnvelope=(items=[])=>({
  ok:true,proof:'metadata_only',taskSuccessVerified:false,
  currentUptimeVerified:false,sourceDate:'2026-09-13',
  totalMatches:items.length,offset:0,limit:12,nextOffset:null,
  hasMore:false,items
});

test('empty and real-shaped search payload pass the advertised schema',async()=>{
  const empty=await searchIndex({query:'valid'},{
    fetchImpl:async()=>reply(searchEnvelope())
  });
  assert.equal(indexSearchOutputSchema.safeParse(empty.structuredContent).success,true);

  const entry={name:'io.github.example/experimental',title:'Experimental',
    description:'Unverified publisher metadata only',version:'1.2.3',
    matchField:'name',verification:'REGISTRY_METADATA_ONLY',
    sourceCode:'MCP_OFFICIAL_REGISTRY',repositoryUrl:null,
    status:'active',otherAdditiveField:{source:'future'}};
  const result=await searchIndex({query:'example'},{
    fetchImpl:async()=>reply(searchEnvelope([entry]))
  });
  assert.equal(indexSearchOutputSchema.safeParse(result.structuredContent).success,true);
});

test('unsafe or wrong result claims do not match schema',()=>{
  const bare=searchEnvelope([{name:'some/entry'}]);
  assert.equal(indexSearchOutputSchema.safeParse(bare).success,true);
  assert.equal(indexSearchOutputSchema.safeParse({
    ...bare,taskSuccessVerified:true
  }).success,false);
  assert.equal(indexSearchOutputSchema.safeParse({...bare,proof:'runtime_verified'}).success,false);
  assert.equal(indexSearchOutputSchema.safeParse({...bare,totalMatches:-1}).success,false);
  assert.equal(indexSearchOutputSchema.safeParse({
    ...bare,items:[{name:''}]
  }).success,false);
  assert.equal(indexSearchOutputSchema.safeParse({
    ...bare,items:Array.from({length:25},()=>({name:'valid'}))
  }).success,false);
});

test('capabilities keeps typed identity while permitting additive API flags',async()=>{
  const result=await indexCapabilities({fetchImpl:async()=>reply({
    ok:true,product:'Project Consulting Index',freeAgentPurposeSearch:{
      enabled:true,readOnly:true,taskSuccessVerified:false
    }
  })});
  assert.equal(indexCapabilitiesOutputSchema.safeParse(result.structuredContent).success,true);
  assert.equal(indexCapabilitiesOutputSchema.safeParse({
    ok:true,product:'Not our Index'
  }).success,false);
});

test('static Coster guide validates and retains consent boundary',()=>{
  for(const provider of ['openai','openrouter','anthropic','gemini',undefined]){
    const result=exportGuide(provider);
    assert.equal(costerExportGuideOutputSchema.safeParse(result.structuredContent).success,true);
    assert.match(result.structuredContent.notice,/requires separate explicit consent.*ResearchBundle/i);
  }
  assert.equal(costerExportGuideOutputSchema.safeParse({
    phase:'A',guides:[],notice:'',freeAuditUrl:'https://pc.zp.ua/coster/'
  }).success,false);
});

test('MCP tool errors remain isError, not forged successful output',async()=>{
  const bad=await searchIndex({query:'!'});
  assert.equal(bad.isError,true);
  assert.equal(bad.structuredContent.error,'INVALID_SEARCH_TERM');
  assert.equal(indexSearchOutputSchema.safeParse(bad.structuredContent).success,false);
  // On the wire SDK v2.4 must skip outputSchema validation for isError:
  // tested separately by tests/stdio.test.mjs.
});
