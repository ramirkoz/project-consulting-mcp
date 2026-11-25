import test from 'node:test';
import assert from 'node:assert/strict';
import {installationMetadata} from '../src/index-tools.mjs';

const name='io.github.ramirkoz/project-consulting';
const proof='publisher_declared_installation_metadata_only';
const flags={installationVerified:false,currentUptimeVerified:false,taskSuccessVerified:false};
const item={name,version:'0.1.3',sourceCode:'MCP_OFFICIAL_REGISTRY',sourceUrl:'https://registry.modelcontextprotocol.io/v0.1/servers?search='+encodeURIComponent(name),retrievedAt:'2026-11-24T16:00:00.000Z',packages:[{registryType:'npm',identifier:'@ramirkoz/project-consulting-mcp',version:'0.1.3',registryBaseUrl:null,runtimeHint:null,transport:{type:'stdio',url:null,headers:null,urlTemplateDeclared:false,authMode:null},environmentVariables:null,runtimeArgumentCount:null,packageArgumentCount:null,publisherFileSha256:null}],remotes:null,packageCount:1,remoteCount:null,projectionLimited:true,proof,...flags,securityCertificationVerified:false,installCommand:null,authMode:null,publisherStatus:'active'};
const envelope={ok:true,name,free:true,paymentRequired:false,proof,...flags,found:true,item};
const response=x=>({ok:true,json:async()=>x});
test('P16e strict input, fixed origin and publisher projection',async()=>{
 let calls=0;
 const fetchImpl=async(url,opts)=>{calls++;assert.equal(url,'https://pc.zp.ua/index-agent/v1/agent-installation-metadata');assert.equal(opts.method,'POST');assert.equal(opts.redirect,'error');assert.deepEqual(JSON.parse(opts.body),{name});return response(envelope);};
 for(const args of [{name:'bad name'},{name,extra:true},{names:[name]},null]){
  assert.equal((await installationMetadata(args,{fetchImpl})).isError,true);
 }
 assert.equal(calls,0);
 const result=await installationMetadata({name},{fetchImpl});
 assert.notEqual(result.isError,true);
 assert.deepEqual(result.structuredContent,envelope);
 assert.equal(calls,1);
});
test('P16e absent row and errors, no fabricated success or unsafe metadata',async()=>{
 const run=x=>installationMetadata({name},{fetchImpl:async()=>response(x)});
 assert.equal((await run({...envelope,found:false,item:null})).structuredContent.found,false);
 for(const bad of [{...envelope,found:false},{...envelope,name:'other/server'},{...envelope,item:{...item,installCommand:'npx bad'}},{...envelope,item:{...item,installationVerified:true}},{...envelope,item:{...item,remotes:[{type:'streamable-http',url:'https://example.com/?secret=x',headers:null,urlTemplateDeclared:false,authMode:null}]}},{...envelope,item:{...item,secret:'bad'}}]){
  assert.equal((await run(bad)).isError,true);
 }
 assert.equal((await installationMetadata({name},{fetchImpl:async()=>({ok:false,status:503})})).isError,true);
});
