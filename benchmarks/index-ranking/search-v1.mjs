// Local-only ranked matching of dated publisher metadata; not verified AI capabilities.
const QUERY=/^[\p{L}\p{N}_./ -]{2,56}$/u;
const norm=s=>s.normalize('NFKC').toLocaleLowerCase('en-US').trim();
export function searchIndexCatalog(items,query,{limit=12,offset=0}={}){
 if(!Array.isArray(items)||items.length>70000||typeof query!=='string'||
  !QUERY.test(query)||query.trim()!==query||
  !Number.isInteger(limit)||limit<1||limit>24||
  !Number.isInteger(offset)||offset<0||offset>40000)
  return {ok:false,code:'INVALID_CATALOG_SEARCH'};
 const q=norm(query),words=[...new Set(q.split(/[\s._/-]+/u).filter(Boolean))];
 if(!words.length)return {ok:false,code:'INVALID_CATALOG_SEARCH'};
 const ranked=[];let totalMatches=0;
 for(const row of items){
  if(typeof row?.name!=='string'||row.name.length<2||row.name.length>160)continue;
  const name=norm(row.name),title=norm(typeof row.title==='string'?row.title.slice(0,150):'');
  const description=norm(typeof row.description==='string'?row.description.slice(0,550):'');
  if(!words.every(w=>name.includes(w)||title.includes(w)||description.includes(w)))continue;
  totalMatches++;
  let score=name===q?1200:name.startsWith(q)?850:name.includes(q)?500:0;
  if(title.includes(q))score+=200;
  if(description.includes(q))score+=55;
  for(const w of words)score+=name.includes(w)?70:title.includes(w)?30:7;
  const matchField=name.includes(q)||words.every(w=>name.includes(w))?'name':
   title.includes(q)||words.every(w=>title.includes(w))?'title':
   description.includes(q)||words.every(w=>description.includes(w))?'description':'multiple';
  const candidate={row,score,matchField};
  ranked.push(candidate);
 }
 ranked.sort((a,b)=>b.score-a.score||a.row.name.localeCompare(b.row.name,'en'));
 return {ok:true,totalMatches,offset,limit,hasMore:totalMatches>offset+limit,
  proof:'metadata_only',taskSuccessVerified:false,
  items:ranked.slice(offset,offset+limit).map(x=>({...x.row,matchField:x.matchField}))};
}