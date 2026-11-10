// Read-only Index API helpers. No credentials, tracking, dynamic hosts, or raw billing files.
const ORIGIN='https://pc.zp.ua';
const TIMEOUT_MS=15000;
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
async function request(path,{method='GET',body,fetchImpl=fetch,timeoutMs=TIMEOUT_MS}={}){
  let response;
  for(let attempt=0;attempt<2;attempt++){
    try{
      response=await fetchImpl(ORIGIN+path,{
        method,redirect:'error',
        headers:{
          'Accept':'application/json',
          'User-Agent':'project-consulting-mcp/0.1.0',
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
    const code=INVALID[response?.status]||'INDEX_UNAVAILABLE';
    return error(code,response?.status===429?'Rate limit reached. Try again later.':
      response?.status===400?'Check the search term and retry.':
      response?.status===413?'Search request is too large.':'The Index API is unavailable.');
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
     !Number.isSafeInteger(payload.totalMatches)||payload.items.length>24)
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
  if(payload.ok!==true||payload.product!=='Project Consulting Index')
    return error('INVALID_INDEX_RESPONSE','Capabilities response did not match the Index API contract.');
  return {structuredContent:payload,content:[{type:'text',text:
    'Project Consulting Index capabilities (public API). Listing metadata is not verified task success or safety proof.\n'+
    JSON.stringify(payload).slice(0,3000)}]};
}
