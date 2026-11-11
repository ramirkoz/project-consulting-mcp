// Merge authenticated dated base census with sanitized, automatic official
// Registry overlay. Live metadata is NEVER claimed as verified MCP execution.
const NAME=/^[A-Za-z0-9][A-Za-z0-9./_:-]{1,159}$/;
export function mergeIndexDiscovery(base,overlay){
 if(!base||!Array.isArray(base.items)||!Number.isInteger(base.total)||
    base.items.length!==base.total)throw Error('INVALID_BASE_CENSUS');
 if(!overlay)return {items:base.items,total:base.total,discoveryAdded:0,
  discoveryUpdated:0,discoveryChecked:0,lastDiscoveryUpdate:null};
 if(overlay?.schemaVersion!==1||overlay.kind!=='INDEX_DISCOVERY_OVERLAY_V1'||
    overlay.baseSourceCode!==base.sourceCode||
    overlay.baseSourceDate!==base.sourceDate||
    overlay.taskSuccessVerified!==false||
    overlay.currentMcpUptimeVerified!==false||
    !Array.isArray(overlay.items)||overlay.items.length>20000||
    !Array.isArray(overlay.tombstones)||overlay.tombstones.length>20000||
    overlay.count!==overlay.items.length)
  throw Error('INVALID_DISCOVERY_OVERLAY');
 const seen=new Set(),tombstones=new Set();
 for(const name of overlay.tombstones){
  if(typeof name!=='string'||!NAME.test(name))throw Error('INVALID_TOMBSTONE');
  tombstones.add(name);
 }
 const mapped=new Map();
 for(const row of base.items){
  if(!row||typeof row.name!=='string'||!NAME.test(row.name))continue;
  if(!tombstones.has(row.name))mapped.set(row.name,row);
 }
 let added=0,updated=0,checked=0;
 for(const row of overlay.items){
  if(!row||typeof row.name!=='string'||!NAME.test(row.name)||
     typeof row.title!=='string'||row.title.length>150||
     typeof row.description!=='string'||row.description.length>550||
     typeof row.version!=='string'||row.version.length>60||
     !['MCP_OFFICIAL_REGISTRY','GITHUB_PUBLIC_REPOSITORY'].includes(row.source)||
     (row.source==='MCP_OFFICIAL_REGISTRY'?
      row.verification!=='REGISTRY_METADATA_ONLY':
      row.verification!=='GITHUB_REPOSITORY_METADATA_ONLY')||
     row.status==='deleted'||seen.has(row.name))
   throw Error('INVALID_DISCOVERY_ROW');
  seen.add(row.name);
  if(tombstones.has(row.name))continue;
  if(mapped.has(row.name))updated++;else added++;
  if(row.repositoryCheck==='repository_http_reachable')checked++;
  mapped.set(row.name,row);
 }
 if(mapped.size>70000)throw Error('INDEX_CAPACITY_EXCEEDED');
 return {items:[...mapped.values()],total:mapped.size,
  discoveryAdded:added,discoveryUpdated:updated,
  discoveryChecked:checked,lastDiscoveryUpdate:overlay.generatedAt||null};
}
