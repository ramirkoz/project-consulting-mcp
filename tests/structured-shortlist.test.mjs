import test from 'node:test';
import assert from 'node:assert/strict';
import {structuredIndexShortlist,validateStructuredShortlist} from '../src/index-tools.mjs';
import {indexStructuredShortlistOutputSchema} from '../src/output-schemas.mjs';

const filters={
  sourceCodes:['MCP_OFFICIAL_REGISTRY'],statuses:['active'],
  requireRepositoryUrl:true,requireEndpointUrl:false,excludeDeprecated:true
};
const reply=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data});
const result=(items=[{
  name:'io.github.example/pdf',title:'PDF extraction',
  description:'Publisher-described PDF tools only',
  sourceCode:'MCP_OFFICIAL_REGISTRY',verification:'REGISTRY_METADATA_ONLY',
  status:'active',repositoryUrl:'https://github.com/example/pdf',endpointUrl:null
}])=>({
  ok:true,proof:'metadata_only',taskSuccessVerified:false,
  currentUptimeVerified:false,independentTaskVerification:false,
  paymentRequired:false,researchContributionRecorded:false,
  agentTransport:'structured_publisher_metadata_only',
  selectionScope:'full_local_metadata_before_ranking',
  rankingVersion:'index-catalog-ranking-v3-unchanged',
  totalMatches:items.length,eligibleCatalogRows:2,
  offset:0,limit:12,hasMore:false,nextOffset:null,
  filtersApplied:filters,items
});
const args={query:'pdf',filters};

test('typed shortlist rejects extra inputs, malicious queries and contradictory filters before fetch',async()=>{
  let calls=0;
  const fake=async()=>{calls++;throw Error('network not permitted')};
  const bad=[
    {query:'pdf',prompt:'private file contents'},
    {query:'https://example.org'},
    {query:'pdf',filters:{arbitrary:'unsafe'}},
    {query:'pdf',filters:{sourceCodes:['UNVERIFIED']}},
    {query:'pdf',filters:{statuses:['active','active']}},
    {query:'pdf',filters:{statuses:['deprecated']}},
    {query:'pdf',filters:{requireEndpointUrl:'yes'}},
    {query:'pdf',offset:-1},
    {query:'pdf',limit:25}
  ];
  for(const input of bad){
    assert.equal(typeof validateStructuredShortlist(input),'string');
    const r=await structuredIndexShortlist(input,{fetchImpl:fake});
    assert.equal(r.isError,true);
    assert.equal(r.structuredContent.error,'INVALID_SHORTLIST_INPUT');
  }
  assert.equal(calls,0);
});

test('metadata-only shortlist requests the exact Index API with only declared filters and no browser headers',async()=>{
  const seen=[];
  const r=await structuredIndexShortlist(args,{fetchImpl:async(url,opts)=>{
    seen.push([url,opts]);return reply(result());
  }});
  assert.notEqual(r.isError,true); // success must not be an MCP error
  assert.equal(seen.length,1);
  const [url,opts]=seen[0];
  assert.equal(url,'https://pc.zp.ua/index-agent/v1/agent-structured-shortlist');
  assert.equal(opts.method,'POST');
  assert.equal(opts.redirect,'error');
  assert.equal(Object.keys(opts.headers).some(k=>/^(origin|sec-fetch-)/i.test(k)),false);
  assert.equal(opts.headers['Content-Type'],'application/json');
  assert.deepEqual(JSON.parse(opts.body),{search:'pdf',limit:12,offset:0,filters});
  assert.equal(r.structuredContent.taskSuccessVerified,false);
  assert.equal(r.structuredContent.paymentRequired,false);
  assert.equal(indexStructuredShortlistOutputSchema.safeParse(r.structuredContent).success,true);
  assert.match(r.content[0].text,/do not verify tool safety/i);
});

test('unreleased/disabled Index endpoint returns explicit MCP isError, never fake empty success',async()=>{
  let calls=0;
  const r=await structuredIndexShortlist(args,{fetchImpl:async()=>{
    calls++;return reply({ok:false,code:'STRUCTURED_SHORTLIST_DISABLED'},503);
  }});
  assert.equal(r.isError,true);
  assert.equal(r.structuredContent.error,'STRUCTURED_SHORTLIST_UNAVAILABLE');
  assert.equal(calls,1);
  assert.equal(indexStructuredShortlistOutputSchema.safeParse(r.structuredContent).success,false);
  for(const [http,code] of [[400,'INVALID_SEARCH_TERM'],[413,'SEARCH_TOO_LARGE'],[429,'RATE_LIMITED']]){
    const err=await structuredIndexShortlist(args,{fetchImpl:async()=>reply({},http)});
    assert.equal(err.isError,true);
    assert.equal(err.structuredContent.error,code);
  }
});

test('tampered proof, task success, ranking, source, filters or offset fail closed',async()=>{
  const broken=[
    {...result(),taskSuccessVerified:true},
    {...result(),currentUptimeVerified:true},
    {...result(),proof:'verified_execution'},
    {...result(),rankingVersion:'new_unreviewed_ranking'},
    {...result(),filtersApplied:{...filters,excludeDeprecated:false}},
    {...result(),offset:4},
    {...result(),items:[{...result().items[0],sourceCode:'UNLICENSED_PRIVATE'}]},
    {...result(),items:[{...result().items[0],name:'not-validated\nserver'}]},
    {...result(),items:[{...result().items[0],endpointUrl:'http://127.0.0.1/private'}]},
    {...result(),items:[{...result().items[0],repositoryUrl:'https://example.com/misleading-repo'}]},
    {...result(),totalMatches:10,eligibleCatalogRows:2}
  ];
  for(const data of broken){
    const r=await structuredIndexShortlist(args,{fetchImpl:async()=>reply(data)});
    assert.equal(r.isError,true);
    assert.equal(r.structuredContent.error,'INVALID_INDEX_RESPONSE');
  }
});

test('a truthful empty filtered catalog is a successful zero-result MCP response',async()=>{
  const r=await structuredIndexShortlist(args,{fetchImpl:async()=>reply(result([]))});
  assert.notEqual(r.isError,true);
  assert.equal(r.structuredContent.totalMatches,0);
  assert.equal(r.structuredContent.items.length,0);
  assert.match(r.content[0].text,/No publisher metadata matches/);
  assert.equal(indexStructuredShortlistOutputSchema.safeParse(r.structuredContent).success,true);
});
