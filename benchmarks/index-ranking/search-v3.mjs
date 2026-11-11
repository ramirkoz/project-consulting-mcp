// Local-only ranked matching of dated publisher metadata; not verified AI capabilities.
// v3 ranking (proposal 2026-11-11): token matching instead of raw substrings,
// namespace prefixes (io.github., github:) are not searchable text, the
// publisher organisation is a separate signal, unverified GitHub candidates
// and deprecated records rank lower. Same input/output contract as v1.
const QUERY=/^[\p{L}\p{N}_./ -]{2,56}$/u;
const norm=s=>s.normalize('NFKC').toLocaleLowerCase('en-US').trim();
const split=s=>s.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
// Words that describe the packaging, not the purpose of a server.
const GENERIC=new Set(['mcp','server','servers','official','remote','local','the','a','an','for','and','of','to','with','ai']);
function variants(w){
 const out=[w];
 if(w.length>4&&w.endsWith('s'))out.push(w.slice(0,-1));
 return out;
}
// Split "io.github.owner/name", "com.vendor.sub/name" and "github:owner/repo"
// into publisher organisation tokens and the server's own short name.
function parseName(raw){
 const name=norm(raw);
 let ns='',short=name,candidate=false;
 if(name.startsWith('github:')){candidate=true;const rest=name.slice(7);const i=rest.indexOf('/');ns=i>0?rest.slice(0,i):'';short=i>0?rest.slice(i+1):rest;}
 else{const i=name.indexOf('/');if(i>0){ns=name.slice(0,i);short=name.slice(i+1);}}
 let org='';
 if(candidate)org=ns;
 else if(ns.startsWith('io.github.'))org=ns.slice(10);
 else{const labels=ns.split('.');org=labels.length>1?labels[1]:labels[0]||'';}
 return {short,shortTokens:split(short),org,orgTokens:split(org),candidate};
}
const has=(tokens,w)=>variants(w).some(v=>tokens.includes(v));
// "querying"/"databases" still match "query"/"database" (word-prefix, >=4 chars).
const prefix=(tokens,w)=>w.length>=4&&tokens.some(t=>t.startsWith(w));
// Publisher organisation names often carry a brand affix: getsentry, miroapp,
// browserbasehq, perplexityai, mongodb-js, Snowflake-Labs.
const AFFIX=/^(?:get|use|try)|(?:app|hq|labs?|ai|inc|io|dev|js|official)$/g;
const orgIs=(p,w)=>p.org===w||p.orgTokens.includes(w)||p.org.replace(AFFIX,'')===w||p.orgTokens.some(t=>t.replace(AFFIX,'')===w);
const sub=(text,w)=>w.length>=4&&variants(w).some(v=>text.includes(v));
// Tokenize each catalog row once; rows are immutable for the life of the catalog.
const PREPARED=new WeakMap();
function prepared(row){
 let x=PREPARED.get(row);
 if(x)return x;
 const p=parseName(row.name);
 const title=norm(typeof row.title==='string'?row.title.slice(0,150):'');
 const description=norm(typeof row.description==='string'?row.description.slice(0,550):'');
 x={p,title,description,titleTokens:split(title),descTokens:split(description),
  shortCore:p.shortTokens.filter(t=>!GENERIC.has(t))};
 PREPARED.set(row,x);
 return x;
}
// Unvalidated ranking core: caller controls bounds and validation.
// Used by both browser and agent API; the latter permits larger offsets.
export function rankIndexCatalog(items,query,{limit=12,offset=0}={}){
 const q=norm(query),words=[...new Set(split(q))];
 if(!words.length)return {ok:false,code:'INVALID_CATALOG_SEARCH'};
 const meaningful=words.filter(w=>!GENERIC.has(w));
 const need=meaningful.length?meaningful:words;
 const phrase=need.join(' ');
 const ranked=[];let totalMatches=0;
 for(const row of items){
  if(typeof row?.name!=='string'||row.name.length<2||row.name.length>160)continue;
  const {p,title,description,titleTokens,descTokens,shortCore}=prepared(row);
  let score=0,allMatched=true,nameHits=0,titleHits=0,descHits=0,vendor=0;
  for(const w of need){
   let hit=false;
   if(orgIs(p,w)){vendor++;hit=true;}
   else if(sub(p.org,w)){score+=60;hit=true;}
   if(has(p.shortTokens,w)){score+=120;nameHits++;hit=true;}
   else if(sub(p.short,w)){score+=40;nameHits++;hit=true;}
   if(has(titleTokens,w)){score+=60;titleHits++;hit=true;}
   else if(sub(title,w)){score+=15;hit=true;}
   if(has(descTokens,w)){score+=20;descHits++;hit=true;}
   else if(prefix(descTokens,w)||prefix(titleTokens,w)){score+=10;descHits++;hit=true;}
   if(!hit){allMatched=false;break;}
  }
  if(!allMatched)continue;
  totalMatches++;
  const coreText=shortCore.join(' ');
  // A publisher match counts as the vendor's own server only when the server
  // name itself is about the query (or is the vendor's default "/mcp" name).
  // Otherwise namespaces like app.web.* would win every "web" query.
  const nameAboutQuery=shortCore.length===0||shortCore.every(t=>need.some(w=>variants(w).includes(t)))||nameHits>0;
  // Vendor's own server: publisher matches a query word and every other word
  // is in the publisher or server name ("brave search" -> io.github.brave/brave-search-…),
  // or the vendor's default "/mcp" name ("neon postgres" -> com.neon/mcp).
  const restInName=need.every(w=>orgIs(p,w)||has(p.shortTokens,w));
  if(vendor&&nameAboutQuery&&(restInName||shortCore.length===0))score+=400;
  else if(vendor)score+=40;
  const vendorOwn=vendor&&nameAboutQuery&&(restInName||shortCore.length===0);
  if(coreText===phrase)score+=300;                 // name is exactly the query
  if(vendorOwn&&shortCore.length===0)score+=250;  // vendor's default "…/mcp" server
  if(vendorOwn&&shortCore.length&&shortCore.every(t=>need.some(w=>variants(w).includes(t))))score+=150;
  if(need.length>1&&description.includes(phrase))score+=80;
  if(need.length>1&&title.includes(phrase))score+=80;
  if(p.candidate||row.source==='GITHUB_PUBLIC_REPOSITORY')score-=200;
  if(row.status==='deprecated')score-=400;
  const matchField=nameHits===need.length||vendor===need.length?'name':
   titleHits===need.length?'title':descHits===need.length?'description':'multiple';
  ranked.push({row,score,matchField});
 }
 ranked.sort((a,b)=>b.score-a.score||a.row.name.length-b.row.name.length||a.row.name.localeCompare(b.row.name,'en'));
 return {ok:true,totalMatches,offset,limit,hasMore:totalMatches>offset+limit,
  proof:'metadata_only',taskSuccessVerified:false,
  items:ranked.slice(offset,offset+limit).map(x=>({...x.row,matchField:x.matchField}))};
}
export function searchIndexCatalog(items,query,{limit=12,offset=0}={}){
 if(!Array.isArray(items)||items.length>70000||typeof query!=='string'||
  !QUERY.test(query)||query.trim()!==query||
  !Number.isInteger(limit)||limit<1||limit>24||
  !Number.isInteger(offset)||offset<0||offset>40000)
  return {ok:false,code:'INVALID_CATALOG_SEARCH'};
 return rankIndexCatalog(items,query,{limit,offset});
}
