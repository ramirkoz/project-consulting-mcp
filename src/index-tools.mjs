// Read-only Index API helpers. No credentials, tracking, dynamic hosts, or raw billing files.
import {indexSearchOutputSchema,indexCapabilitiesOutputSchema,indexStructuredShortlistOutputSchema,indexExactCompareOutputSchema} from './output-schemas.mjs';
const ORIGIN='https://pc.zp.ua';
const TIMEOUT_MS=15000;
const EXACT_COMPARE_NAME=/^[A-Za-z0-9][A-Za-z0-9./_:-]{1,159}$/;

const INVALID={
  400:'INVALID_SEARCH_TERM',
  413:'SEARCH_TOO_LARGE',
  429:'RATE_LIMITED',
  503:'INDEX_UNAVAILABLE'
};
function error(code,message){
  return {isError:true,structuredContent:{error:code,message},
    content:[{type:'text',text:code+': '+message}]};
}
export function validateSearch({query,limit=12,offset=0}={}){
  if(typeof query!=='string'||query.length<2||query.length>56||
     !/^[\p{L}\p{N}_./ -]{2,56}$/u.test(query)||query.trim()!==query)
     return 'Search query must be 2–56 characters: letters, numbers, spaces, underscores, periods, slashes, or dashes.';
  if(!Number.isInteger(limit)||limit<1||limit>24)
     return 'Limit must be between 1 and 24.';
  if(!Number.isInteger(offset)||offset<0||offset>70000)
     return 'Offset must be between 0 and 70000.';
  return null;
}
async function request(path,{method='GET',body,fetchImpl=fetch,timeoutMs=TIMEOUT_MS,errorCodes={}}={}){
  let response;
  for(let attempt=0;attempt<2;attempt++){
    try{
      response=await fetchImpl(ORIGIN+path,{
        method,redirect:'error',
        headers:{
          'Accept':'application/json',
          'User-Agent':'project-consulting-mcp/0.1.3',
          ...(body?{'Content-Type':'application/json'}:{})
        },
        ...(body?{body:JSON.stringify(body)}:{}),
        signal:AbortSignal.timeout(timeoutMs)
      });
      break;
    }catch(err){
      if(attempt===1)
        return error('INDEX_UNAVAILABLE','Index could not be reached. No billing files were sent.');
    }
  }
  if(!response?.ok){
    const code=errorCodes[response?.status]||INVALID[response?.status]||'INDEX_UNAVAILABLE';
    return error(code,response?.status===429?'Rate limit reached. Try again later.':
      response?.status===400?'Check the search term and retry.':
      response?.status===413?'Search request is too large.':
      code==='STRUCTURED_SHORTLIST_UNAVAILABLE'?
      'Structured Index shortlist is not enabled on this server. The published MCP 0.1.1 search remains available.':
      'The Index API is unavailable.');
  }
  let data;
  try{data=await response.json()}catch{
    return error('INVALID_INDEX_RESPONSE','Index returned non-JSON data.');
  }
  if(!data||typeof data!=='object'||Array.isArray(data))
    return error('INVALID_INDEX_RESPONSE','Index returned an unexpected result shape.');
  return data;
}
export async function searchIndex(args={},options={}){
  const failure=validateSearch(args);
  if(failure)return error('INVALID_SEARCH_TERM',failure);
  const {query,limit=12,offset=0}=args;
  const payload=await request('/api/v1/index/agent-purpose-search',{
    method:'POST',body:{search:query,offset,limit},...options
  });
  if(payload.isError)return payload;
  // The Index endpoint defines a metadata-only envelope. A superficially
  // successful HTTP response is not proof that the expected contract is present.
  if(payload.ok!==true||payload.proof!=='metadata_only'||
     payload.taskSuccessVerified!==false||!Array.isArray(payload.items)||
     !Number.isSafeInteger(payload.totalMatches)||payload.items.length>24||
     !indexSearchOutputSchema.safeParse(payload).success)
    return error('INVALID_INDEX_RESPONSE','Index response did not match the public metadata-only contract.');
  const items=payload.items;
  const summary=items.slice(0,limit).map((item,i)=>{
    const name=String(item?.name||item?.title||'Unnamed entry').slice(0,100);
    const desc=String(item?.description||'').replace(/\s+/g,' ').slice(0,180);
    return (i+1)+'. '+name+(desc?' — '+desc:'');
  }).join('\n');
  return {structuredContent:payload,content:[{type:'text',text:
    (summary||'No matching catalog entries.')+
    '\nMetadata only. Listings do not prove uptime, safety, or successful use. Check official records before installing.'}]};
}
export async function indexCapabilities(options={}){
  const payload=await request('/api/v1/index/capabilities',options);
  if(payload.isError)return payload;
  if(payload.ok!==true||payload.product!=='Project Consulting Index'||
     !indexCapabilitiesOutputSchema.safeParse(payload).success)
    return error('INVALID_INDEX_RESPONSE','Capabilities response did not match the Index API contract.');
  return {structuredContent:payload,content:[{type:'text',text:
    'Project Consulting Index capabilities (public API). Listing metadata is not verified task success or safety proof.\n'+
    JSON.stringify(payload).slice(0,3000)}]};
}


// P2.7 source release candidate; Index Agent sidecar was enabled on the live
// server on 2026-11-22. MCP package 0.1.2 is NOT published until owner GO.
const sources=new Set(['RONINFORGE_STATE_OF_MCP','MCP_OFFICIAL_REGISTRY','GITHUB_PUBLIC_REPOSITORY']);
const statuses=new Set(['active','deprecated','candidate','unknown']);
const topKeys=new Set(['query','limit','offset','filters']);
const facetKeys=new Set([
  'sourceCodes','statuses','requireRepositoryUrl','requireEndpointUrl','excludeDeprecated'
]);
const isRecord=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const enumList=(value,allow,max)=>Array.isArray(value)&&value.length<=max&&
  new Set(value).size===value.length&&value.every(s=>typeof s==='string'&&allow.has(s));

export function validateStructuredShortlist(args={}){
  if(!isRecord(args)||Object.keys(args).some(k=>!topKeys.has(k)))
    return 'Unexpected structured shortlist input field.';
  const basic=validateSearch(args);
  if(basic)return basic;
  const filters=args.filters??{};
  if(!isRecord(filters)||Object.keys(filters).some(k=>!facetKeys.has(k))||
     (filters.sourceCodes!==undefined&&!enumList(filters.sourceCodes,sources,3))||
     (filters.statuses!==undefined&&!enumList(filters.statuses,statuses,4))||
     (filters.requireRepositoryUrl!==undefined&&typeof filters.requireRepositoryUrl!=='boolean')||
     (filters.requireEndpointUrl!==undefined&&typeof filters.requireEndpointUrl!=='boolean')||
     (filters.excludeDeprecated!==undefined&&typeof filters.excludeDeprecated!=='boolean'))
    return 'Invalid metadata filter; only documented source, status, and HTTPS URL requirements are allowed.';
  if(filters.excludeDeprecated!==false&&filters.statuses?.includes('deprecated'))
    return 'Cannot select deprecated items while excludeDeprecated is enabled.';
  return null;
}

export async function structuredIndexShortlist(args={},options={}){
  const invalid=validateStructuredShortlist(args);
  if(invalid)return error('INVALID_SHORTLIST_INPUT',invalid);
  const {query,limit=12,offset=0,filters={}}=args;
  const applied={
    sourceCodes:filters.sourceCodes??[],
    statuses:filters.statuses??[],
    requireRepositoryUrl:filters.requireRepositoryUrl??false,
    requireEndpointUrl:filters.requireEndpointUrl??false,
    excludeDeprecated:filters.excludeDeprecated??true
  };
  const payload=await request('/index-agent/v1/agent-structured-shortlist',{
    method:'POST',body:{search:query,limit,offset,filters:applied},
    errorCodes:{503:'STRUCTURED_SHORTLIST_UNAVAILABLE'},...options
  });
  if(payload.isError)return payload;
  if(!indexStructuredShortlistOutputSchema.safeParse(payload).success||
     payload.limit!==limit||payload.offset!==offset||
     payload.items.length>limit||
     payload.totalMatches>payload.eligibleCatalogRows||
     Object.keys(applied).some(key=>JSON.stringify(payload.filtersApplied[key])!==JSON.stringify(applied[key])))
    return error('INVALID_INDEX_RESPONSE','The Index did not return a valid filtered publisher-metadata contract.');
  const summary=payload.items.map((item,i)=>{
    const name=item.name.slice(0,100);
    const label=item.status==='unknown'?'unknown publisher status':item.status+' publisher status';
    return (i+1)+'. '+name+' ['+label+', '+item.verification+']';
  }).join('\n');
  return {
    structuredContent:payload,
    content:[{type:'text',text:
      (summary||'No publisher metadata matches the requested filters.')+
      '\nMetadata only. Registry listing and HTTPS URLs do not verify tool safety, uptime, actual execution, or agent task success.'}]
  };
}


// P1.5f: a fifth read-only MCP tool over the already-live Index Agent route.
// Strictly exact-name comparison; no fuzzy discovery, credential use or tool execution.
export function validateExactCompare(args={}){
 if(!isRecord(args)||Object.keys(args).length!==1||
    !Object.hasOwn(args,'names')||!Array.isArray(args.names)||
    args.names.length<2||args.names.length>4||
    !args.names.every(name=>typeof name==='string'&&EXACT_COMPARE_NAME.test(name))||
    new Set(args.names).size!==args.names.length)
  return 'Provide exactly 2–4 unique MCP server names with supported characters; no additional fields.';
 if(Buffer.byteLength(JSON.stringify({names:args.names}),'utf8')>640)
  return 'Comparison request exceeds the 640-byte limit.';
 return null;
}
export async function compareIndexServers(args={},options={}){
 const invalid=validateExactCompare(args);
 if(invalid)return error('INVALID_AGENT_COMPARE_REQUEST',invalid);
 const names=[...args.names];
 const payload=await request('/index-agent/v1/agent-exact-compare',{
  method:'POST',body:{names},errorCodes:{
   400:'INVALID_AGENT_COMPARE_REQUEST',
   413:'COMPARE_TOO_LARGE',
   429:'RATE_LIMITED',
   503:'AGENT_COMPARE_UNAVAILABLE'
  },...options
 });
 if(payload.isError)return payload;
 if(!indexExactCompareOutputSchema.safeParse(payload).success||
    payload.requested!==names.length||payload.items.length!==names.length||
    payload.found!==payload.items.filter(item=>item.found).length||
    payload.items.some((item,i)=>item.name!==names[i]))
  return error('INVALID_INDEX_RESPONSE',
    'Index exact comparison did not match its bounded publisher-metadata-only contract.');
 const summary=payload.items.map(item=>{
  if(!item.found)return item.name+': not in current local metadata';
  return item.name+': '+item.publisherStatus+' publisher status; '+item.verification;
 }).join('\n');
 return {
  structuredContent:payload,
  content:[{type:'text',text:summary+
   '\nPublisher and dated historical metadata only. This does not verify MCP tool execution, installation, security, task success, or current uptime.'}]
 };
}
